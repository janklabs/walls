"use server"

import { getSession } from "../auth"
import { db } from "../db"
import {
  existsFileName,
  getImage,
  getImageMd,
  insertFile,
} from "../db/queries"
import { file } from "../db/schema"
import { buildRemixSvg } from "../remix/svg"
import { RemixConfigSchema, type RemixConfig, type TextBlock } from "../remix/types"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import sharp from "sharp"

type SaveRemixResult =
  | { status: "success"; fileId: number }
  | { status: "error"; message: string }

function blockBoundingBox(
  block: TextBlock,
  imageW: number,
  imageH: number,
): { left: number; top: number; width: number; height: number } {
  const widthPx = Math.max(1, Math.round((block.maxWidthPct / 100) * imageW))

  const lines = block.text.split("\n")
  const numLines = Math.max(1, lines.length)
  const heightPx = Math.max(
    1,
    Math.round(numLines * block.fontSize * block.lineHeight),
  )

  const clampedW = Math.min(widthPx, imageW)
  const clampedH = Math.min(heightPx, imageH)

  const cx = (block.xPct / 100) * imageW
  const cy = (block.yPct / 100) * imageH

  let left = Math.round(cx - clampedW / 2)
  let top = Math.round(cy - clampedH / 2)

  left = Math.max(0, Math.min(imageW - clampedW, left))
  top = Math.max(0, Math.min(imageH - clampedH, top))

  return { left, top, width: clampedW, height: clampedH }
}

async function applyBlurBehindRegions(
  sourceBuf: Buffer,
  blocks: TextBlock[],
  dims: { width: number; height: number },
): Promise<Buffer> {
  const blurBlocks = blocks.filter((b) => b.blurBehind.enabled && b.blurBehind.radius > 0)
  if (blurBlocks.length === 0) return sourceBuf

  let current = sourceBuf
  for (const block of blurBlocks) {
    const box = blockBoundingBox(block, dims.width, dims.height)
    if (box.width <= 0 || box.height <= 0) continue

    const blurred = await sharp(current)
      .extract(box)
      .blur(block.blurBehind.radius)
      .toBuffer()

    current = await sharp(current)
      .composite([{ input: blurred, left: box.left, top: box.top }])
      .toBuffer()
  }
  return current
}

export async function saveRemix(input: {
  sourceId: number
  mode: "overwrite" | "new-variant"
  config: unknown
  name?: string
}): Promise<SaveRemixResult> {
  const session = await getSession()
  if (!session) return { status: "error", message: "Not authenticated" }

  if (session.user.blocked) {
    return { status: "error", message: "Account is blocked" }
  }

  const parsed = RemixConfigSchema.safeParse(input.config)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return {
      status: "error",
      message: firstIssue?.message ?? "Invalid remix config",
    }
  }
  const parsedConfig: RemixConfig = parsed.data

  const sourceMd = await getImageMd(input.sourceId)
  if (!sourceMd) return { status: "error", message: "Source wallpaper not found" }

  const imageBytes = await getImage(sourceMd.name)
  if (!imageBytes) return { status: "error", message: "Source image data not found" }

  const isOwner = sourceMd.uploader.id === session.user.id
  const isAdmin = session.user.isAdmin === true

  if (input.mode === "overwrite") {
    if (!isOwner && !isAdmin) {
      return { status: "error", message: "You do not own this image" }
    }
  }

  const width = sourceMd.width
  const height = sourceMd.height
  if (!width || !height) {
    return { status: "error", message: "Invalid source dimensions" }
  }

  let finalBuf: Buffer
  try {
    const svgString = buildRemixSvg(parsedConfig, width, height, {
      stripBlurMarkers: true,
    })

    const sourceBuf = Buffer.from(imageBytes)
    const blurPrepped = await applyBlurBehindRegions(
      sourceBuf,
      parsedConfig.blocks,
      { width, height },
    )

    finalBuf = await sharp(blurPrepped)
      .composite([{ input: Buffer.from(svgString), top: 0, left: 0 }])
      .toFormat("jpeg")
      .toBuffer()
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to render remix",
    }
  }

  const size = finalBuf.byteLength
  const base64 = Buffer.from(finalBuf).toString("base64")

  let resultFileId: number
  let newVariantId: number | null = null

  if (input.mode === "overwrite") {
    await db
      .update(file)
      .set({
        base64,
        size,
        remixConfig: parsedConfig,
      })
      .where(eq(file.id, input.sourceId))
    resultFileId = input.sourceId
  } else {
    const sourceBasename = sourceMd.name.includes(".")
      ? sourceMd.name.split(".").slice(0, -1).join(".")
      : sourceMd.name

    let resolvedName: string
    const provided = input.name?.trim()
    if (provided && provided.length > 0) {
      const candidate = provided.endsWith(".jpeg") ? provided : `${provided}.jpeg`
      if (await existsFileName(candidate)) {
        return { status: "error", message: "A wallpaper with that name already exists" }
      }
      resolvedName = candidate
    } else {
      let n = 1
      while (await existsFileName(`${sourceBasename}-remix-${n}.jpeg`)) {
        n++
      }
      resolvedName = `${sourceBasename}-remix-${n}.jpeg`
    }

    const inheritsFull = isOwner || isAdmin
    const publicVisibility = inheritsFull ? sourceMd.publicVisibility : false
    const nsfw = inheritsFull ? sourceMd.nsfw : sourceMd.nsfw

    const inserted = await insertFile({
      userId: session.user.id,
      name: resolvedName,
      base64,
      height,
      width,
      size,
      parentId: input.sourceId,
      nsfw,
      publicVisibility,
      remixConfig: parsedConfig,
    })

    newVariantId = inserted.id
    resultFileId = inserted.id
  }

  revalidatePath(`/walls/${input.sourceId}`)

  if (input.mode === "new-variant" && newVariantId !== null) {
    revalidatePath(`/walls/${newVariantId}`)
  }

  if (input.mode === "overwrite") {
    revalidatePath("/")
    revalidatePath("/my-walls")
    console.warn(
      `[saveRemix] overwrite mode: cached image derivatives for "${sourceMd.name}" may remain stale until cacheLife expiry.`,
    )
  }

  return { status: "success", fileId: resultFileId }
}
