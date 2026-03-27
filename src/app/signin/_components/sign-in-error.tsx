"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { requestInvite } from "@/server/actions/request-invite"

import { useState } from "react"

export function SignInError({ error }: { error?: string }) {
  if (!error) return null

  if (error === "blocked") {
    return (
      <div className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        Your account has been blocked. Contact an administrator for assistance.
      </div>
    )
  }

  if (error === "not-invited") {
    return <NotInvitedError />
  }

  return null
}

function NotInvitedError() {
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    setErrorMsg(null)
    const resp = await requestInvite(email)
    setLoading(false)
    if (resp.success) {
      setSubmitted(true)
    } else {
      setErrorMsg(resp.message)
    }
  }

  if (submitted) {
    return (
      <div className="w-full rounded-md border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
        Your access request has been submitted. An administrator will review it.
      </div>
    )
  }

  return (
    <div className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
      <p>This instance is invite-only.</p>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mt-2 underline underline-offset-2 hover:text-red-700 dark:hover:text-red-300"
        >
          Request access
        </button>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSubmit()
            }}
            disabled={loading}
            className="h-9 border-red-200 bg-white text-foreground dark:border-red-800 dark:bg-red-950"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !email.trim()}
            size="sm"
            className="w-full"
          >
            {loading ? "Submitting..." : "Submit request"}
          </Button>
          {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
        </div>
      )}
    </div>
  )
}
