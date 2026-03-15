"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { signIn } from "next-auth/react"
import { useState } from "react"

export function EmailSignInForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError("Please enter your email address.")
      return
    }

    setIsLoading(true)

    try {
      await signIn("nodemailer", { email, callbackUrl: "/" })
    } catch {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-72 flex-col gap-3">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        required
        className="h-11"
        autoFocus
      />
      <Button type="submit" disabled={isLoading} className="h-11">
        {isLoading ? "Sending..." : "Send magic link"}
      </Button>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </form>
  )
}
