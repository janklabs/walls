import { ensureAuth } from "@/server/auth"
import { Dropzone } from "./_components/dropzone"
import { getUploads } from "@/server/db/queries"
import { InputUrl } from "./_components/input-url"
import { Wall } from "@/components/wall"

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
        <InputUrl />
        <Wall images={uploads} />
      </div>
    </div>
  )
}
