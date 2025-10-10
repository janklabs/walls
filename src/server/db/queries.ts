import { desc, eq } from "drizzle-orm"
import { db } from "."
import { file, users } from "./schema"
import { toByteArray } from "base64-js"

export async function getUploads(userId: string) {
  return await db
    .select({
      id: file.id,
      name: file.name,
      nsfw: file.nsfw,
    })
    .from(file)
    .where(eq(file.uploadedBy, userId))
    .orderBy(desc(file.uploadedAt))
}

export async function existsFileName(name: string) {
  const exists = await db
    .select({
      name: file.name,
    })
    .from(file)
    .where(eq(file.name, name))
    .limit(1)
  return exists.length > 0
}

export async function insertFile({
  userId,
  name,
  base64,
  height,
  width,
  size,
}: {
  userId: string
  name: string
  base64: string
  height: number
  width: number
  size: number
}) {
  await db.insert(file).values({
    name,
    base64,
    uploadedBy: userId,
    height,
    width,
    size,
  })
}

export async function getImage(name: string) {
  const base64 = (
    await db
      .select({
        base64: file.base64,
      })
      .from(file)
      .where(eq(file.name, name))
      .limit(1)
  )[0]?.base64
  return base64 ? toByteArray(base64) : null
}

export async function getImageMd(id: number) {
  const _file_info = await db
    .select({
      id: file.id,
      name: file.name,
      uploadedBy: file.uploadedBy,
      size: file.size,
      height: file.height,
      width: file.width,
      nsfw: file.nsfw,
    })
    .from(file)
    .where(eq(file.id, id))
    .limit(1)

  if (!_file_info[0]) {
    return null
  }
  const file_id = _file_info[0].id
  const file_name = _file_info[0].name
  const file_size = _file_info[0].size
  const file_height = _file_info[0].height
  const file_width = _file_info[0].width
  const file_nsfw = _file_info[0].nsfw

  const uploader = (
    await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, _file_info[0].uploadedBy))
      .limit(1)
  )[0]!

  return {
    id: file_id,
    name: file_name,
    size: file_size,
    width: file_width,
    height: file_height,
    nsfw: file_nsfw,
    uploader: uploader,
  }
}

export async function getHomepageImages() {
  return await db
    .select({
      id: file.id,
      name: file.name,
      nsfw: file.nsfw,
    })
    .from(file)
    .orderBy(desc(file.uploadedAt))
}

export async function updateFile({ id, name }: { id: number; name: string }) {
  await db
    .update(file)
    .set({
      name,
    })
    .where(eq(file.id, id))
}
