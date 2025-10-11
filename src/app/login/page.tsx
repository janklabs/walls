import { auth } from "@/server/auth"

import { LoginDiscord } from "./_components/login-discord"

import { redirect } from "next/navigation"

export default async function Page() {
  const session = await auth()
  if (session) redirect("/")

  return (
    <div className="flex flex-grow items-center justify-center">
      <div className="flex w-[400px] flex-col gap-4 rounded-xl border border-black p-4">
        <h1 className="text-center font-clash text-xl font-semibold">Login</h1>
        <LoginDiscord />
      </div>
    </div>
  )
}
