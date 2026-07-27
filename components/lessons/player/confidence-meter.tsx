"use client"

import { Check, ChevronDown } from "lucide-react"
import { useId, useState } from "react"

import type { TopicProgress } from "@/lib/ai/schemas/lesson-blocks"
import { cn } from "@/lib/utils"

type ConfidenceMeterProps = {
  confidence: number
  topics: TopicProgress[]
  className?: string
}

const statusCopy = (topic: TopicProgress) => {
  if (topic.needsRecheck) return "Retry needed"
  switch (topic.status) {
    case "mastered":
      return "Understood"
    case "checking": {
      const evidence = topic.quizPasses + topic.practicePasses
      return evidence > 0 ? `Checking… (${evidence})` : "Checking…"
    }
    case "introduced":
      return "In progress"
    default:
      return "Not yet"
  }
}

/**
 * Collapsed: confidence + topic progress bars.
 * Expanded: checklist of required learning goals and mastery state.
 */
export const ConfidenceMeter = ({
  confidence,
  topics,
  className,
}: ConfidenceMeterProps) => {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const total = topics.length
  const mastered = topics.filter(
    (topic) => topic.status === "mastered" && !topic.needsRecheck
  ).length
  const clamped = Math.max(0, Math.min(100, confidence))
  const topicPct = total > 0 ? Math.round((mastered / total) * 100) : 0

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <button
        type="button"
        className="group flex w-full flex-col gap-1.5 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--app-muted)]">
          <span className="inline-flex items-center gap-1.5 font-medium">
            Progress
            <ChevronDown
              className={cn(
                "size-3.5 text-[var(--app-muted)] transition-transform duration-200",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </span>
          <span className="tabular-nums">
            <span className="font-semibold text-[var(--app-fg)]">{clamped}%</span>
            {" · "}
            {mastered}/{total} topics
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[10px] font-medium tracking-wide text-[var(--app-muted)] uppercase">
              Confidence
            </span>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-[var(--app-border)]"
              role="progressbar"
              aria-valuenow={clamped}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Confidence ${clamped} percent`}
            >
              <div
                className="lesson-confidence-fill h-full rounded-full bg-[var(--brand-blue)]"
                style={{ width: `${clamped}%` }}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[10px] font-medium tracking-wide text-[var(--app-muted)] uppercase">
              Topics {mastered}/{total}
            </span>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-[var(--app-border)]"
              role="progressbar"
              aria-valuenow={mastered}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-label={`${mastered} of ${total} topics understood`}
            >
              <div
                className="lesson-confidence-fill h-full rounded-full bg-emerald-600"
                style={{ width: `${topicPct}%` }}
              />
            </div>
          </div>
        </div>
      </button>

      {open ? (
        <div
          id={panelId}
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5"
        >
          <p className="mb-2 text-[11px] leading-snug text-[var(--app-muted)]">
            Required for this lesson. Confidence rises when you pass checks on
            each goal.
          </p>
          <ul className="flex flex-col gap-1.5" aria-label="Required learning goals">
            {topics.map((topic) => {
              const done = topic.status === "mastered" && !topic.needsRecheck
              return (
                <li
                  key={topic.id}
                  className="flex items-start gap-2.5 rounded-lg px-1 py-1"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                      done
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : topic.needsRecheck
                          ? "border-amber-500 bg-amber-500/15"
                          : "border-[var(--app-border)] bg-[var(--app-bg)]"
                    )}
                    aria-hidden
                  >
                    {done ? <Check className="size-2.5 stroke-[3]" /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          done
                            ? "text-[var(--app-fg)]"
                            : "text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
                        )}
                      >
                        {topic.title}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 text-[10px] font-medium tracking-wide uppercase",
                          done
                            ? "text-emerald-700 dark:text-emerald-400"
                            : topic.needsRecheck
                              ? "text-amber-700 dark:text-amber-400"
                              : "text-[var(--app-muted)]"
                        )}
                      >
                        {statusCopy(topic)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-[var(--app-muted)]">
                      {topic.teachingGoal}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
