"use client"

import { ChevronDown, GitBranch } from "lucide-react"
import { useId, useState } from "react"

import type { StepEvidence } from "@/lib/lessons/step-evidence"
import { cn } from "@/lib/utils"

type StepRationaleProps = {
  evidence: StepEvidence
}

export const StepRationale = ({ evidence }: StepRationaleProps) => {
  const [open, setOpen] = useState(evidence.defaultOpen)
  const contentId = useId()
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "shrink-0 overflow-hidden rounded-xl border",
        evidence.tone === "attention"
          ? "border-amber-500/40 bg-[var(--app-highlight-soft)]"
          : evidence.tone === "success"
            ? "border-emerald-500/35 bg-emerald-500/7"
            : "border-[var(--brand-blue)]/20 bg-[var(--app-accent-soft)]/55"
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((value) => !value)}
        className="group flex w-full items-start gap-3 px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand-blue)]"
      >
        <span
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
            evidence.tone === "attention"
              ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
              : evidence.tone === "success"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] dark:text-[var(--python-blue-light)]"
          )}
          aria-hidden
        >
          <GitBranch className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span
            id={headingId}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold tracking-[0.08em] text-[var(--app-fg)] uppercase"
          >
            Why this step?
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] tracking-[0.1em]",
                evidence.tone === "attention"
                  ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                  : evidence.tone === "success"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] dark:text-[var(--python-blue-light)]"
              )}
            >
              {evidence.label}
            </span>
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-[var(--app-muted)] sm:text-[13px]">
            {evidence.summary}
          </span>
        </span>

        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-[var(--app-muted)] transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={contentId}
          className="border-t border-current/10 px-3.5 pt-2.5 pb-3 sm:pl-[3.375rem]"
        >
          <p className="text-[10px] font-bold tracking-[0.12em] text-[var(--app-muted)] uppercase">
            Evidence used
          </p>
          <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-[var(--app-muted)]">
            {evidence.facts.map((fact) => (
              <li key={fact} className="flex gap-2">
                <span
                  className="text-[var(--brand-blue)] dark:text-[var(--python-blue-light)]"
                  aria-hidden
                >
                  ·
                </span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
          {evidence.misconception ? (
            <p className="mt-2 rounded-lg bg-amber-500/10 px-2.5 py-2 text-xs leading-relaxed text-amber-950 dark:text-amber-100">
              <span className="font-semibold">Common misconception to revisit:</span>{" "}
              {evidence.misconception}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
