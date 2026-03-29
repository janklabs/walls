"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function EmailSignInForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError("Please enter your email address.")
      return
    }

    setIsLoading(true)

    try {
      const { error: signInError } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/",
      })

      if (signInError) {
        if (signInError.status === 403) {
          const body = signInError as { message?: string; redirectTo?: string }
          if (body.redirectTo) {
            router.push(body.redirectTo)
            return
          }
          setError(body.message ?? "Access denied.")
        } else {
          setError(
            signInError.message ?? "Something went wrong. Please try again.",
          )
        }
        setIsLoading(false)
        return
      }

      // Redirect to verify-request page on success
      router.push("/auth/verify-request")
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
