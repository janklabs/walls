import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import "@/styles/globals.css"

import { Navbar } from "./_components/navbar"
import { Providers } from "./_components/providers"

import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"
import localFont from "next/font/local"

export const metadata: Metadata = {
  title: "Walls",
  description: "Beautiful backgrounds for your screens",
}

const ClashDisplay = localFont({
  src: "../../fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash-display",
})

const Satoshi = localFont({
  src: [
    {
      path: "../../fonts/Satoshi-Variable.woff2",
      style: "normal",
    },
    {
      path: "../../fonts/Satoshi-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        GeistSans.variable,
        ClashDisplay.variable,
        Satoshi.variable,
      )}
      suppressHydrationWarning
    >
      <body className="flex h-screen flex-col dark:bg-black">
        <Providers>
          <Navbar />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
