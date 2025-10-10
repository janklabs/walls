import { getImage } from "@/server/db/queries"

export async function GET(
  _: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const image = await getImage((await params).name)
  if (!image) {
    return new Response("Not found", { status: 404 })
  }

  const headers = new Headers()
  headers.set("Content-Type", "image/jpeg")
  return new Response(Buffer.from(image), { headers })
}
