"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import Image from "next/image"

interface Listing {
  id: string
  title: string
  description: string
  price_inr: number
  image_url: string | null
  unique_key: string
  seller_id: string
  category: string
  created_at: string
}

interface SellerProfile {
  full_name: string
  email: string
}

export default function ListingDetailPage() {
  const [listing, setListing] = useState<Listing | null>(null)
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const listingId = params.id as string

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

      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single()

      if (listingError) {
        console.error("Error fetching listing:", listingError)
        router.push("/listings")
        return
      }

      setListing(listingData)

      const { data: sellerData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", listingData.seller_id)
        .single()

      setSeller(sellerData)
      setLoading(false)
    }

    fetchData()
  }, [supabase, router, listingId])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!listing) {
    return <div className="flex items-center justify-center min-h-screen">Listing not found</div>
  }

  const isOwnListing = user?.id === listing.seller_id

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Image */}
          <div className="md:col-span-2">
            {listing.image_url ? (
              <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                <Image
                  src={listing.image_url || "/placeholder.svg"}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{listing.title}</CardTitle>
                <CardDescription>{listing.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Price</p>
                  <p className="text-4xl font-bold text-primary">₹{listing.price_inr.toLocaleString("en-IN")}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Unique Key</p>
                  <Badge variant="secondary" className="text-base py-1 px-3">
                    {listing.unique_key}
                  </Badge>
                </div>

                {seller && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Seller</p>
                    <p className="font-semibold">{seller.full_name}</p>
                    <p className="text-sm text-muted-foreground">{seller.email}</p>
                  </div>
                )}

                {!isOwnListing && (
                  <Button className="w-full" size="lg" onClick={() => router.push(`/checkout/${listing.id}`)}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                )}

                {isOwnListing && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">This is your listing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">{listing.description}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
