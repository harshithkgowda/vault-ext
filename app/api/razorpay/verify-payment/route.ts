import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const RAZORPAYX_KEY_SECRET = process.env.RAZORPAYX_KEY_SECRET

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, listingId } = await request.json()

    if (!RAZORPAYX_KEY_SECRET) {
      return NextResponse.json({ error: "RazorpayX credentials not configured" }, { status: 500 })
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto.createHmac("sha256", RAZORPAYX_KEY_SECRET).update(body).digest("hex")

    if (expectedSignature !== razorpay_signature) {
      console.error("[v0] Signature mismatch. Expected:", expectedSignature, "Got:", razorpay_signature)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Payment verified for user:", user.id)

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single()

    if (listingError || !listing) {
      console.error("[v0] Listing not found:", listingError)
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    const adminClient = getAdminClient()

    const { data: purchase, error: purchaseError } = await adminClient
      .from("purchases")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        amount_inr: listing.price_inr,
        status: "pending",
        payment_status: "hold",
        razorpay_order_id,
        razorpay_payment_id,
      })
      .select()
      .single()

    if (purchaseError) {
      console.error("[v0] Purchase creation error:", purchaseError)
      return NextResponse.json({ error: purchaseError.message }, { status: 400 })
    }

    console.log("[v0] Purchase created:", purchase.id)

    const { error: paymentError } = await adminClient.from("payments").insert({
      purchase_id: purchase.id,
      seller_id: listing.seller_id,
      amount_inr: listing.price_inr,
      status: "hold",
      razorpay_payment_id,
    })

    if (paymentError) {
      console.error("[v0] Payment creation error:", paymentError)
      return NextResponse.json({ error: paymentError.message }, { status: 400 })
    }

    console.log("[v0] Payment record created successfully")

    return NextResponse.json({
      success: true,
      purchaseId: purchase.id,
      message: "Payment verified and purchase created. Payment is on hold.",
    })
  } catch (error: any) {
    console.error("[v0] Error verifying payment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
