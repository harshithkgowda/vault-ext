"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Page Not Found</h1>
            <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
