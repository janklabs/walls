import "server-only"

import fs from "fs"
import path from "path"

import { FONTS, getFontFamily } from "./font-metadata"

export type { FontId } from "./font-metadata"
export { FONTS, getFontFamily }

// Compute once at module load — synchronous, cached
const fontsDir = path.join(process.cwd(), "fonts")

const embeddedFontFaceCss: string = FONTS.map((font) => {
  const filePath = path.join(fontsDir, font.file)
  const base64 = fs.readFileSync(filePath).toString("base64")
  return `@font-face { font-family: "${font.family}"; src: url("data:font/woff2;base64,${base64}") format("woff2"); font-weight: 100 900; font-style: normal oblique; }`
}).join("\n")

/** Returns all 5 @font-face rules with base64-inlined woff2 data. Use inside SVG <defs><style><![CDATA[...]]></style></defs>. */
export function getEmbeddedFontFaceCss(): string {
  return embeddedFontFaceCss
}
