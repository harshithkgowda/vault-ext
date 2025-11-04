"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"
import Script from "next/script"

interface Listing {
  id: string
  title: string
  price_inr: number
  seller_id: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const [listing, setListing] = useState<Listing | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const listingId = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      const keyResponse = await fetch("/api/razorpay/config")
      const keyData = await keyResponse.json()
      if (keyResponse.ok) {
        setRazorpayKeyId(keyData.keyId)
        console.log("[v0] RazorpayX key loaded successfully")
      } else {
        console.error("[v0] Failed to load RazorpayX key:", keyData.error)
        setError(keyData.error || "Failed to load payment configuration")
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single()

      if (listingError || !listingData) {
        setError("Listing not found")
        setLoading(false)
        return
      }

      if (listingData.seller_id === user.id) {
        setError("You cannot purchase your own listing")
        setLoading(false)
        return
      }

      setListing(listingData)
      setLoading(false)
    }

    fetchData()
  }, [supabase, router, listingId])

  const handlePayment = async () => {
    if (!listing || !user || !razorpayKeyId) return

    setProcessing(true)
    setError("")

    try {
      console.log("[v0] Starting RazorpayX payment process")

      // Create order
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          amount: listing.price_inr,
        }),
      })

      const orderData = await orderResponse.json()

      console.log("[v0] Order response status:", orderResponse.status)
      console.log("[v0] Order data:", orderData)

      if (!orderResponse.ok) {
        setError(orderData.error || "Failed to create order")
        setProcessing(false)
        return
      }

      // Initialize RazorpayX
      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Vault Extension",
        description: listing.title,
        prefill: {
          email: user.email,
        },
        handler: async (response: any) => {
          try {
            console.log("[v0] Payment handler called with response:", response)

            // Verify payment
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                listingId: listing.id,
              }),
            })

            const verifyData = await verifyResponse.json()

            console.log("[v0] Verification response:", verifyData)

            if (!verifyResponse.ok) {
              setError(verifyData.error || "Payment verification failed")
              setProcessing(false)
              return
            }

            setSuccess(true)
            setTimeout(() => {
              router.push("/dashboard/purchases")
            }, 2000)
          } catch (err: any) {
            console.error("[v0] Payment handler error:", err)
            setError(err.message)
            setProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            console.log("[v0] Payment modal dismissed")
            setProcessing(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      console.error("[v0] Payment error:", err)
      setError(err.message)
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>{error || "Listing not found"}</p>
            </div>
            <Button onClick={() => router.push("/listings")} className="w-full mt-4">
              Back to Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <h2 className="text-xl font-semibold">Payment Successful!</h2>
              <p className="text-sm text-muted-foreground">
                Your purchase has been confirmed. Redirecting to dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your purchase before paying</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="border-t border-b py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item</span>
                  <span className="font-medium">{listing.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">₹{listing.price_inr.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">₹{listing.price_inr.toLocaleString("en-IN")}</span>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-2">Payment Protection</p>
                <p>
                  Your payment will be held securely until you confirm delivery. The seller will receive payment only
                  after you confirm.
                </p>
              </div>

              <Button onClick={handlePayment} disabled={processing || !razorpayKeyId} className="w-full" size="lg">
                {processing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : !razorpayKeyId ? (
                  "Loading payment..."
                ) : (
                  "Pay with RazorpayX"
                )}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
