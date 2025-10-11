"use client"

import { cn } from "@/lib/utils"

import { Button } from "./ui/button"

import { useRouter } from "next/navigation"
import { IoIosArrowBack } from "react-icons/io"

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
