import { Check, Lock, Sparkles } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type PathNodeVisualState =
  | "completed"
  | "active"
  | "available"
  | "locked"
  | "soon"

export const pathNodeMarkClassName = (state: PathNodeVisualState) =>
  cn(
    "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
    state === "active" &&
      "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white",
    state === "available" &&
      "border-[var(--brand-blue)] bg-[var(--app-surface)] text-[var(--brand-blue)]",
    state === "completed" && "border-emerald-600 bg-emerald-600 text-white",
    state === "locked" &&
      "border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)]",
    state === "soon" &&
      "border-dashed border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
  )

export const pathNodeConnectorClassName = (fromCompleted: boolean) =>
  cn(fromCompleted ? "bg-emerald-600/40" : "bg-[var(--app-border)]")

type PathNodeMarkProps = {
  state: PathNodeVisualState
  index: number
  className?: string
  "aria-label"?: string
  children?: ReactNode
}

export const PathNodeMark = ({
  state,
  index,
  className,
  "aria-label": ariaLabel,
  children,
}: PathNodeMarkProps) => (
  <span
    className={cn(pathNodeMarkClassName(state), className)}
    aria-label={ariaLabel}
  >
    {children ??
      (state === "completed" ? (
        <Check className="size-4 stroke-[2.5]" aria-hidden />
      ) : state === "locked" ? (
        <Lock className="size-3.5" aria-hidden />
      ) : state === "soon" ? (
        <Sparkles className="size-3.5" aria-hidden />
      ) : (
        <span className="text-sm font-semibold">{index}</span>
      ))}
  </span>
)
