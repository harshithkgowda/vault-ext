import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const keyId = process.env.RAZORPAYX_KEY_ID

  if (!keyId) {
    return NextResponse.json(
      { error: "RazorpayX not configured. Please add RAZORPAYX_KEY_ID to environment variables." },
      { status: 500 },
    )
  }

  return NextResponse.json({ keyId })
}
