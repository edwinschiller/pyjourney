import Link from "next/link"

import { AiReportPanel } from "@/components/insights/ai-report-panel"
import { InsightsCollapsible } from "@/components/insights/insights-collapsible"
import { ClassroomInterventionRadar } from "@/components/teacher/classroom-intervention-radar"
import { requireRole } from "@/lib/auth/session"
import { requireOwnedClassroomOrRedirect } from "@/lib/classrooms/access"
import {
  getLatestClassInsightReport,
  type InsightReportContentView,
} from "@/lib/insights/reports"
import { getClassInsightsSummary } from "@/lib/memory"

export const dynamic = "force-dynamic"

type TeacherClassInsightsPageProps = {
  params: Promise<{ id: string }>
}

const humanizeTag = (tag: string) =>
  tag.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

const TeacherClassInsightsPage = async ({
  params,
}: TeacherClassInsightsPageProps) => {
  const { id } = await params
  const user = await requireRole(["teacher"])
  const classroom = await requireOwnedClassroomOrRedirect(user.id, id)
  const [insights, report] = await Promise.all([
    getClassInsightsSummary(classroom.id),
    getLatestClassInsightReport(classroom.id),
  ])

  const passRate =
    insights.totalEvents > 0
      ? Math.round((insights.passCount / insights.totalEvents) * 100)
      : null

  const reportContent = (report?.content ??
    null) as InsightReportContentView | null

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-0 md:py-0">
      <header className="flex flex-col gap-3">
        <Link
          href={`/teacher/classes/${classroom.id}`}
          className="w-fit text-sm font-medium text-[var(--brand-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
          aria-label="Back to class"
        >
          ← Back to class
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            Class insights
          </h1>
          <p className="mt-1 max-w-2xl text-base text-[var(--app-muted)]">
            {classroom.name} — shared check evidence and an optional AI coaching
            summary for lesson planning.
          </p>
        </div>
      </header>

      <AiReportPanel
        audience="class"
        classroomId={classroom.id}
        content={reportContent}
        generatedAt={report?.generatedAt ?? null}
        model={report?.model ?? null}
        showActions={false}
      />

      <ClassroomInterventionRadar insights={insights} />

      <section
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Class activity summary"
      >
        <div className="app-surface rounded-2xl p-4">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
            Students
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {insights.memberCount}
          </p>
        </div>
        <div className="app-surface rounded-2xl p-4">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
            Checks
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {insights.totalEvents}
          </p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">
            Across quiz, practice, and apply
          </p>
        </div>
        <div className="app-surface rounded-2xl p-4">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
            Pass rate
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {passRate == null ? "—" : `${passRate}%`}
          </p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">
            {insights.passCount} passed · {insights.failCount} failed
          </p>
        </div>
        <div className="app-surface rounded-2xl p-4">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
            Fails
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {insights.failCount}
          </p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">
            Useful signals for reteach topics
          </p>
        </div>
      </section>

      <InsightsCollapsible
        id="class-struggle"
        title="Shared struggle topics"
        summary="Topics with fails across the class — good candidates for a short reteach."
        badge={
          insights.struggleTopics.length > 0
            ? String(insights.struggleTopics.length)
            : undefined
        }
        defaultOpen={insights.struggleTopics.length > 0}
      >
        {insights.struggleTopics.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">
            No struggle topics yet. Insights fill in as students take lesson
            checks.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--app-border)] overflow-hidden rounded-xl border border-[var(--app-border)]">
            {insights.struggleTopics.map((row) => (
              <li
                key={`${row.conceptTitle}:${row.topicId}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
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
      </InsightsCollapsible>

      <InsightsCollapsible
        id="class-patterns"
        title="Recurring patterns"
        summary="Curriculum misconception tags that show up across learners."
        badge={
          insights.misconceptions.length > 0
            ? String(insights.misconceptions.length)
            : undefined
        }
      >
        {insights.misconceptions.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">
            No shared patterns yet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--app-border)] overflow-hidden rounded-xl border border-[var(--app-border)]">
            {insights.misconceptions.map((row) => (
              <li
                key={row.tag}
                className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {humanizeTag(row.tag)}
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
      </InsightsCollapsible>

      <InsightsCollapsible
        id="class-members"
        title="Students by support need"
        summary="Open a learner for their personal AI report and detailed evidence."
        badge={
          insights.members.length > 0
            ? String(insights.members.length)
            : undefined
        }
        defaultOpen
      >
        {insights.members.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">No students enrolled.</p>
        ) : (
          <ul className="divide-y divide-[var(--app-border)] overflow-hidden rounded-xl border border-[var(--app-border)]">
            {insights.members.map((member) => {
              const label = member.displayName?.trim() || member.email
              return (
                <li
                  key={member.studentId}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
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
                      className="text-sm font-semibold text-[var(--brand-blue)] hover:underline"
                      aria-label={`View AI report and insights for ${label}`}
                    >
                      AI report →
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </InsightsCollapsible>
    </div>
  )
}

export default TeacherClassInsightsPage
