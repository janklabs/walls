// Font metadata — id must match TextBlockSchema fontId enum
export const FONTS = [
  { id: "satoshi" as const,        label: "Satoshi",        family: "Satoshi",        file: "Satoshi-Variable.woff2" },
  { id: "clash-display" as const,  label: "Clash Display",  family: "ClashDisplay",   file: "ClashDisplay-Variable.woff2" },
  { id: "fraunces" as const,       label: "Fraunces",       family: "Fraunces",       file: "Fraunces-Variable.woff2" },
  { id: "jetbrains-mono" as const, label: "JetBrains Mono", family: "JetBrainsMono",  file: "JetBrainsMono-Variable.woff2" },
  { id: "caveat" as const,         label: "Caveat",         family: "Caveat",         file: "Caveat-Variable.woff2" },
] as const

export type FontId = (typeof FONTS)[number]["id"]

export function getFontFamily(id: FontId): string {
  const font = FONTS.find((f) => f.id === id)
  if (!font) throw new Error(`Unknown fontId: ${id}`)
  return font.family
}
