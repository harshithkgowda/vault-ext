import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { type NextRequest, NextResponse } from "next/server"

const RAZORPAYX_KEY_ID = process.env.RAZORPAYX_KEY_ID
const RAZORPAYX_KEY_SECRET = process.env.RAZORPAYX_KEY_SECRET

export async function POST(request: NextRequest) {
  try {
    const { purchaseId } = await request.json()

    if (!RAZORPAYX_KEY_ID || !RAZORPAYX_KEY_SECRET) {
      return NextResponse.json({ error: "RazorpayX credentials not configured" }, { status: 500 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("*")
      .eq("id", purchaseId)
      .single()

    if (purchaseError || !purchase) {
      console.error("[v0] Purchase not found:", purchaseError)
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    // Verify buyer is the one confirming delivery
    if (purchase.buyer_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized - only buyer can confirm delivery" }, { status: 401 })
    }

    if (purchase.payment_status === "released") {
      return NextResponse.json({ error: "Payment already released" }, { status: 400 })
    }

    // Get seller's bank account details for payout
    const { data: sellerProfile, error: sellerError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", purchase.seller_id)
      .single()

    if (sellerError || !sellerProfile) {
      console.error("[v0] Seller profile not found:", sellerError)
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
    }

    if (!sellerProfile.razorpayx_fund_account_id) {
      console.error("[v0] Seller bank details not configured")
      return NextResponse.json({ error: "Seller bank account not configured for payouts" }, { status: 400 })
    }

    // Create payout via RazorpayX
    const auth = Buffer.from(`${RAZORPAYX_KEY_ID}:${RAZORPAYX_KEY_SECRET}`).toString("base64")

    const shortId = purchaseId.substring(0, 8)
    const timestamp = Date.now().toString().slice(-6)

    const payoutData = {
      account_number: sellerProfile.bank_account_number,
      fund_account_id: sellerProfile.razorpayx_fund_account_id,
      amount: Math.round(purchase.amount_inr * 100), // Convert to paise
      currency: "INR",
      mode: "NEFT",
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: `PAY${shortId}${timestamp}`,
      narration: `Payment for sale`,
    }

    console.log("[v0] Creating RazorpayX payout for seller:", purchase.seller_id)

    const payoutResponse = await fetch("https://api.razorpay.com/v1/payouts", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payoutData),
    })

    const payoutResult = await payoutResponse.json()

    if (!payoutResponse.ok) {
      console.error("[v0] Payout error:", payoutResult)
      return NextResponse.json(
        { error: payoutResult.error?.description || "Failed to process payout" },
        { status: 400 },
      )
    }

    console.log("[v0] Payout created:", payoutResult.id)

    const adminClient = getAdminClient()

    const { error: updateError } = await adminClient
      .from("purchases")
      .update({
        delivery_confirmed: true,
        payment_status: "released",
      })
      .eq("id", purchaseId)

    if (updateError) {
      console.error("[v0] Purchase update error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    const { error: paymentError } = await adminClient
      .from("payments")
      .update({
        status: "released",
        razorpayx_payout_id: payoutResult.id,
      })
      .eq("purchase_id", purchaseId)

    if (paymentError) {
      console.error("[v0] Payment update error:", paymentError)
      return NextResponse.json({ error: paymentError.message }, { status: 400 })
    }

    console.log("[v0] Payment released successfully via payout:", payoutResult.id)

    return NextResponse.json({
      success: true,
      payoutId: payoutResult.id,
      message: "Delivery confirmed! Payment released to seller via RazorpayX payout.",
    })
  } catch (error: any) {
    console.error("[v0] Error releasing payment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
