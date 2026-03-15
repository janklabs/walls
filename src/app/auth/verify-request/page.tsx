import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function VerifyRequestPage() {
  return (
    <div className="flex grow items-center justify-center">
      <Card>
        <CardHeader>
          <div className="relative h-6">
            <h1 className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-center font-clash text-2xl font-semibold text-neutral-800">
              CHECK YOUR EMAIL
            </h1>
            <div className="absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 border-t"></div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2 px-10">
          <p className="max-w-72 text-center text-sm text-muted-foreground">
            A sign-in link has been sent to your email address. Click the link
            in the email to sign in.
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground/70">
            If you don&apos;t see it, check your spam folder.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
