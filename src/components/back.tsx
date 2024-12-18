"use client"

import { IoIosArrowBack } from "react-icons/io"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"

export function Back() {
  const router = useRouter()
  return (
    <Button
      variant="secondary"
      className="flex w-fit items-center gap-2"
      onClick={() => {
        router.back()
      }}
    >
      <IoIosArrowBack />
      Back
    </Button>
  )
}
