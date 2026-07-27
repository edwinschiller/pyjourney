import Link from "next/link"
import { notFound } from "next/navigation"

import { requireRole } from "@/lib/auth/session"
import { requireOwnedClassroomOrRedirect } from "@/lib/classrooms/access"
import {
  assertStudentInClassroom,
  getStudentInsightsSummary,
} from "@/lib/memory"
import { getDb } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

type TeacherStudentInsightsPageProps = {
  params: Promise<{ id: string; studentId: string }>
}

const bandLabel = (band: string) => {
  if (band === "mastered") return "Mastered"
  if (band === "proficient") return "Proficient"
  if (band === "developing") return "Developing"
  return "Learning"
}

const TeacherStudentInsightsPage = async ({
  params,
}: TeacherStudentInsightsPageProps) => {
  const { id, studentId } = await params
  const user = await requireRole(["teacher"])
  const classroom = await requireOwnedClassroomOrRedirect(user.id, id)

  const inClass = await assertStudentInClassroom(classroom.id, studentId)
  if (!inClass) notFound()

  const db = getDb()
  const profileRows = await db
    .select({
      displayName: profiles.displayName,
      email: profiles.email,
    })
    .from(profiles)
    .where(eq(profiles.id, studentId))
    .limit(1)

  const profile = profileRows[0]
  if (!profile) notFound()

  const label = profile.displayName?.trim() || profile.email
  const insights = await getStudentInsightsSummary(studentId)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href={`/teacher/classes/${classroom.id}/insights`}
          className="w-fit text-sm font-medium text-[var(--brand-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
          aria-label="Back to class insights"
        >
          ← Back to class insights
        </Link>
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          {label}
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Individual learning evidence in {classroom.name}.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Summary">
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
            {insights.passRate == null ? "—" : `${insights.passRate}%`}
          </p>
        </div>
        <div className="app-surface rounded-xl p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Fails
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{insights.failCount}</p>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="t-struggle">
        <h2
          id="t-struggle"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Struggle topics
        </h2>
        {insights.strugglingTopics.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No struggle topics recorded yet.
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
                  {row.fails} fails · {row.passes} passes
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="t-patterns">
        <h2
          id="t-patterns"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Recurring patterns
        </h2>
        {insights.topMisconceptions.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No patterns yet.
          </div>
        ) : (
          <ul className="app-surface divide-y divide-[var(--app-border)] rounded-xl">
            {insights.topMisconceptions.map((row) => (
              <li
                key={row.tag}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
              >
                <p className="min-w-0 font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                  {row.tag}
                </p>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--brand-blue)]">
                  ×{row.count}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="t-mastery">
        <h2
          id="t-mastery"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Mastery
        </h2>
        {insights.mastery.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No mastery scores yet.
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
    </div>
  )
}

export default TeacherStudentInsightsPage
