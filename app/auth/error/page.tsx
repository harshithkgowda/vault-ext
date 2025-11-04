"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AuthErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>Something went wrong during authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please try signing in again. If the problem persists, contact support.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/auth/login")} className="flex-1">
              Try Again
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
