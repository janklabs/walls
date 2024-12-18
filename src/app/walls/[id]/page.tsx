import { Back } from "@/components/back"
import { Button } from "@/components/ui/button"
import { auth } from "@/server/auth"
import { getImageMd } from "@/server/db/queries"
import Image from "next/image"
import { notFound } from "next/navigation"
import { DeleteFile } from "./_components/delete-file"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const image = await getImageMd(parseInt((await params).id))
  if (!image) {
    notFound()
  }

  const session = await auth()
  const isOwner = session && session.user.id == image.uploader.id

  return (
    <div className="mx-auto flex w-4/5 flex-grow flex-col justify-center gap-4">
      <div className="flex justify-between">
        <Back />
        {isOwner ? <DeleteFile id={image.id} /> : null}
      </div>
      <Image
        src={`/uploads/${image.name}`}
        alt={image.name}
        width={1920}
        height={800}
        className="mx-auto"
      />
      <div className="flex items-center gap-4">
        <a href={`/uploads/${image.name}`} download>
          <Button>Download</Button>
        </a>
        <a href={`/uploads/${image.name}`} target="_blank">
          <Button variant="secondary">Open in new tab</Button>
        </a>
        <p className="ml-auto">Uploaded by</p>
        <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-2 py-1">
          <Image
            src={image.uploader.image ?? ""}
            alt={image.uploader.name ?? ""}
            width={24}
            height={24}
            className="rounded-full"
          />
          <p>{image.uploader.name}</p>
        </div>
      </div>
    </div>
  )
}
