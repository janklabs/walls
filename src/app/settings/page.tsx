import { auth } from "@/server/auth"
import { _getSettings } from "@/server/settings"
import { redirect } from "next/navigation"
import { Settings } from "./client"

export default async function Page() {
  const user = (await auth())?.user
  if (!user) redirect("/login")

  const settings = await _getSettings(user.id)

  return <Settings settings={settings} />
}
