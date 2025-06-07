"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { PiMoon, PiSun } from "react-icons/pi"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  return (
    <Button
      variant="secondary"
      onClick={() => {
        setTheme((theme) => (theme === "dark" ? "light" : "dark"))
      }}
    >
      <PiMoon className="hidden dark:block" />
      <PiSun className="block dark:hidden" />
    </Button>
  )
}
