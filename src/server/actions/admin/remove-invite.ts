"use server"

import { auth } from "@/server/auth"
import { removeInviteById } from "@/server/db/queries"

import { revalidatePath } from "next/cache"

export async function removeInvite(id: number): Promise<{
  success: boolean
  message: string
}> {
  const session = await auth()
  if (!session?.user.isAdmin) {
    return { success: false, message: "Not authorized" }
  }

  await removeInviteById(id)

  revalidatePath("/settings")

  return {
    success: true,
    message: "Invite removed",
  }
}
