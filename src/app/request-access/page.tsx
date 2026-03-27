import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { auth } from "@/server/auth"

import { RequestAccessForm } from "./form"

import { redirect } from "next/navigation"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await auth()
  if (session) redirect("/")

  const email = ((await searchParams).email as string | undefined) ?? ""

  return (
    <div className="flex grow items-center justify-center">
      <Card>
        <CardHeader>
          <div className="relative h-6">
            <h1 className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-center font-clash text-2xl font-semibold text-card-foreground">
              REQUEST ACCESS
            </h1>
            <div className="absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 border-t"></div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-muted-foreground">
            This instance is invite-only. Submit a request and an administrator
            will review it.
          </p>
          <RequestAccessForm initialEmail={email} />
        </CardContent>
      </Card>
    </div>
  )
}
