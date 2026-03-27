"use server"

import { auth } from "@/server/auth"
import { addInviteEmail, deleteInviteRequest } from "@/server/db/queries"

import { revalidatePath } from "next/cache"

export async function approveRequest(id: number): Promise<{
  success: boolean
  message: string
}> {
  const session = await auth()
  if (!session?.user.isAdmin) {
    return { success: false, message: "Not authorized" }
  }

  // deleteInviteRequest returns the email of the deleted request
  const email = await deleteInviteRequest(id)
  if (!email) {
    return { success: false, message: "Request not found" }
  }

  // Add to the invite list with the approving admin as the inviter
  await addInviteEmail(email, session.user.id)

  revalidatePath("/settings")

  return {
    success: true,
    message: `Approved and invited ${email}`,
  }
}
