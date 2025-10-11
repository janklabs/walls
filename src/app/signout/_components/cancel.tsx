"use client"

import { Button } from "@/components/ui/button"

import { useRouter } from "next/navigation"

export function CancelAndGoBack() {
  const router = useRouter()

  return (
    <Button
      variant="secondary"
      className="w-full"
      onClick={() => {
        router.back()
      }}
    >
      Cancel
    </Button>
  )
}
