import { auth } from "@/server/auth"
import { _getSettings } from "@/server/settings"

import { Settings } from "./client"

import { redirect } from "next/navigation"

export default async function Page() {
  const user = (await auth())?.user
  if (!user) redirect("/login")

  const settings = await _getSettings(user.id)

  return <Settings settings={settings} />
}
