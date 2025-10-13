"use server"

import { auth } from "../auth"
import { db } from "../db"
import { settings } from "../db/schema"
import { _getSettings } from "../settings"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function setDefaultPublicVisibility(
  defaultPublicVisibility: boolean,
): Promise<{ success: boolean; message: string }> {
  const user = (await auth())?.user
  if (!user) return { success: false, message: "Not authenticated" }

  const user_settings = await _getSettings(user.id)
  if (user_settings.defaultPublicVisibility === defaultPublicVisibility)
    return { success: true, message: "No change" }

  await db
    .update(settings)
    .set({ defaultPublicVisibility })
    .where(eq(settings.userId, user.id))

  revalidatePath("/settings")

  return {
    success: true,
    message: `Set default visibility to ${defaultPublicVisibility ? "public" : "private"}.`,
  }
}
