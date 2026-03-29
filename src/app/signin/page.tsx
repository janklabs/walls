import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getSession } from "@/server/auth"

import { EmailSignInForm } from "./_components/email-sign-in-form"
import { SignInError } from "./_components/sign-in-error"

import { redirect } from "next/navigation"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getSession()
  if (session) redirect("/")

  const params = await searchParams
  const error = params.error as string | undefined

  return (
    <div className="flex grow items-center justify-center">
      <Card>
        <CardHeader>
          <div className="relative h-6">
            <h1 className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-center font-clash text-2xl font-semibold text-card-foreground">
              SIGN IN
            </h1>
            <div className="absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 border-t"></div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <SignInError error={error} />
          <p className="text-center text-sm text-muted-foreground">
            Enter your email to receive a sign-in link.
          </p>
          <EmailSignInForm />
        </CardContent>
      </Card>
    </div>
  )
}
