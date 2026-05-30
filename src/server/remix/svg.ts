import { getFontFamily } from "./font-metadata"
import type { RemixConfig, TextBlock } from "./types"

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function escapeXmlAttr(input: string): string {
  return escapeXml(input)
}

const CHAR_WIDTH_FACTOR = 0.55

function wrapText(
  text: string,
  maxWidthPx: number,
  fontSize: number,
): string[] {
  const approxCharPx = fontSize * CHAR_WIDTH_FACTOR
  if (approxCharPx <= 0 || maxWidthPx <= 0) return [text]
  const maxChars = Math.max(1, Math.floor(maxWidthPx / approxCharPx))

  const words = text.split(/\s+/)
  const wrappedLines: string[] = []
  let currentLine = ""

  for (const word of words) {
    if (word.length === 0) continue
    const candidate = currentLine.length === 0 ? word : `${currentLine} ${word}`
    if (candidate.length <= maxChars) {
      currentLine = candidate
      continue
    }
    if (currentLine.length > 0) {
      wrappedLines.push(currentLine)
      currentLine = ""
    }
    if (word.length > maxChars) {
      let remaining = word
      while (remaining.length > maxChars) {
        wrappedLines.push(remaining.slice(0, maxChars))
        remaining = remaining.slice(maxChars)
      }
      currentLine = remaining
    } else {
      currentLine = word
    }
  }
  if (currentLine.length > 0) wrappedLines.push(currentLine)
  return wrappedLines.length > 0 ? wrappedLines : [""]
}

function estimateTextBoundingBox(
  text: string,
  fontSize: number,
  lineHeight: number,
  maxWidthPx: number,
): { width: number; height: number; lines: string[] } {
  const rawLines = text.split("\n")
  const approxCharPx = fontSize * CHAR_WIDTH_FACTOR
  const maxChars = Math.max(1, Math.floor(maxWidthPx / approxCharPx))

  const allLines: string[] = []
  for (const rawLine of rawLines) {
    if (rawLine.length === 0) {
      allLines.push("")
      continue
    }
    if (rawLine.length <= maxChars) {
      allLines.push(rawLine)
    } else {
      const wrapped = wrapText(rawLine, maxWidthPx, fontSize)
      for (const wrappedLine of wrapped) allLines.push(wrappedLine)
    }
  }

  const longestLineLength = allLines.reduce(
    (currentMax, line) => Math.max(currentMax, line.length),
    0,
  )
  const widthPx = Math.min(maxWidthPx, longestLineLength * approxCharPx)
  const heightPx = allLines.length * fontSize * lineHeight

  return { width: widthPx, height: heightPx, lines: allLines }
}

function getTextAnchor(alignment: TextBlock["alignment"]): string {
  if (alignment === "left") return "start"
  if (alignment === "right") return "end"
  return "middle"
}

function getAnchorX(
  alignment: TextBlock["alignment"],
  bboxLeft: number,
  bboxWidth: number,
): number {
  if (alignment === "left") return bboxLeft
  if (alignment === "right") return bboxLeft + bboxWidth
  return bboxLeft + bboxWidth / 2
}

function renderBlock(
  block: TextBlock,
  imageW: number,
  imageH: number,
  stripBlurMarkers: boolean,
): string {
  const centerX = (block.xPct / 100) * imageW
  const centerY = (block.yPct / 100) * imageH
  const maxWidthPx = (block.maxWidthPct / 100) * imageW

  const {
    width: bboxWidth,
    height: bboxHeight,
    lines,
  } = estimateTextBoundingBox(
    block.text,
    block.fontSize,
    block.lineHeight,
    maxWidthPx,
  )

  const bboxLeft = centerX - bboxWidth / 2
  const bboxTop = centerY - bboxHeight / 2

  const anchorX = getAnchorX(block.alignment, bboxLeft, bboxWidth)
  const textAnchor = getTextAnchor(block.alignment)

  const padding = block.backdrop.padding
  const rectX = bboxLeft - padding
  const rectY = bboxTop - padding
  const rectW = bboxWidth + padding * 2
  const rectH = bboxHeight + padding * 2

  const parts: string[] = []

  if (block.blurBehind.enabled && !stripBlurMarkers) {
    parts.push(
      `<rect class="blur-behind-marker" data-block-id="${escapeXmlAttr(block.id)}" data-radius="${block.blurBehind.radius}" x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" fill="none" stroke="none"/>`,
    )
  }

  if (block.backdrop.enabled) {
    parts.push(
      `<rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" fill="${escapeXmlAttr(block.backdrop.color)}" fill-opacity="${block.backdrop.opacity}" rx="4" ry="4"/>`,
    )
  }

  const fontFamily = getFontFamily(block.fontId)
  const italic = block.italic ? "italic" : "normal"
  const fontWeightCss = block.fontWeight === "bold" ? "700" : "400"

  const styleAttr = ""

  const textAttrs: string[] = [
    `font-family="${escapeXmlAttr(fontFamily)}"`,
    `font-size="${block.fontSize}"`,
    `font-weight="${fontWeightCss}"`,
    `font-style="${italic}"`,
    `fill="${escapeXmlAttr(block.color)}"`,
    `text-anchor="${textAnchor}"`,
    `letter-spacing="${block.letterSpacing}"`,
    `xml:space="preserve"`,
  ]
  if (block.outline.enabled && block.outline.width > 0) {
    textAttrs.push(`stroke="${escapeXmlAttr(block.outline.color)}"`)
    textAttrs.push(`stroke-width="${block.outline.width}"`)
    textAttrs.push(`paint-order="stroke fill"`)
    textAttrs.push(`stroke-linejoin="round"`)
  }
  if (block.shadow.enabled) {
    textAttrs.push(`filter="url(#shadow-${escapeXmlAttr(block.id)})"`)
  }

  const tspans = lines
    .map((line, lineIndex) => {
      const dy =
        lineIndex === 0 ? block.fontSize : block.fontSize * block.lineHeight
      const yStart = lineIndex === 0 ? bboxTop : undefined
      const xAttr = `x="${anchorX}"`
      const dyAttr =
        lineIndex === 0 && yStart !== undefined
          ? `y="${yStart + block.fontSize - block.fontSize * 0.2}"`
          : `dy="${dy}"`
      return `<tspan ${xAttr} ${dyAttr}>${escapeXml(line)}</tspan>`
    })
    .join("")

  parts.push(`<text ${textAttrs.join(" ")}${styleAttr}>${tspans}</text>`)

  return parts.join("")
}

export function buildRemixSvg(
  config: RemixConfig,
  imageW: number,
  imageH: number,
  options?: {
    stripBlurMarkers?: boolean
    blockFilter?: (block: TextBlock) => boolean
  },
): string {
  const stripBlurMarkers = options?.stripBlurMarkers === true
  const blockFilter = options?.blockFilter ?? (() => true)

  const blocks = config.blocks.filter(blockFilter)

  const shadowFilters = blocks
    .filter((block) => block.shadow.enabled)
    .map((block) => {
      const stdDev = Math.max(0, block.shadow.blur / 2)
      return `<filter id="shadow-${escapeXmlAttr(block.id)}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="${block.shadow.offsetX}" dy="${block.shadow.offsetY}" stdDeviation="${stdDev}" flood-color="${escapeXmlAttr(block.shadow.color)}" flood-opacity="1"/></filter>`
    })
    .join("")

  const body = blocks
    .map((block) => renderBlock(block, imageW, imageH, stripBlurMarkers))
    .join("")

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${imageW}" height="${imageH}" viewBox="0 0 ${imageW} ${imageH}">` +
    `<defs>` +
    shadowFilters +
    `</defs>` +
    body +
    `</svg>`
  )
}
