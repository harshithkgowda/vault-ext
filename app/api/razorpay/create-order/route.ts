import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

const RAZORPAYX_KEY_ID = process.env.RAZORPAYX_KEY_ID
const RAZORPAYX_KEY_SECRET = process.env.RAZORPAYX_KEY_SECRET

export async function POST(request: NextRequest) {
  try {
    const { listingId, amount } = await request.json()

    console.log("[v0] Creating RazorpayX order with credentials check")
    console.log("[v0] Key ID exists:", !!RAZORPAYX_KEY_ID)
    console.log("[v0] Key Secret exists:", !!RAZORPAYX_KEY_SECRET)

    if (!RAZORPAYX_KEY_ID || !RAZORPAYX_KEY_SECRET) {
      return NextResponse.json(
        {
          error:
            "RazorpayX credentials not configured. Please add RAZORPAYX_KEY_ID and RAZORPAYX_KEY_SECRET to environment variables.",
        },
        { status: 500 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const shortId = listingId.substring(0, 8)
    const timestamp = Date.now().toString().slice(-6)
    const receipt = `ORD${shortId}${timestamp}`

    const orderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: receipt,
      notes: {
        listing_id: listingId,
        buyer_id: user.id,
      },
    }

    const auth = Buffer.from(`${RAZORPAYX_KEY_ID}:${RAZORPAYX_KEY_SECRET}`).toString("base64")

    console.log("[v0] Auth header created, attempting RazorpayX API call")
    console.log("[v0] Receipt:", receipt)

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    console.log("[v0] RazorpayX response status:", response.status)

    const order = await response.json()

    console.log("[v0] RazorpayX response:", order)

    if (!response.ok) {
      console.error("[v0] RazorpayX error:", order)
      return NextResponse.json({ error: order.error?.description || "Failed to create order" }, { status: 400 })
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error: any) {
    console.error("[v0] Error creating RazorpayX order:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
