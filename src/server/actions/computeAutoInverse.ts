"use server"

import { getSession } from "../auth"
import { getImage, getImageMd } from "../db/queries"

import sharp from "sharp"

export async function computeAutoInverse(input: {
  sourceId: number
  xPct: number
  yPct: number
  widthPct: number
  heightPct: number
}): Promise<
  | { status: "success"; color: "#fff" | "#111" }
  | { status: "error"; message: string }
> {
  const session = await getSession()
  if (!session) return { status: "error", message: "Not authenticated" }

  const sourceMd = await getImageMd(input.sourceId)
  if (!sourceMd) return { status: "error", message: "Wallpaper not found" }

  const canView =
    sourceMd.publicVisibility ||
    sourceMd.uploader.id === session.user.id ||
    session.user.isAdmin
  if (!canView) return { status: "error", message: "Not authorized" }

  const imageBytes = await getImage(sourceMd.name)
  if (!imageBytes) return { status: "error", message: "Image data not found" }

  const imgW = sourceMd.width
  const imgH = sourceMd.height
  if (!imgW || !imgH) {
    return { status: "error", message: "Invalid source dimensions" }
  }

  const xPct = Math.max(0, Math.min(100, input.xPct))
  const yPct = Math.max(0, Math.min(100, input.yPct))
  const wPct = Math.max(1, Math.min(100, input.widthPct))
  const hPct = Math.max(1, Math.min(100, input.heightPct))

  const regionW = Math.max(1, Math.round((wPct / 100) * imgW))
  const regionH = Math.max(1, Math.round((hPct / 100) * imgH))
  const left = Math.max(
    0,
    Math.min(imgW - regionW, Math.round((xPct / 100) * imgW - regionW / 2)),
  )
  const top = Math.max(
    0,
    Math.min(imgH - regionH, Math.round((yPct / 100) * imgH - regionH / 2)),
  )

  try {
    const stats = await sharp(Buffer.from(imageBytes))
      .extract({ left, top, width: regionW, height: regionH })
      .greyscale()
      .stats()

    const meanLuminance = stats.channels[0]?.mean ?? 128
    const color: "#fff" | "#111" = meanLuminance < 128 ? "#fff" : "#111"
    return { status: "success", color }
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Sharp error",
    }
  }
}
