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
}: PanelResizeHandleProps) => (
  <div
    role="separator"
    aria-orientation="vertical"
    aria-label="Resize panel"
    tabIndex={0}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerCancel}
    className={cn(
      "absolute top-0 z-10 hidden h-full w-2 cursor-col-resize touch-none lg:block",
      "hover:bg-[var(--brand-blue)]/15 focus-visible:bg-[var(--brand-blue)]/20 focus-visible:outline-none",
      edge === "left" ? "left-0" : "right-0",
      className
    )}
  />
)
