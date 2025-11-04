"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut, ShoppingBag, Store } from "lucide-react"
import Link from "next/link"
import { VaultLogo } from "@/components/vault-logo"

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VaultLogo className="w-8 h-8" />
            <span className="text-xl font-bold hidden sm:inline">Vault Extension</span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <VaultLogo className="w-8 h-8" />
          <span className="text-xl font-bold hidden sm:inline">Vault Extension</span>
        </Link>

        {user && (
          <nav className="flex items-center gap-4">
            <Link href="/listings">
              <Button variant="ghost" size="sm" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Browse</span>
              </Button>
            </Link>

            <Link href="/seller/create">
              <Button variant="ghost" size="sm" className="gap-2">
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Sell</span>
              </Button>
            </Link>

            <Link href="/dashboard/purchases">
              <Button variant="ghost" size="sm" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Purchases</span>
              </Button>
            </Link>

            <Link href="/dashboard/sales">
              <Button variant="ghost" size="sm" className="gap-2">
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Sales</span>
              </Button>
            </Link>

            <div className="flex items-center gap-2 pl-4 border-l">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
