"use server"

import { auth } from "@/server/auth"
import { getAppSetting, setAppSetting } from "@/server/db/queries"

import { revalidatePath } from "next/cache"

export async function toggleGuestViewing(): Promise<{
  success: boolean
  message: string
}> {
  const session = await auth()
  if (!session?.user.isAdmin) {
    return { success: false, message: "Not authorized" }
  }

  const current = (await getAppSetting("allow_guest_viewing")) !== "false"
  const newValue = !current

  await setAppSetting("allow_guest_viewing", String(newValue))

  revalidatePath("/settings")
  revalidatePath("/")

  return {
    success: true,
    message: `Guest viewing ${newValue ? "enabled" : "disabled"}`,
  }
}
