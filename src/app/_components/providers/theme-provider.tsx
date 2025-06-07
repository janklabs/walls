"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      themes={["light", "dark"]}
      defaultTheme="light"
      attribute="class"
    >
      {children}
    </NextThemesProvider>
  )
}
