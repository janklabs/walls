import { Button } from "@/components/ui/button"
import { auth } from "@/server/auth"
import Image from "next/image"
import Link from "next/link"
import { PiGear, PiGearDuotone } from "react-icons/pi"
import { ThemeToggle } from "./theme-toggle"

export async function Navbar() {
  const session = await auth()
  return (
    <nav className="flex justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <Link
          href="/?redirect=false"
          className="rounded-md px-2 py-1 transition-colors hover:bg-secondary"
        >
          Home
        </Link>
        <Link
          href="/my-walls"
          className="rounded-md px-2 py-1 transition-colors hover:bg-secondary"
        >
          My Walls
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/settings">
          <Button variant="secondary" className="group">
            <div className="relative w-2">
              <PiGear className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 transition-opacity group-hover:opacity-0" />
              <PiGearDuotone className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Button>
        </Link>
        {session ? (
          <Link href={`/profile/${session.user.id}`}>
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
