"use server"

import sharp from "sharp"
import { auth } from "../auth"
import { existsFileName, insertFile } from "../db/queries"

function name(basename: string, count: number) {
  return basename + (count > 1 ? `-${count.toString()}` : "") + ".png"
}

export async function uploadFile(file: File) {
  const session = await auth()
  if (!session)
    return {
      status: "error" as const,
      message: "Not authenticated",
    }
  console.log("Upload file", session.user.name, file.name)

  const png = await sharp(await file.arrayBuffer())
    .png()
    .toBuffer()

  console.log("file name", file.name)
  const basename = file.name.split(".").slice(0, -1).join(".")
  console.log("basename", basename)
  let count = 1
  while (await existsFileName(name(basename, count))) {
    count++
  }

  await insertFile({
    userId: session.user.id,
    name: name(basename, count),
    blob: png,
  })

  return {
    status: "success" as const,
  }
}
