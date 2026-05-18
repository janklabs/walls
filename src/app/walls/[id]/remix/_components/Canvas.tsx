"use client"

import type { TextBlock } from "@/server/remix/types"

import { TextBlockNode } from "./TextBlockNode"

type CanvasProps = {
  sourceName: string
  sourceWidth: number
  sourceHeight: number
  blocks: TextBlock[]
  selectedBlockId: string | null
  onSelect: (id: string | null) => void
  onChange: (block: TextBlock) => void
  onDelete: (id: string) => void
}

const FONT_FAMILIES: Record<TextBlock["fontId"], string> = {
  satoshi: "Satoshi",
  "clash-display": "ClashDisplay",
  fraunces: "Fraunces",
  "jetbrains-mono": "JetBrainsMono",
  caveat: "Caveat",
}

function getTextAnchor(alignment: TextBlock["alignment"]): "start" | "middle" | "end" {
  if (alignment === "left") return "start"
  if (alignment === "right") return "end"
  return "middle"
}

export function Canvas({
  sourceName,
  sourceWidth,
  sourceHeight,
  blocks,
  selectedBlockId,
  onSelect,
  onChange,
  onDelete,
}: CanvasProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border bg-muted shadow-inner"
      style={{ paddingBottom: `${(sourceHeight / sourceWidth) * 100}%` }}
      onClick={() => onSelect(null)}
    >
      <img
        src={`/uploads/${sourceName}`}
        alt="Remix source"
        className="absolute inset-0 size-full object-cover"
        draggable={false}
      />
      <svg
        className="pointer-events-none absolute inset-0 size-full"
        viewBox={`0 0 ${sourceWidth} ${sourceHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {blocks.map((block) => (
          <text
            key={block.id}
            x={(block.xPct / 100) * sourceWidth}
            y={(block.yPct / 100) * sourceHeight}
            fontFamily={FONT_FAMILIES[block.fontId]}
            fontSize={block.fontSize}
            fontWeight={block.fontWeight === "bold" ? 700 : 400}
            fontStyle={block.italic ? "italic" : "normal"}
            fill={block.color}
            textAnchor={getTextAnchor(block.alignment)}
            dominantBaseline="middle"
            letterSpacing={block.letterSpacing}
            stroke={block.outline.enabled && block.outline.width > 0 ? block.outline.color : undefined}
            strokeWidth={block.outline.enabled && block.outline.width > 0 ? block.outline.width : undefined}
            paintOrder={block.outline.enabled && block.outline.width > 0 ? "stroke fill" : undefined}
            strokeLinejoin={block.outline.enabled && block.outline.width > 0 ? "round" : undefined}
          >
            {block.text}
          </text>
        ))}
      </svg>
      {blocks.map((block) => (
        <TextBlockNode
          key={block.id}
          block={block}
          isSelected={block.id === selectedBlockId}
          canvasWidth={sourceWidth}
          canvasHeight={sourceHeight}
          onSelect={onSelect}
          onChange={onChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
