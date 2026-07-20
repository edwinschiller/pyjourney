"use client"

import { Check, Lock, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { startLessonForConceptAction } from "@/lib/lessons/actions"
import type { LearningPathNode } from "@/lib/lessons/path"
import { cn } from "@/lib/utils"

const PATH_ALIGN: Array<"left" | "center" | "right"> = [
  "center",
  "right",
  "center",
  "left",
  "center",
]

type LearningPathProps = {
  nodes: LearningPathNode[]
  completedCount: number
  totalCount: number
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
    if (node.status === "locked" || node.status === "soon" || !node.hasTemplate) {
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
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Learning path
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            Python with PyJo
          </h1>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            PyJo watches your pace and answers, then builds the next step.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
          <div className="mb-2 flex justify-between text-xs font-medium text-[var(--app-muted)]">
            <span>Progress</span>
            <span>
              {completedCount}/{totalCount} · {percent}%
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-[var(--app-border)]"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Path progress"
          >
            <div
              className="h-full rounded-full bg-[var(--brand-blue)] transition-[width] duration-500"
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

      <div className="relative mx-auto w-full max-w-md pb-8">
        <div
          className="pointer-events-none absolute top-8 bottom-8 left-1/2 w-1 -translate-x-1/2 rounded-full bg-[var(--app-border)]"
          aria-hidden
        />
        <ul className="relative flex flex-col gap-7">
          {nodes.map((node, index) => {
            const align = PATH_ALIGN[index % PATH_ALIGN.length]
            const isBusy = pending && pendingId === node.conceptId
            const canOpen =
              node.status === "active" ||
              node.status === "available" ||
              node.status === "completed"

            return (
              <li
                key={node.conceptId}
                className={cn(
                  "relative flex px-4",
                  align === "left" && "justify-start",
                  align === "right" && "justify-end",
                  align === "center" && "justify-center"
                )}
              >
                <div className="flex max-w-[220px] flex-col items-center gap-2">
                  <button
                    type="button"
                    tabIndex={canOpen ? 0 : -1}
                    disabled={!canOpen || isBusy}
                    aria-label={
                      node.status === "locked"
                        ? `${node.title}, locked`
                        : node.status === "soon"
                          ? `${node.title}, coming soon`
                          : `Open ${node.title} with PyJo`
                    }
                    onClick={() => handleOpen(node)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        handleOpen(node)
                      }
                    }}
                    className={cn(
                      "flex size-16 items-center justify-center rounded-2xl border-2 transition-transform duration-200",
                      "focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:outline-none",
                      canOpen && "hover:scale-[1.03] active:scale-[0.98]",
                      node.status === "locked" &&
                        "cursor-not-allowed border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)] opacity-70",
                      node.status === "soon" &&
                        "cursor-not-allowed border-dashed border-[var(--app-border)] text-[var(--app-muted)]",
                      node.status === "completed" &&
                        "border-[var(--brand-blue)] bg-[var(--app-accent-soft)] text-[var(--brand-blue)]",
                      node.status === "active" &&
                        "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white shadow-[0_8px_24px_-12px_rgba(37,90,135,0.7)]",
                      node.status === "available" &&
                        "border-[var(--brand-blue)]/50 bg-[var(--app-surface)] text-[var(--brand-blue)]"
                    )}
                  >
                    {node.status === "completed" ? (
                      <Check className="size-7 stroke-[2.5]" aria-hidden />
                    ) : node.status === "locked" ? (
                      <Lock className="size-5" aria-hidden />
                    ) : node.status === "soon" ? (
                      <Sparkles className="size-5" aria-hidden />
                    ) : (
                      <span className="text-lg font-bold">{index + 1}</span>
                    )}
                  </button>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                      {node.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--app-muted)]">
                      {node.status === "locked"
                        ? "Locked"
                        : node.status === "soon"
                          ? "Coming soon"
                          : node.status === "completed"
                            ? `${node.masteryScore}/100`
                            : node.status === "active"
                              ? "Up next · PyJo"
                              : "Available"}
                    </p>
                  </div>
                  {node.status === "active" ? (
                    <Button
                      size="sm"
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleOpen(node)}
                      aria-label={`Continue ${node.title}`}
                    >
                      {isBusy ? "Opening…" : "Continue"}
                    </Button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
