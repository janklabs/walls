"use client"

import { useEffect, useRef, useState } from "react"

import { computeAutoInverse } from "@/server/actions/computeAutoInverse"
import type { TextBlock } from "@/server/remix/types"

const DEBOUNCE_MS = 200

function estimateHeightPct(block: TextBlock): number {
  const lines = Math.max(1, block.text.split("\n").length)
  const raw = (lines * block.fontSize * block.lineHeight) / 10
  return Math.max(1, Math.min(50, raw))
}

function estimateWidthPct(block: TextBlock): number {
  return Math.max(1, Math.min(100, block.maxWidthPct))
}

export function useAutoInverse(
  sourceId: number,
  block: TextBlock,
  enabled: boolean,
): { color: string; loading: boolean } {
  const [computedColor, setComputedColor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
      setLoading(false)
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    if (abortRef.current) {
      abortRef.current.abort()
    }

    setLoading(true)

    const widthPct = estimateWidthPct(block)
    const heightPct = estimateHeightPct(block)
    const xPct = block.xPct
    const yPct = block.yPct

    timerRef.current = setTimeout(() => {
      const controller = new AbortController()
      abortRef.current = controller

      computeAutoInverse({ sourceId, xPct, yPct, widthPct, heightPct })
        .then((result) => {
          if (controller.signal.aborted) return
          if (result.status === "success") {
            setComputedColor(result.color)
          } else {
            console.warn("computeAutoInverse error:", result.message)
          }
          setLoading(false)
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          console.warn("computeAutoInverse failed:", err)
          setLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
    }
  }, [
    enabled,
    sourceId,
    block.xPct,
    block.yPct,
    block.fontSize,
    block.text,
    block.maxWidthPct,
    block.lineHeight,
  ])

  if (!enabled) {
    return { color: block.color, loading: false }
  }

  return { color: computedColor ?? block.color, loading }
}
