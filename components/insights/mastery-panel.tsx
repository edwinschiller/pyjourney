import { InsightsCollapsible } from "@/components/insights/insights-collapsible"
import type { RecentLearnerEvent } from "@/lib/memory/types"

type MasteryPanelProps = {
  mastery: Array<{
    conceptId: string
    conceptTitle: string
    score: number
    band: string
  }>
}

type RecentChecksPanelProps = {
  events: RecentLearnerEvent[]
}

const bandLabel = (band: string) => {
  if (band === "mastered") return "Mastered"
  if (band === "proficient") return "Proficient"
  if (band === "developing") return "Developing"
  return "Learning"
}

const bandHint = (band: string) => {
  if (band === "mastered") return "Ready to teach a peer or try freer projects."
  if (band === "proficient") return "Solid — polish edge cases in free practice."
  if (band === "developing") return "Keep looping short lesson checks on this concept."
  return "Early stage — focus on the next unlocked lesson steps."
}

const formatWhen = (date: Date) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)

const sourceLabel = (source: RecentLearnerEvent["source"]) => {
  if (source === "lesson_complete") return "Lesson complete"
  return source
}

export const MasteryPanel = ({ mastery }: MasteryPanelProps) => (
  <InsightsCollapsible
    id="mastery"
    title="Concept mastery"
    summary="Scores update as you finish concepts and (sometimes) from confident coding analyses."
    badge={mastery.length > 0 ? String(mastery.length) : undefined}
  >
    {mastery.length === 0 ? (
      <p className="text-sm text-[var(--app-muted)]">
        Mastery scores appear after you finish a concept lesson.
      </p>
    ) : (
      <ul className="divide-y divide-[var(--app-border)] overflow-hidden rounded-xl border border-[var(--app-border)]">
        {mastery.map((row) => (
          <li
            key={row.conceptId}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                {row.conceptTitle}
              </p>
              <p className="text-sm text-[var(--app-muted)]">
                {bandLabel(row.band)} — {bandHint(row.band)}
              </p>
              <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[var(--app-border)]">
                <div
                  className="h-full rounded-full bg-[var(--brand-blue)]"
                  style={{ width: `${Math.min(100, Math.max(0, row.score))}%` }}
                />
              </div>
            </div>
            <p className="font-mono text-sm font-semibold text-[var(--brand-blue)]">
              {row.score}/100
            </p>
          </li>
        ))}
      </ul>
    )}
  </InsightsCollapsible>
)

export const RecentChecksPanel = ({ events }: RecentChecksPanelProps) => (
  <InsightsCollapsible
    id="recent-checks"
    title="Recent lesson checks"
    summary="Latest quiz / practice / apply outcomes from the learning path."
    badge={events.length > 0 ? String(events.length) : undefined}
  >
    {events.length === 0 ? (
      <p className="text-sm text-[var(--app-muted)]">No events yet.</p>
    ) : (
      <ul className="divide-y divide-[var(--app-border)] overflow-hidden rounded-xl border border-[var(--app-border)]">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                {event.conceptTitle}
                <span className="font-normal text-[var(--app-muted)]">
                  {" "}
                  · {sourceLabel(event.source)}
                </span>
              </p>
              <p className="text-sm text-[var(--app-muted)]">
                {event.misconceptionTag || event.signal}
              </p>
              <p className="mt-0.5 text-xs text-[var(--app-muted)]">
                {formatWhen(event.createdAt)}
              </p>
            </div>
            <span
              className={
                event.outcome === "pass"
                  ? "rounded-md bg-[var(--app-accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--brand-blue)]"
                  : "rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300"
              }
            >
              {event.outcome}
            </span>
          </li>
        ))}
      </ul>
    )}
  </InsightsCollapsible>
)
