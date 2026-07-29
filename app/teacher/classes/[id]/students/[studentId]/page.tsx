import Link from "next/link"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"

import { AiReportPanel } from "@/components/insights/ai-report-panel"
import { InsightsCollapsible } from "@/components/insights/insights-collapsible"
import {
  MasteryPanel,
  RecentChecksPanel,
} from "@/components/insights/mastery-panel"
import { StrugglePanel } from "@/components/insights/struggle-panel"
import { requireRole } from "@/lib/auth/session"
import { requireOwnedClassroomOrRedirect } from "@/lib/classrooms/access"
import { getDb } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import {
  getLatestStudentInsightReport,
  type InsightReportContentView,
} from "@/lib/insights/reports"
import {
  assertStudentInClassroom,
  getStudentInsightsSummary,
} from "@/lib/memory"

export const dynamic = "force-dynamic"

type TeacherStudentInsightsPageProps = {
  params: Promise<{ id: string; studentId: string }>
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
  const [insights, report] = await Promise.all([
    getStudentInsightsSummary(studentId),
    getLatestStudentInsightReport(studentId),
  ])

  const reportContent = (report?.content ??
    null) as InsightReportContentView | null

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-0 md:py-0">
      <header className="flex flex-col gap-3">
        <Link
          href={`/teacher/classes/${classroom.id}/insights`}
          className="w-fit text-sm font-medium text-[var(--brand-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
          aria-label="Back to class insights"
        >
          ← Back to class insights
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {label}
          </h1>
          <p className="mt-1 text-base text-[var(--app-muted)]">
            Individual AI coaching report and learning evidence in{" "}
            {classroom.name}.
          </p>
        </div>
      </header>

      <AiReportPanel
        audience="teacher-student"
        studentId={studentId}
        classroomId={classroom.id}
        content={reportContent}
        generatedAt={report?.generatedAt ?? null}
        model={report?.model ?? null}
        showActions={false}
      />

      <section
        className="grid gap-3 sm:grid-cols-3"
        aria-label="Student activity summary"
      >
        <div className="app-surface rounded-2xl p-4">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
            Checks
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {insights.totalEvents}
          </p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">
            Quiz, practice, and apply attempts
          </p>
        </div>
        <div className="app-surface rounded-2xl p-4">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
            Pass rate
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {insights.passRate == null ? "—" : `${insights.passRate}%`}
          </p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">
            {insights.passCount} passed · {insights.failCount} failed
          </p>
        </div>
        <div className="app-surface rounded-2xl p-4">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
            Struggle topics
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {insights.strugglingTopics.length}
          </p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">
            Topics with at least one fail
          </p>
        </div>
      </section>

      <InsightsCollapsible
        id="teacher-how-to-read"
        title="How to read this"
        summary="Quick legend for coaching conversations."
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-[var(--app-fg)]">Pass rate</dt>
            <dd className="mt-1 text-[var(--app-muted)]">
              Passes ÷ all lesson checks. Pair it with struggle topics — a high
              rate can still hide one sticky idea.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--app-fg)]">AI report</dt>
            <dd className="mt-1 text-[var(--app-muted)]">
              Combines check stats with recent coding snapshot analyses. Refresh
              after the learner practices more.
            </dd>
          </div>
        </dl>
      </InsightsCollapsible>

      <StrugglePanel
        topics={insights.strugglingTopics}
        misconceptions={insights.topMisconceptions}
      />

      <MasteryPanel mastery={insights.mastery} />

      <RecentChecksPanel events={insights.recentEvents} />
    </div>
  )
}

export default TeacherStudentInsightsPage
