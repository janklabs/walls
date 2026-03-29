import { getImage, getOptimizedImage } from "@/server/db/queries"
import { canAccessAsGuest } from "@/server/guest-access"

const VALID_FORMATS = ["webp", "jpeg", "avif"] as const
type ImageFormat = (typeof VALID_FORMATS)[number]

const CONTENT_TYPES: Record<ImageFormat, string> = {
  webp: "image/webp",
  jpeg: "image/jpeg",
  avif: "image/avif",
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const allowed = await canAccessAsGuest()
  if (!allowed) {
    return new Response("Unauthorized", { status: 401 })
  }

  const name = (await params).name
  const url = new URL(req.url)
  const w = url.searchParams.get("w")
  const q = url.searchParams.get("q")
  const f = url.searchParams.get("f")

  // Optimized path: w param present → resize + format conversion
  if (w) {
    const width = parseInt(w)
    const quality = q ? parseInt(q) : 80

    if (
      isNaN(width) ||
      width <= 0 ||
      isNaN(quality) ||
      quality < 1 ||
      quality > 100
    ) {
      return new Response("Invalid parameters", { status: 400 })
    }

    const format: ImageFormat =
      f && VALID_FORMATS.includes(f as ImageFormat)
        ? (f as ImageFormat)
        : "webp"

    const image = await getOptimizedImage(name, width, quality, format)
    if (!image) {
      return new Response("Not found", { status: 404 })
    }

    const buffer = Buffer.from(image)
    return new Response(buffer, {
      headers: {
        "Content-Type": CONTENT_TYPES[format],
        "Content-Length": buffer.byteLength.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  }

  // Raw path: no params → original JPEG (for downloads)
  const image = await getImage(name)
  if (!image) {
    return new Response("Not found", { status: 404 })
  }

  const buffer = Buffer.from(image)
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": buffer.byteLength.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
