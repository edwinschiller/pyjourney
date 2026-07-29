import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type InsightsCollapsibleProps = {
  id: string
  title: string
  summary?: string
  badge?: string
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

export const InsightsCollapsible = ({
  id,
  title,
  summary,
  badge,
  defaultOpen = false,
  children,
  className,
}: InsightsCollapsibleProps) => (
  <details
    id={id}
    open={defaultOpen}
    className={cn(
      "group app-surface overflow-hidden rounded-2xl border border-[var(--app-border)]",
      className
    )}
  >
    <summary
      className={cn(
        "flex cursor-pointer list-none items-start justify-between gap-3 px-5 py-4",
        "marker:content-none [&::-webkit-details-marker]:hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
      )}
      aria-controls={`${id}-panel`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {title}
          </h2>
          {badge ? (
            <span className="rounded-md bg-[var(--app-accent-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--brand-blue)] uppercase">
              {badge}
            </span>
          ) : null}
        </div>
        {summary ? (
          <p className="mt-1 text-sm text-[var(--app-muted)]">{summary}</p>
        ) : null}
      </div>
      <span
        className="mt-0.5 shrink-0 text-sm font-medium text-[var(--brand-blue)] transition group-open:rotate-0"
        aria-hidden
      >
        <span className="group-open:hidden">Show</span>
        <span className="hidden group-open:inline">Hide</span>
      </span>
    </summary>
    <div
      id={`${id}-panel`}
      className="border-t border-[var(--app-border)] px-5 py-4"
    >
      {children}
    </div>
  </details>
)
