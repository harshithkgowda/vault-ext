"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">{error.message || "An unexpected error occurred"}</p>
            <div className="flex gap-2 w-full">
              <Button onClick={() => reset()} className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => (window.location.href = "/")} variant="outline" className="flex-1">
                Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
