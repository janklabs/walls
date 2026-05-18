import { badgeVariants } from "@/components/ui/badge"

import Link from "next/link"

export function VariantOf({
  parentId,
  parentName,
}: {
  parentId: number
  parentName: string
}) {
  return (
    <Link
      href={`/walls/${parentId}`}
      className={badgeVariants({ variant: "secondary" })}
    >
      Variant of: {parentName}
    </Link>
  )
}
