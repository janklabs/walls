import { getHomepageImages } from "@/server/db/queries"
import Image from "next/image"
import Link from "next/link"

export default async function HomePage() {
  const images = await getHomepageImages()
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center bg-neutral-200 py-16">
        <h1 className="font-clash text-6xl font-bold uppercase">Walls</h1>
        <h2 className="font-clash text-2xl">Backgrounds for your screens</h2>
      </div>
      <div className="mx-auto grid w-4/5 grid-cols-3 gap-4">
        {images.map((image) => (
          <Link key={image.id} href={`/walls/${image.id}`}>
            <Image
              src={`/uploads/${image.name}`}
              alt={image.name}
              width={400}
              height={400}
              className="rounded-lg transition-transform hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
