import { z } from "zod"

export const TextBlockSchema = z.object({
  id: z.string(),
  text: z.string().max(500),
  fontId: z.enum(["satoshi", "clash-display", "fraunces", "jetbrains-mono", "caveat"]),
  fontSize: z.number().min(8).max(400),
  fontWeight: z.enum(["normal", "bold"]),
  italic: z.boolean(),
  alignment: z.enum(["left", "center", "right"]),
  lineHeight: z.number().min(0.5).max(3),
  letterSpacing: z.number().min(-10).max(50),
  maxWidthPct: z.number().min(5).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  autoInverse: z.boolean(),
  xPct: z.number().min(0).max(100),
  yPct: z.number().min(0).max(100),
  outline: z.object({
    enabled: z.boolean(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    width: z.number().min(0).max(20),
  }),
  shadow: z.object({
    enabled: z.boolean(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    offsetX: z.number(),
    offsetY: z.number(),
    blur: z.number().min(0).max(100),
  }),
  backdrop: z.object({
    enabled: z.boolean(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    opacity: z.number().min(0).max(1),
    padding: z.number().min(0).max(100),
  }),
  blurBehind: z.object({
    enabled: z.boolean(),
    radius: z.number().min(0).max(50),
  }),
})

export const RemixConfigSchema = z.object({
  type: z.literal("text-overlay"),
  version: z.literal(1),
  blocks: z.array(TextBlockSchema),
})

export type TextBlock = z.infer<typeof TextBlockSchema>
export type RemixConfig = z.infer<typeof RemixConfigSchema>
