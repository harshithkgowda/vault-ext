"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"
import Header from "@/components/header"

export default function SetupPayoutPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    bank_account_number: "",
    bank_ifsc_code: "",
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Fetch existing payout details
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile) {
        setFormData({
          bank_account_number: profile.bank_account_number || "",
          bank_ifsc_code: profile.bank_ifsc_code || "",
        })
      }

      setLoading(false)
    }

    fetchUser()
  }, [supabase, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      if (!formData.bank_account_number || !formData.bank_ifsc_code) {
        setError("Please fill in all fields")
        setSaving(false)
        return
      }

      // Update profile with bank details
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          bank_account_number: formData.bank_account_number,
          bank_ifsc_code: formData.bank_ifsc_code,
        })
        .eq("id", user.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/sales")
      }, 2000)
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
                <h2 className="text-xl font-semibold">Setup Complete!</h2>
                <p className="text-sm text-muted-foreground">
                  Your payout details have been saved. Redirecting to dashboard...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Setup Payout Details</CardTitle>
            <CardDescription>Add your bank account information to receive payments</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Account Number</label>
                <Input
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleInputChange}
                  placeholder="Enter your bank account number"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">IFSC Code</label>
                <Input
                  type="text"
                  name="bank_ifsc_code"
                  value={formData.bank_ifsc_code}
                  onChange={handleInputChange}
                  placeholder="e.g., SBIN0001234"
                  required
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-2">Secure Payment Processing</p>
                <p>
                  Your bank details are encrypted and securely stored. They are only used to process payouts via
                  RazorpayX.
                </p>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Payout Details"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
