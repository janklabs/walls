import Image from "next/image"

export function OptimizedImage({
  name,
  width,
  height,
  quality = 80,
  format = "webp",
  className,
  alt,
}: {
  name: string
  width: number
  height: number
  quality?: number
  format?: "webp" | "jpeg" | "avif"
  className?: string
  alt?: string
}) {
  return (
    <Image
      src={`/uploads/${name}?w=${width}&q=${quality}&f=${format}`}
      alt={alt ?? name}
      width={width}
      height={height}
      className={className}
      unoptimized
    />
  )
}
