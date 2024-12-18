import { ensureAuth } from "@/server/auth"
import { Dropzone } from "./_components/dropzone"
import { getUploads } from "@/server/db/queries"
import Image from "next/image"
import Link from "next/link"

export default async function Page() {
  const session = await ensureAuth()

  const uploads = await getUploads(session.user.id)

  return (
    <div>
      <div className="mb-8 bg-neutral-200 py-8 text-center">
        <h1 className="font-clash text-6xl font-bold uppercase text-neutral-600">
          My Walls
        </h1>
        <p className="font-clash text-neutral-500">
          You have {uploads.length} walls
        </p>
      </div>
      <div className="mx-auto flex w-4/5 flex-col gap-8">
        <Dropzone />
        <div className="grid grid-cols-3 gap-4">
          {uploads.map((upload) => (
            <Link key={upload.id} href={`/walls/${upload.id}`}>
              <Image
                src={`/uploads/${upload.name}`}
                alt={upload.name}
                width={400}
                height={400}
                className="rounded-lg transition-transform hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
