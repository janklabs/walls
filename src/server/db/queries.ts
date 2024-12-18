import { eq } from "drizzle-orm"
import { db } from "."
import { file, users } from "./schema"

export async function getUploads(userId: string) {
  return await db
    .select({
      id: file.id,
      name: file.name,
    })
    .from(file)
    .where(eq(file.uploadedBy, userId))
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
  blob,
}: {
  userId: string
  name: string
  blob: Buffer
}) {
  await db.insert(file).values({
    name,
    blob: blob,
    uploadedBy: userId,
  })
}

export async function getImage(name: string) {
  const image = await db
    .select({
      blob: file.blob,
    })
    .from(file)
    .where(eq(file.name, name))
    .limit(1)
  return image[0]
}

export async function getImageMd(id: number) {
  const _file_info = await db
    .select({
      id: file.id,
      name: file.name,
      uploadedBy: file.uploadedBy,
    })
    .from(file)
    .where(eq(file.id, id))
    .limit(1)

  if (!_file_info[0]) {
    return null
  }
  const file_id = _file_info[0].id
  const file_name = _file_info[0].name

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
    uploader: uploader,
  }
}
