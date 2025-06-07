import "@/styles/globals.css"
import localFont from "next/font/local"

import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"
import { Navbar } from "./_components/navbar"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "./_components/providers"

export const metadata: Metadata = {
  title: "Walls",
  description: "Beautiful backgrounds for your screens",
}

const ClashDisplay = localFont({
  src: "../../fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash-display",
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${ClashDisplay.variable}`}
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
