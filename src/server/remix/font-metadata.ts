export const FONTS = [
  { id: "satoshi" as const,        label: "Satoshi",        family: "Satoshi Variable",       cssVar: "var(--font-remix-satoshi)",        browserFile: "Satoshi-Variable.woff2",        serverFile: "Satoshi-Variable.ttf" },
  { id: "clash-display" as const,  label: "Clash Display",  family: "Clash Display Variable", cssVar: "var(--font-remix-clash-display)",  browserFile: "ClashDisplay-Variable.woff2",  serverFile: "ClashDisplay-Variable.ttf" },
  { id: "fraunces" as const,       label: "Fraunces",       family: "Fraunces",               cssVar: "var(--font-remix-fraunces)",       browserFile: "Fraunces-Variable.woff2",      serverFile: "Fraunces-Variable.ttf" },
  { id: "jetbrains-mono" as const, label: "JetBrains Mono", family: "JetBrains Mono",         cssVar: "var(--font-remix-jetbrains-mono)", browserFile: "JetBrainsMono-Variable.woff2", serverFile: "JetBrainsMono-Variable.ttf" },
  { id: "caveat" as const,         label: "Caveat",         family: "Caveat",                 cssVar: "var(--font-remix-caveat)",         browserFile: "Caveat-Variable.woff2",        serverFile: "Caveat-Variable.ttf" },
] as const

export type FontId = (typeof FONTS)[number]["id"]

export function getFontFamily(id: FontId): string {
  const font = FONTS.find((f) => f.id === id)
  if (!font) throw new Error(`Unknown fontId: ${id}`)
  return font.family
}

export function getFontCssVar(id: FontId): string {
  const font = FONTS.find((f) => f.id === id)
  if (!font) throw new Error(`Unknown fontId: ${id}`)
  return font.cssVar
}
