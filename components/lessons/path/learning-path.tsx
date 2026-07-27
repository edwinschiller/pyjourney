"use client"

import { Check, Lock, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { LessonCta } from "@/components/lessons/player/lesson-cta"
import { startLessonForConceptAction } from "@/lib/lessons/actions"
import type { LearningPathNode } from "@/lib/lessons/path"
import { cn } from "@/lib/utils"

type LearningPathProps = {
  nodes: LearningPathNode[]
  completedCount: number
  totalCount: number
}

const statusLabel = (node: LearningPathNode) => {
  switch (node.status) {
    case "locked":
      return "Locked"
    case "soon":
      return "Coming soon"
    case "completed":
      return `${node.masteryScore}/100`
    case "active":
      return "Up next"
    default:
      return "Available"
  }
}

export const LearningPath = ({
  nodes,
  completedCount,
  totalCount,
}: LearningPathProps) => {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const percent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  const handleOpen = (node: LearningPathNode) => {
    if (
      node.status === "locked" ||
      node.status === "soon" ||
      !node.hasTemplate
    ) {
      return
    }
    setError(null)
    setPendingId(node.conceptId)
    startTransition(async () => {
      const result = await startLessonForConceptAction(node.conceptId)
      if (!result?.ok || !result.redirectTo) {
        setError(result?.error ?? "Could not open lesson.")
        setPendingId(null)
        return
      }
      router.push(result.redirectTo)
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Learning path
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            Python with PyJourney
          </h1>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Finish a concept to unlock what depends on it. Some lessons open in
            parallel once their prerequisites are done.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-[var(--app-muted)]">
            <span>Progress</span>
            <span className="tabular-nums">
              {completedCount}/{totalCount} · {percent}%
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[var(--app-border)]"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Path progress"
          >
            <div
              className="lesson-confidence-fill h-full rounded-full bg-[var(--brand-blue)]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </header>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <ol className="relative m-0 flex list-none flex-col p-0">
        {nodes.map((node, index) => {
          const isBusy = pending && pendingId === node.conceptId
          const canOpen =
            node.status === "active" ||
            node.status === "available" ||
            node.status === "completed"
          const isLast = index === nodes.length - 1
          const ctaLabel = node.status === "completed" ? "Review" : "Continue"

          return (
            <li key={node.conceptId} className="relative flex gap-4">
              <div className="flex w-10 shrink-0 flex-col items-center">
                <button
                  type="button"
                  tabIndex={canOpen ? 0 : -1}
                  disabled={!canOpen || isBusy}
                  aria-label={
                    node.status === "locked"
                      ? `${node.title}, locked`
                      : node.status === "soon"
                        ? `${node.title}, coming soon`
                        : `Open ${node.title}`
                  }
                  onClick={() => handleOpen(node)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      handleOpen(node)
                    }
                  }}
                  className={cn(
                    "relative z-10 flex size-10 items-center justify-center rounded-full border-2 transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:outline-none",
                    node.status === "active" &&
                      "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white",
                    node.status === "available" &&
                      "border-[var(--brand-blue)] bg-[var(--app-surface)] text-[var(--brand-blue)]",
                    node.status === "completed" &&
                      "border-emerald-600 bg-emerald-600 text-white",
                    node.status === "locked" &&
                      "cursor-not-allowed border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)]",
                    node.status === "soon" &&
                      "cursor-not-allowed border-dashed border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
                  )}
                >
                  {node.status === "completed" ? (
                    <Check className="size-4 stroke-[2.5]" aria-hidden />
                  ) : node.status === "locked" ? (
                    <Lock className="size-3.5" aria-hidden />
                  ) : node.status === "soon" ? (
                    <Sparkles className="size-3.5" aria-hidden />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </button>
                {!isLast ? (
                  <div
                    className={cn(
                      "w-px flex-1 min-h-6",
                      node.status === "completed"
                        ? "bg-emerald-600/40"
                        : "bg-[var(--app-border)]"
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>

              <div
                className={cn(
                  "flex min-w-0 flex-1 items-start justify-between gap-3 pb-6",
                  isLast && "pb-0"
                )}
              >
                <div className="min-w-0 pt-1.5">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      node.status === "locked" || node.status === "soon"
                        ? "text-[var(--app-muted)]"
                        : "text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
                    )}
                  >
                    {node.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--app-muted)]">
                    {statusLabel(node)}
                    {node.description ? (
                      <span className="mt-1 block leading-snug opacity-80">
                        {node.description}
                      </span>
                    ) : null}
                  </p>
                </div>

                {canOpen ? (
                  <LessonCta
                    tone={node.status === "active" ? "primary" : "ghost"}
                    className="!min-h-8 !min-w-[6.5rem] shrink-0 !px-3 !text-xs"
                    loading={isBusy}
                    onClick={() => handleOpen(node)}
                    aria-label={
                      isBusy
                        ? `Opening ${node.title}`
                        : `${ctaLabel} ${node.title}`
                    }
                  >
                    {ctaLabel}
                  </LessonCta>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
