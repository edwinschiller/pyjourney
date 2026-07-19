"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"

type UseHorizontalPanelResizeOptions = {
  storageKey: string
  defaultWidth: number
  minWidth: number
  maxWidth: number
  /** ltr = handle on the right (sidebar); rtl = handle on the left */
  direction: "ltr" | "rtl"
}

const clampWidth = (value: number, minWidth: number, maxWidth: number) =>
  Math.min(maxWidth, Math.max(minWidth, value))

const readStoredWidth = (
  storageKey: string,
  minWidth: number,
  maxWidth: number,
  fallback: number
) => {
  if (typeof window === "undefined") {
    return fallback
  }
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) {
    return fallback
  }
  const parsed = Number.parseInt(stored, 10)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  return clampWidth(parsed, minWidth, maxWidth)
}

export const useHorizontalPanelResize = ({
  storageKey,
  defaultWidth,
  minWidth,
  maxWidth,
  direction,
}: UseHorizontalPanelResizeOptions) => {
  const [width, setWidth] = useState(defaultWidth)
  const widthRef = useRef(defaultWidth)
  const isResizingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(defaultWidth)

  useEffect(() => {
    const stored = readStoredWidth(storageKey, minWidth, maxWidth, defaultWidth)
    widthRef.current = stored
    setWidth(stored)
  }, [storageKey, defaultWidth, minWidth, maxWidth])

  const applyWidth = useCallback(
    (next: number) => {
      const clamped = clampWidth(next, minWidth, maxWidth)
      widthRef.current = clamped
      setWidth(clamped)
    },
    [minWidth, maxWidth]
  )

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      isResizingRef.current = true
      startXRef.current = event.clientX
      startWidthRef.current = widthRef.current
      event.currentTarget.setPointerCapture(event.pointerId)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    },
    []
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isResizingRef.current) {
        return
      }
      const delta = event.clientX - startXRef.current
      const signedDelta = direction === "ltr" ? delta : -delta
      applyWidth(startWidthRef.current + signedDelta)
    },
    [applyWidth, direction]
  )

  const endResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isResizingRef.current) {
        return
      }
      isResizingRef.current = false
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, String(widthRef.current))
      }
    },
    [storageKey]
  )

  return {
    width,
    resizeHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endResize,
      onPointerCancel: endResize,
    },
  }
}
