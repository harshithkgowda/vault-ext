"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, LogOut, TrendingUp } from "lucide-react"

interface Sale {
  id: string
  listing_id: string
  buyer_id: string
  amount_inr: number
  status: string
  payment_status: string
  delivery_confirmed: boolean
  created_at: string
  listings: {
    title: string
  }
  profiles: {
    full_name: string
    email: string
  }
}

interface Listing {
  id: string
  title: string
  price_inr: number
  status: string
  unique_key: string
  created_at: string
}

export default function SalesDashboard() {
  const [sales, setSales] = useState<Sale[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"sales" | "listings">("sales")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Fetch sales
      const { data: salesData, error: salesError } = await supabase
        .from("purchases")
        .select("*, listings(title), profiles(full_name, email)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })

      if (salesError) {
        console.error("Error fetching sales:", salesError)
      } else {
        setSales(salesData || [])
      }

      // Fetch listings
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })

      if (listingsError) {
        console.error("Error fetching listings:", listingsError)
      } else {
        setListings(listingsData || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const totalEarnings = sales.filter((s) => s.payment_status === "released").reduce((sum, s) => sum + s.amount_inr, 0)

  const pendingEarnings = sales.filter((s) => s.payment_status === "hold").reduce((sum, s) => sum + s.amount_inr, 0)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Sales</h1>
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
          <Button variant="outline" onClick={() => router.push("/dashboard/purchases")}>
            My Purchases
          </Button>
          <Button variant="outline" onClick={() => router.push("/seller/create")}>
            Create Listing
          </Button>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground mt-1">Released payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{pendingEarnings.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting delivery confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{listings.filter((l) => l.status === "active").length}</p>
              <p className="text-xs text-muted-foreground mt-1">Currently for sale</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <Button
            variant={activeTab === "sales" ? "default" : "ghost"}
            onClick={() => setActiveTab("sales")}
            className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
          >
            Sales ({sales.length})
          </Button>
          <Button
            variant={activeTab === "listings" ? "default" : "ghost"}
            onClick={() => setActiveTab("listings")}
            className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
          >
            Listings ({listings.length})
          </Button>
        </div>

        {/* Sales Tab */}
        {activeTab === "sales" && (
          <div className="space-y-4">
            {sales.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No sales yet.</p>
                </CardContent>
              </Card>
            ) : (
              sales.map((sale) => (
                <Card key={sale.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{sale.listings.title}</CardTitle>
                        <CardDescription>
                          Buyer: {sale.profiles.full_name} ({sale.profiles.email})
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={sale.status === "completed" ? "default" : "secondary"}>{sale.status}</Badge>
                        <Badge
                          variant={
                            sale.payment_status === "released"
                              ? "default"
                              : sale.payment_status === "hold"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {sale.payment_status === "hold" ? "On Hold" : "Released"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-lg font-semibold">₹{sale.amount_inr.toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="text-lg font-semibold">{new Date(sale.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>

                    {sale.payment_status === "hold" && !sale.delivery_confirmed && (
                      <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Payment is on hold. Waiting for buyer to confirm delivery.
                        </p>
                      </div>
                    )}

                    {sale.delivery_confirmed && (
                      <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Delivery confirmed. Payment has been released to your account.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div className="space-y-4">
            {listings.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">You haven't created any listings yet.</p>
                  <Button onClick={() => router.push("/seller/create")}>Create Your First Listing</Button>
                </CardContent>
              </Card>
            ) : (
              listings.map((listing) => (
                <Card key={listing.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{listing.title}</CardTitle>
                        <CardDescription>Key: {listing.unique_key}</CardDescription>
                      </div>
                      <Badge variant={listing.status === "active" ? "default" : "secondary"}>{listing.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="text-lg font-semibold">₹{listing.price_inr.toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-lg font-semibold">
                          {new Date(listing.created_at).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
