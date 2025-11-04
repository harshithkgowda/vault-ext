"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Plus, ShoppingBag, Store, TrendingUp } from "lucide-react"
import { VaultLogo } from "@/components/vault-logo"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <VaultLogo className="w-12 h-12" />
                </div>
              </div>
              <CardTitle className="text-3xl">Vault Extension</CardTitle>
              <CardDescription>Secure marketplace with escrow protection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => router.push("/auth/login")} className="w-full" size="lg">
                Sign In
              </Button>
              <Button onClick={() => router.push("/auth/signup")} variant="outline" className="w-full" size="lg">
                Create Account
              </Button>
              <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <VaultLogo className="w-5 h-5" />
                  <span>Secure escrow payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>Real-time listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  <span>Buy and sell safely</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <VaultLogo className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Vault Extension</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Manage your listings and purchases securely</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => router.push("/listings")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Browse Listings
              </CardTitle>
              <CardDescription>Explore all available items for purchase</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all listings from sellers on the platform with secure escrow protection
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => router.push("/seller/create")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Create Listing
              </CardTitle>
              <CardDescription>List an item for sale</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create a new listing to sell your items with secure payment handling
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => router.push("/dashboard/purchases")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                My Purchases
              </CardTitle>
              <CardDescription>View your purchased items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your orders and confirm deliveries to release payments
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => router.push("/dashboard/sales")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                My Sales
              </CardTitle>
              <CardDescription>Manage your listings and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View your sales, pending payments, and active listings</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 pt-12 border-t">
          <h3 className="text-2xl font-bold mb-8">Why Vault Extension?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                <VaultLogo className="w-7 h-7" />
              </div>
              <h4 className="font-semibold">Secure Escrow</h4>
              <p className="text-sm text-muted-foreground">Payments are held securely until delivery is confirmed</p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">Real-time Listings</h4>
              <p className="text-sm text-muted-foreground">Browse and search thousands of active listings instantly</p>
            </div>
            <div className="space-y-2">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">Easy Transactions</h4>
              <p className="text-sm text-muted-foreground">
                Simple checkout with Razorpay integration in Indian Rupees
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Vault Extension - Secure Marketplace with Escrow Protection</p>
          <p className="mt-2">All transactions are protected by our secure payment system</p>
        </div>
      </footer>
    </div>
  )
}
