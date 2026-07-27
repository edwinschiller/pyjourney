import Link from "next/link"

import { requireRole } from "@/lib/auth/session"
import { getStudentInsightsSummary } from "@/lib/memory"

export const dynamic = "force-dynamic"

const bandLabel = (band: string) => {
  if (band === "mastered") return "Mastered"
  if (band === "proficient") return "Proficient"
  if (band === "developing") return "Developing"
  return "Learning"
}

const formatWhen = (date: Date) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)

const StudentInsightsPage = async () => {
  const user = await requireRole(["student"])
  const insights = await getStudentInsightsSummary(user.id)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Your insights
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Evidence from your lesson checks — wrong answers, topics you struggle
          with, and mastery so far. No AI guesswork.
        </p>
      </header>

      <section
        className="grid gap-3 sm:grid-cols-3"
        aria-label="Learning activity summary"
      >
        <div className="app-surface rounded-xl p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Checks
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {insights.totalEvents}
          </p>
        </div>
        <div className="app-surface rounded-xl p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Pass rate
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {insights.passRate == null ? "—" : `${insights.passRate}%`}
          </p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">
            {insights.passCount} passed · {insights.failCount} failed
          </p>
        </div>
        <div className="app-surface rounded-xl p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Struggle topics
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {insights.strugglingTopics.length}
          </p>
        </div>
      </section>

      {insights.totalEvents === 0 ? (
        <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
          No check history yet.{" "}
          <Link
            href="/student/learn"
            className="font-medium text-[var(--brand-blue)] hover:underline"
          >
            Start a lesson
          </Link>{" "}
          — every quiz and practice check shows up here.
        </div>
      ) : null}

      <section className="flex flex-col gap-3" aria-labelledby="struggle-heading">
        <h2
          id="struggle-heading"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Where you struggle
        </h2>
        {insights.strugglingTopics.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No repeated fails yet. Keep checking answers in lessons.
          </div>
        ) : (
          <ul className="app-surface divide-y divide-[var(--app-border)] rounded-xl">
            {insights.strugglingTopics.map((row) => (
              <li
                key={`${row.conceptId}:${row.topicId}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {row.topicTitle}
                  </p>
                  <p className="text-sm text-[var(--app-muted)]">
                    {row.conceptTitle}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-[var(--brand-blue)]">
                  {row.fails} fail{row.fails === 1 ? "" : "s"} · {row.passes}{" "}
                  pass{row.passes === 1 ? "" : "es"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="flex flex-col gap-3"
        aria-labelledby="misconception-heading"
      >
        <h2
          id="misconception-heading"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Recurring patterns
        </h2>
        {insights.topMisconceptions.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            Patterns appear after failed checks (linked to curriculum
            misconceptions).
          </div>
        ) : (
          <ul className="app-surface divide-y divide-[var(--app-border)] rounded-xl">
            {insights.topMisconceptions.map((row) => (
              <li
                key={row.tag}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {row.tag}
                  </p>
                  {row.conceptTitle ? (
                    <p className="text-sm text-[var(--app-muted)]">
                      {row.conceptTitle}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--brand-blue)]">
                  ×{row.count}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="mastery-heading">
        <h2
          id="mastery-heading"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Mastery
        </h2>
        {insights.mastery.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            Mastery scores appear after you finish a concept lesson.
          </div>
        ) : (
          <ul className="app-surface divide-y divide-[var(--app-border)] rounded-xl">
            {insights.mastery.map((row) => (
              <li
                key={row.conceptId}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {row.conceptTitle}
                  </p>
                  <p className="text-sm text-[var(--app-muted)]">
                    {bandLabel(row.band)}
                  </p>
                </div>
                <p className="font-mono text-sm font-semibold text-[var(--brand-blue)]">
                  {row.score}/100
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="recent-heading">
        <h2
          id="recent-heading"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Recent checks
        </h2>
        {insights.recentEvents.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No events yet.
          </div>
        ) : (
          <ul className="app-surface divide-y divide-[var(--app-border)] rounded-xl">
            {insights.recentEvents.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {event.conceptTitle}
                    <span className="font-normal text-[var(--app-muted)]">
                      {" "}
                      · {event.source}
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
      </section>
    </div>
  )
}

export default StudentInsightsPage
