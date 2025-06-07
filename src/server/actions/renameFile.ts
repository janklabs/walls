"use server"

import { revalidatePath } from "next/cache"
import { auth } from "../auth"
import { existsFileName, updateFile } from "../db/queries"

function name(basename: string, count: number) {
  return basename + (count > 1 ? `-${count.toString()}` : "") + ".jpeg"
}

export async function renameFile({
  id,
  basename,
}: {
  id: number
  basename: string
}) {
  const session = await auth()
  if (!session)
    return {
      status: "error" as const,
      message: "Not authenticated",
    }

  console.log("basename", basename)
  let count = 1
  while (await existsFileName(name(basename, count))) {
    count++
  }

  const newName = name(basename, count)
  await updateFile({
    id,
    name: newName,
  })

  revalidatePath(`/walls/${id}`)

  return {
    status: "success" as const,
    message: `Renamed to ${newName}`,
  }
}
