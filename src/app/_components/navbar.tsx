import { Button } from "@/components/ui/button"
import { auth } from "@/server/auth"
import Image from "next/image"
import Link from "next/link"

export async function Navbar() {
  const session = await auth()
  return (
    <nav className="flex justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <Link href="/">Home</Link>
        <Link href="/my-walls">My Walls</Link>
      </div>
      <div>
        {session ? (
          <Link href="/profile">
            <Button variant="secondary">
              <Image
                src={session.user.image ?? ""}
                alt={session.user.name ?? ""}
                width={24}
                height={24}
                className="rounded-full"
              />
              {session.user.name}
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="secondary">Log In</Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
