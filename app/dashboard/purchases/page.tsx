"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, LogOut, Package } from "lucide-react"

interface Purchase {
  id: string
  listing_id: string
  amount_inr: number
  status: string
  payment_status: string
  delivery_confirmed: boolean
  created_at: string
  listings: {
    title: string
    image_url: string | null
  }
}

export default function PurchasesDashboard() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchPurchases = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      const { data, error } = await supabase
        .from("purchases")
        .select("*, listings(title, image_url)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching purchases:", error)
      } else {
        setPurchases(data || [])
      }

      setLoading(false)
    }

    fetchPurchases()
  }, [supabase, router])

  const handleConfirmDelivery = async (purchaseId: string) => {
    setConfirming(purchaseId)

    try {
      const response = await fetch("/api/razorpay/release-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Error: ${data.error}`)
      } else {
        // Refresh purchases
        const { data: updatedPurchases } = await supabase
          .from("purchases")
          .select("*, listings(title, image_url)")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })

        setPurchases(updatedPurchases || [])
        alert("Delivery confirmed! Payment released to seller.")
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setConfirming(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Purchases</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push("/")}>
            Home
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/sales")}>
            My Sales
          </Button>
          <Button variant="outline" onClick={() => router.push("/listings")}>
            Browse Listings
          </Button>
        </div>

        {purchases.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">You haven't purchased anything yet.</p>
              <Button onClick={() => router.push("/listings")} className="mt-4">
                Browse Listings
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{purchase.listings.title}</CardTitle>
                      <CardDescription>Order ID: {purchase.id.slice(0, 8)}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>
                        {purchase.status}
                      </Badge>
                      <Badge
                        variant={
                          purchase.payment_status === "released"
                            ? "default"
                            : purchase.payment_status === "hold"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {purchase.payment_status === "hold" ? "Payment On Hold" : "Payment Released"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold">₹{purchase.amount_inr.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="text-lg font-semibold">
                        {new Date(purchase.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {purchase.payment_status === "hold" && !purchase.delivery_confirmed && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        Payment is held securely. Confirm delivery to release payment to seller.
                      </p>
                      <Button
                        onClick={() => handleConfirmDelivery(purchase.id)}
                        disabled={confirming === purchase.id}
                        className="w-full"
                      >
                        {confirming === purchase.id ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Delivery
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {purchase.delivery_confirmed && (
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Delivery confirmed. Payment released.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
