"use client"

import { cn } from "@/lib/utils"

type PanelResizeHandleProps = {
  edge: "left" | "right"
  className?: string
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void
}

export const PanelResizeHandle = ({
  edge,
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: PanelResizeHandleProps) => {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={(event) => {
        // Keyboard users can focus the handle; width is mainly pointer-driven
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
        }
      }}
      className={cn(
        "absolute top-0 z-10 hidden h-full w-2 cursor-col-resize touch-none lg:block",
        "hover:bg-[var(--python-blue-light)]/15 focus-visible:bg-[var(--brand-blue)]/20 focus-visible:outline-none",
        edge === "left" ? "left-0" : "right-0",
        className
      )}
    />
  )
}
