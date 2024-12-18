"use client"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { SiDiscord } from "react-icons/si"

export function LoginDiscord() {
  return (
    <Button onClick={() => signIn("discord")} className="flex items-center">
      <SiDiscord />
      <p>Login using Discord</p>
    </Button>
  )
}
