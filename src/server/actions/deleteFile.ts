"use server"

import { getSession } from "../auth"
import { db } from "../db"
import { file } from "../db/schema"

import { eq } from "drizzle-orm"

export async function deleteFile(id: number) {
  const session = await getSession()
  if (!session) {
    return {
      status: "error" as const,
      message: "Not authenticated",
    }
  }

  const owners = await db
    .select({
      owner: file.uploadedBy,
    })
    .from(file)
    .where(eq(file.id, id))
    .limit(1)

  if (!owners[0]) return { status: "error" as const, message: "File not found" }
  if (!session.user.isAdmin && owners[0].owner !== session.user.id) {
    return {
      status: "error" as const,
      message: "Not authorized",
    }
  }

  await db.delete(file).where(eq(file.id, id))

  return {
    status: "success" as const,
  }
}
