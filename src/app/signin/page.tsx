import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { auth } from "@/server/auth"

import {
  LoginDiscord,
  LoginGitHub,
  LoginGoogle,
} from "./_components/login-buttons"

import { redirect } from "next/navigation"

export default async function Page() {
  const session = await auth()
  if (session) redirect("/")

  return (
    <div className="flex grow items-center justify-center">
      <Card>
        <CardHeader>
          <div className="relative h-6">
            <h1 className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-center font-clash text-2xl font-semibold text-neutral-800">
              SIGN IN
            </h1>
            <div className="absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 border-t"></div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <LoginDiscord />
          <LoginGoogle />
          <LoginGitHub />
        </CardContent>
      </Card>
    </div>
  )
}
