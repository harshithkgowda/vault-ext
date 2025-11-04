"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ListingCardProps {
  id: string
  title: string
  description: string
  price_inr: number
  image_url: string | null
  unique_key: string
  seller_id: string
}

export function ListingCard({ id, title, description, price_inr, image_url, unique_key }: ListingCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all hover:border-primary group">
      {image_url && (
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          <Image
            src={image_url || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">₹{price_inr.toLocaleString("en-IN")}</div>
          <Badge variant="secondary" className="text-xs">
            {unique_key}
          </Badge>
        </div>
        <Link href={`/listings/${id}`} className="block">
          <Button className="w-full" variant="default" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
