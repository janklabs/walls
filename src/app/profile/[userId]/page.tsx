import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wall } from "@/components/wall"
import { db } from "@/server/db"
import { getUploads } from "@/server/db/queries"
import { users } from "@/server/db/schema"

import { eq } from "drizzle-orm"
import moment from "moment"
import { notFound } from "next/navigation"

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const user = (await db.select().from(users).where(eq(users.id, userId)))[0]

  if (!user) notFound()

  const uploads = await getUploads(user.id)

  return (
    <div className="mx-auto w-4/5">
      <div className="mt-8 flex items-center justify-between rounded-xl border bg-neutral-200 p-4 shadow-xl dark:bg-neutral-800">
        <div className="flex items-center gap-4">
          <Avatar className="size-10">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
            <AvatarFallback>{user.name![0]!}</AvatarFallback>
          </Avatar>
          <div className="text-xl font-semibold">{user.name}</div>
        </div>
        <div className="flex flex-col items-end text-neutral-500">
          <div>{uploads.length} walls</div>
          <div>Joined {moment(user.joinedAt).fromNow()}</div>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-8">
        <Wall images={uploads} />
      </div>
    </div>
  )
}
