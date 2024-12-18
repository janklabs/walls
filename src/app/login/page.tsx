import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import { LoginDiscord } from "./_components/login-discord"

export default async function Page() {
  const session = await auth()
  if (session) redirect("/")

  return (
    <div>
      <LoginDiscord />
    </div>
  )
}
