"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  return (
    <Button
      variant="destructive"
      className="w-40"
      onClick={async () => {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/"
            },
          },
        })
      }}
    >
      Sign out
    </Button>
  )
}
