import Link from "next/link"

import { requireRole } from "@/lib/auth/session"
import { requireOwnedClassroomOrRedirect } from "@/lib/classrooms/access"
import { getClassInsightsSummary } from "@/lib/memory"

export const dynamic = "force-dynamic"

type TeacherClassInsightsPageProps = {
  params: Promise<{ id: string }>
}

const TeacherClassInsightsPage = async ({
  params,
}: TeacherClassInsightsPageProps) => {
  const { id } = await params
  const user = await requireRole(["teacher"])
  const classroom = await requireOwnedClassroomOrRedirect(user.id, id)
  const insights = await getClassInsightsSummary(classroom.id)

  const passRate =
    insights.totalEvents > 0
      ? Math.round((insights.passCount / insights.totalEvents) * 100)
      : null

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href={`/teacher/classes/${classroom.id}`}
          className="w-fit text-sm font-medium text-[var(--brand-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
          aria-label="Back to class"
        >
          ← Back to class
        </Link>
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Class insights
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          {classroom.name} — aggregated check evidence across enrolled students
          (no raw student code).
        </p>
      </header>

      <section
        className="grid gap-3 sm:grid-cols-4"
        aria-label="Class activity summary"
      >
        <div className="app-surface rounded-xl p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Students
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{insights.memberCount}</p>
        </div>
        <div className="app-surface rounded-xl p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Checks
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{insights.totalEvents}</p>
        </div>
        <div className="app-surface rounded-xl p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Pass rate
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {passRate == null ? "—" : `${passRate}%`}
          </p>
        </div>
        <div className="app-surface rounded-xl p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Fails
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{insights.failCount}</p>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="class-struggle">
        <h2
          id="class-struggle"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Shared struggle topics
        </h2>
        {insights.struggleTopics.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No struggle topics yet. Insights fill in as students take lesson
            checks.
          </div>
        ) : (
          <ul className="app-surface divide-y divide-[var(--app-border)] rounded-xl">
            {insights.struggleTopics.map((row) => (
              <li
                key={`${row.conceptTitle}:${row.topicId}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {row.topicTitle}
                  </p>
                  <p className="text-sm text-[var(--app-muted)]">
                    {row.conceptTitle} · {row.studentCount} student
                    {row.studentCount === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-[var(--brand-blue)]">
                  {row.totalFails} fails
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="class-patterns">
        <h2
          id="class-patterns"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Recurring patterns
        </h2>
        {insights.misconceptions.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No shared patterns yet.
          </div>
        ) : (
          <ul className="app-surface divide-y divide-[var(--app-border)] rounded-xl">
            {insights.misconceptions.map((row) => (
              <li
                key={row.tag}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {row.tag}
                  </p>
                  <p className="text-sm text-[var(--app-muted)]">
                    {row.studentCount} student
                    {row.studentCount === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--brand-blue)]">
                  ×{row.totalCount}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="class-members">
        <h2
          id="class-members"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Students by support need
        </h2>
        {insights.members.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No students enrolled.
          </div>
        ) : (
          <ul className="app-surface divide-y divide-[var(--app-border)] rounded-xl">
            {insights.members.map((member) => {
              const label = member.displayName?.trim() || member.email
              return (
                <li
                  key={member.studentId}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                      {label}
                    </p>
                    <p className="truncate text-sm text-[var(--app-muted)]">
                      {member.topStruggleTopic
                        ? `Top struggle: ${member.topStruggleTopic}`
                        : "No struggle topics yet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm tabular-nums text-[var(--app-muted)]">
                      {member.failCount} fails · {member.passCount} passes
                    </p>
                    <Link
                      href={`/teacher/classes/${classroom.id}/students/${member.studentId}`}
                      className="text-sm font-medium text-[var(--brand-blue)] hover:underline"
                      aria-label={`View insights for ${label}`}
                    >
                      View
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default TeacherClassInsightsPage
