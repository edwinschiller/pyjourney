"use client"

import { Loader2 } from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

type LessonCtaProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "accent" | "ghost"
  loading?: boolean
  children: ReactNode
}

/** Flat lesson action button — no 3D lip, no decorative icons. */
export const LessonCta = ({
  tone = "primary",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: LessonCtaProps) => (
  <button
    type="button"
    className={cn(
      "lesson-cta",
      tone === "primary" && "lesson-cta--primary",
      tone === "accent" && "lesson-cta--accent",
      tone === "ghost" && "lesson-cta--ghost",
      className
    )}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...props}
  >
    {loading ? (
      <>
        <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
        <span className="sr-only">Loading</span>
        <span aria-hidden>{children}</span>
      </>
    ) : (
      <span>{children}</span>
    )}
  </button>
)
