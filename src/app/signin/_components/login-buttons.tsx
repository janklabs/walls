"use client"

import { FancyHoverIcon } from "@/components/fancy-hover-icon"
import { Button } from "@/components/ui/button"

import { signIn } from "next-auth/react"
import {
  PiDiscordLogo,
  PiDiscordLogoDuotone,
  PiGithubLogo,
  PiGithubLogoDuotone,
  PiGoogleLogo,
  PiGoogleLogoDuotone,
} from "react-icons/pi"

function LoginButton({
  authProvider,
  providerName,
  providerIconHover,
  providerIconNoHover,
}: {
  authProvider: string
  providerName: string
  providerIconHover: React.ReactNode
  providerIconNoHover: React.ReactNode
}) {
  return (
    <Button
      onClick={() => signIn(authProvider)}
      className="group flex w-64 items-center py-6"
      variant="secondary"
    >
      <FancyHoverIcon
        className="w-12"
        hover={providerIconHover}
        nohover={providerIconNoHover}
      />
      <p className="grow font-sans text-lg">Sign in with {providerName}</p>
    </Button>
  )
}

export function LoginDiscord() {
  return (
    <LoginButton
      authProvider="discord"
      providerName="Discord"
      providerIconHover={<PiDiscordLogoDuotone className="scale-150" />}
      providerIconNoHover={<PiDiscordLogo className="scale-150" />}
    />
  )
}

export function LoginGitHub() {
  return (
    <LoginButton
      authProvider="github"
      providerName="GitHub"
      providerIconHover={
        <PiGithubLogoDuotone className="scale-150 text-black" />
      }
      providerIconNoHover={<PiGithubLogo className="scale-150" />}
    />
  )
}

export function LoginGoogle() {
  return (
    <LoginButton
      authProvider="google"
      providerName="Google"
      providerIconHover={<PiGoogleLogoDuotone className="scale-150" />}
      providerIconNoHover={<PiGoogleLogo className="scale-150" />}
    />
  )
}
