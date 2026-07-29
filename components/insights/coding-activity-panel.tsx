"use client"

import { useMemo, useState } from "react"

import { InsightsCollapsible } from "@/components/insights/insights-collapsible"
import { cn } from "@/lib/utils"

type SnapshotAi = {
  summary?: string
  strengths?: string[]
  struggles?: string[]
  nextStep?: string
  misconceptionTags?: string[]
  confidence?: number
}

type SnapshotListItem = {
  id: string
  mode: "lesson" | "free"
  lessonId: string | null
  learningObjective: string | null
  code: string
  stdout: string | null
  stderr: string | null
  hintCount: number
  elapsedMs: number
  createdAt: string
  analysisStatus: string | null
  analysisAi: unknown
  analysisDeterministic: unknown
  analysisModel: string | null
}

type CodingActivityPanelProps = {
  snapshots: SnapshotListItem[]
}

const formatWhen = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

const humanizeTag = (tag: string) =>
  tag
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

const truncate = (value: string, max = 900) => {
  if (value.length <= max) return value
  return `${value.slice(0, max)}\n…`
}

type Filter = "all" | "lesson" | "free"

const SnapshotRow = ({ snapshot }: { snapshot: SnapshotListItem }) => {
  const ai = (snapshot.analysisAi ?? null) as SnapshotAi | null
  const hasStderr = Boolean(snapshot.stderr?.trim())
  const analysisSource =
    snapshot.analysisStatus === "succeeded"
      ? snapshot.analysisModel
        ? `AI · ${snapshot.analysisModel}`
        : "Rule-based"
      : null
  const statusLabel =
    ai?.summary ??
    (snapshot.analysisStatus === "pending" ||
    snapshot.analysisStatus === "running"
      ? "Analysis in progress…"
      : snapshot.analysisStatus
        ? `Analysis: ${snapshot.analysisStatus}`
        : "Saved (not analyzed yet)")

  return (
    <details className="group border-b border-[var(--app-border)] last:border-b-0">
      <summary
        className={cn(
          "flex cursor-pointer list-none flex-col gap-1 px-5 py-3.5",
          "marker:content-none [&::-webkit-details-marker]:hidden",
          "hover:bg-[var(--app-bg)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand-blue)]"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
              snapshot.mode === "free"
                ? "bg-[var(--brand-yellow)]/20 text-[var(--python-yellow-dark)]"
                : "bg-[var(--app-accent-soft)] text-[var(--brand-blue)]"
            )}
          >
            {snapshot.mode === "free" ? "Free IDE" : "Lesson"}
          </span>
          {analysisSource ? (
            <span className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--app-muted)] uppercase">
              {analysisSource}
            </span>
          ) : null}
          {hasStderr ? (
            <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-red-700 uppercase dark:text-red-300">
              stderr
            </span>
          ) : null}
          <span className="ml-auto text-xs text-[var(--app-muted)]">
            {formatWhen(snapshot.createdAt)} · Expand
          </span>
        </div>
        <p className="text-sm font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          {statusLabel}
        </p>
        {snapshot.learningObjective ? (
          <p className="text-xs text-[var(--app-muted)]">
            Goal: {snapshot.learningObjective}
          </p>
        ) : null}
      </summary>

      <div className="space-y-4 bg-[var(--app-bg)]/40 px-5 py-4">
        {ai ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {ai.strengths && ai.strengths.length > 0 ? (
              <div>
                <p className="text-[10px] font-semibold tracking-wide text-[var(--app-muted)] uppercase">
                  Strengths spotted
                </p>
                <ul className="mt-1 space-y-1 text-sm">
                  {ai.strengths.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {ai.struggles && ai.struggles.length > 0 ? (
              <div>
                <p className="text-[10px] font-semibold tracking-wide text-[var(--app-muted)] uppercase">
                  Stuck on
                </p>
                <ul className="mt-1 space-y-1 text-sm">
                  {ai.struggles.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {ai.nextStep ? (
              <div className="sm:col-span-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                <p className="text-[10px] font-semibold tracking-wide text-[var(--app-muted)] uppercase">
                  Try next
                </p>
                <p className="mt-1 text-sm text-[var(--app-fg)]">{ai.nextStep}</p>
              </div>
            ) : null}
            {ai.misconceptionTags && ai.misconceptionTags.length > 0 ? (
              <div className="sm:col-span-2 flex flex-wrap gap-1.5">
                {ai.misconceptionTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--app-accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--brand-blue)]"
                  >
                    {humanizeTag(tag)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {hasStderr ? (
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-[var(--app-muted)] uppercase">
              Terminal error
            </p>
            <pre className="mt-1 max-h-40 overflow-auto rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-red-800 dark:text-red-200">
              {truncate(snapshot.stderr ?? "")}
            </pre>
          </div>
        ) : null}

        {snapshot.stdout?.trim() ? (
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-[var(--app-muted)] uppercase">
              Terminal output
            </p>
            <pre className="mt-1 max-h-32 overflow-auto rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
              {truncate(snapshot.stdout)}
            </pre>
          </div>
        ) : null}

        <div>
          <p className="text-[10px] font-semibold tracking-wide text-[var(--app-muted)] uppercase">
            Code at this moment
          </p>
          <pre className="mt-1 max-h-56 overflow-auto rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
            {truncate(snapshot.code, 1600)}
          </pre>
        </div>
      </div>
    </details>
  )
}

export const CodingActivityPanel = ({
  snapshots,
}: CodingActivityPanelProps) => {
  const [filter, setFilter] = useState<Filter>("all")

  const counts = useMemo(() => {
    const lesson = snapshots.filter((row) => row.mode === "lesson").length
    const free = snapshots.filter((row) => row.mode === "free").length
    return { all: snapshots.length, lesson, free }
  }, [snapshots])

  const filtered = useMemo(() => {
    if (filter === "all") return snapshots
    return snapshots.filter((row) => row.mode === filter)
  }, [filter, snapshots])

  const filters: Array<{ id: Filter; label: string; count: number }> = [
    { id: "all", label: "All", count: counts.all },
    { id: "lesson", label: "Lessons", count: counts.lesson },
    { id: "free", label: "Free IDE", count: counts.free },
  ]

  return (
    <InsightsCollapsible
      id="coding-activity"
      title="Coding activity"
      summary="Snapshots from lessons and free practice — expand any row for code, errors, and coaching notes (AI or rule-based)."
      badge={counts.all > 0 ? String(counts.all) : undefined}
      defaultOpen={counts.all > 0}
    >
      {snapshots.length === 0 ? (
        <p className="text-sm text-[var(--app-muted)]">
          Snapshots appear while you code in lessons or the IDE (about every
          15s when code changes). Analyses run sparingly to control cost.
        </p>
      ) : (
        <div className="space-y-3">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filter snapshots by source"
          >
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                tabIndex={0}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  filter === item.id
                    ? "bg-[var(--brand-blue)] text-white"
                    : "border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)] hover:text-[var(--app-fg)]"
                )}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--app-muted)]">
              No snapshots in this category yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--app-border)]">
              {filtered.map((snapshot) => (
                <SnapshotRow key={snapshot.id} snapshot={snapshot} />
              ))}
            </div>
          )}
        </div>
      )}
    </InsightsCollapsible>
  )
}
