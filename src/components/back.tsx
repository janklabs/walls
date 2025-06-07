"use client"

import { IoIosArrowBack } from "react-icons/io"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export function Back({ className }: { className?: string }) {
  const router = useRouter()
  return (
    <Button
      variant="secondary"
      className={cn("flex w-fit items-center gap-2", className)}
      onClick={() => {
        router.back()
      }}
    >
      <IoIosArrowBack />
      Back
    </Button>
  )
}
