"use client"

import { Label } from "@/components/ui/label"

import type React from "react"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Users, Clock, Send } from "lucide-react"
import type { Payout, Contact } from "@/types" // Assuming these types are declared somewhere

const fetchPayouts = async () => {
  // Implementation of fetchPayouts function
}

export default function DashboardPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedContact, setSelectedContact] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [purpose, setPurpose] = useState<string>("")
  const [narration, setNarration] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedContact || !amount || !purpose) {
      setError("Please fill in all required fields")
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact_id: selectedContact,
          amount: amountNum * 100, // Convert to paise
          purpose,
          narration: narration || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create payout")
      }

      const data = await response.json()

      // Reset form
      setSelectedContact("")
      setAmount("")
      setPurpose("")
      setNarration("")

      // Refresh payouts list
      fetchPayouts()

      alert("Payout created successfully!")
    } catch (error) {
      console.error("Error creating payout:", error)
      setError(error instanceof Error ? error.message : "Failed to create payout")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Payout Dashboard</h1>
          <p className="text-muted-foreground">Manage your RazorpayX payouts</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{payouts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{contacts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active beneficiaries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{payouts.filter((p) => p.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Payout</CardTitle>
              <CardDescription>Send money to a registered contact</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">{error}</div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact *</Label>
                  <Select value={selectedContact} onValueChange={setSelectedContact} required>
                    <SelectTrigger id="contact">
                      <SelectValue placeholder="Select a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} - {contact.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Select value={purpose} onValueChange={setPurpose} required>
                    <SelectTrigger id="purpose">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="cashback">Cashback</SelectItem>
                      <SelectItem value="payout">Payout</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="utility_bill">Utility Bill</SelectItem>
                      <SelectItem value="vendor_bill">Vendor Bill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="narration">Narration (Optional)</Label>
                  <Input
                    id="narration"
                    placeholder="Add a note"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Creating Payout...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Create Payout
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payouts</CardTitle>
              <CardDescription>Your latest payout transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No payouts yet</p>
                  <p className="text-sm text-muted-foreground">Create your first payout to get started</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">₹{(payout.amount / 100).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{payout.purpose}</p>
                        {payout.narration && <p className="text-xs text-muted-foreground mt-1">{payout.narration}</p>}
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            payout.status === "processed"
                              ? "default"
                              : payout.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {payout.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(payout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Registered Contacts</CardTitle>
            <CardDescription>Manage your payout beneficiaries</CardDescription>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No contacts yet</p>
                <p className="text-sm text-muted-foreground">Add contacts to start sending payouts</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                      <Badge variant="outline">{contact.type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Contact: {contact.contact}</p>
                      {contact.notes && <p>Notes: {contact.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
