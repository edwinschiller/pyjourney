"use client"

import { cn } from "@/lib/utils"

type PyjoCoachProps = {
  speak: string
  pace?: "fast" | "steady" | "slow"
  className?: string
}

export const PyjoCoach = ({ speak, pace, className }: PyjoCoachProps) => (
  <aside
    className={cn(
      "flex gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-accent-soft)] p-3",
      className
    )}
    aria-label="PyJo coach"
  >
    <div
      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-blue)] text-sm font-bold text-white"
      aria-hidden
    >
      PJ
    </div>
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          PyJo
        </p>
        {pace ? (
          <span className="rounded-md bg-[var(--app-surface)] px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-[var(--app-muted)] uppercase">
            {pace} pace
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-[var(--app-muted)]">
        {speak}
      </p>
    </div>
  </aside>
)
