import { Back } from "@/components/back"
import { Button } from "@/components/ui/button"
import { auth } from "@/server/auth"
import { getImageMd } from "@/server/db/queries"
import Image from "next/image"
import { notFound } from "next/navigation"
import { DeleteFile } from "./_components/delete-file"
import prettyBytes from "pretty-bytes"
import { Badge } from "@/components/ui/badge"
import { RenameFile } from "./_components/rename-file"
import { Nsfw } from "./_components/nsfw"
import Link from "next/link"

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
  const isAdmin = !!session?.user.isAdmin

  return (
    <div className="mx-auto flex flex-grow flex-col gap-4 p-4 md:w-4/5 md:justify-center md:p-0">
      <div className="flex items-center gap-2">
        <Back />
        {isOwner || isAdmin ? (
          <>
            <Nsfw id={image.id} nsfw={image.nsfw} />
            <div className="col-start-2 flex justify-end gap-2">
              <RenameFile id={image.id} name={image.name} />
              <DeleteFile id={image.id} />
            </div>
          </>
        ) : null}
      </div>
      <div className="text-center">{image.name}</div>
      <Image
        src={`/uploads/${image.name}`}
        alt={image.name}
        width={1920}
        height={800}
        className="mx-auto my-auto max-h-[60vh] max-w-[80vw] object-contain md:my-0"
      />
      <div className="md:grid-rows-0 grid grid-cols-2 grid-rows-2 gap-4 md:grid-cols-3">
        <div className="col-span-2 row-start-2 flex items-center justify-between gap-4 md:col-span-1 md:row-start-1 md:justify-normal">
          <a
            href={`/uploads/${image.name}`}
            download
            className="w-full md:w-auto"
          >
            <Button className="w-full">Download</Button>
          </a>
          <a
            href={`/uploads/${image.name}`}
            target="_blank"
            className="w-full md:w-auto"
          >
            <Button variant="secondary" className="w-full">
              Open in new tab
            </Button>
          </a>
        </div>
        <div className="row-start-1 flex items-center justify-end gap-4">
          <Badge>
            {image.width}x{image.height}
          </Badge>
          <Badge>{prettyBytes(image.size)}</Badge>
        </div>
        <div className="flex items-center gap-4">
          <p className="ml-auto hidden md:block">Uploaded by</p>
          <Link
            href={`/profile/${image.uploader.id}`}
            className="flex items-center gap-2 rounded-lg bg-neutral-100 px-2 py-1 dark:bg-neutral-900"
          >
            <Image
              src={image.uploader.image ?? ""}
              alt={image.uploader.name ?? ""}
              width={24}
              height={24}
              className="rounded-full"
            />
            <p>{image.uploader.name}</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
