import { AiReportPanel } from "@/components/insights/ai-report-panel"
import { CodingActivityPanel } from "@/components/insights/coding-activity-panel"
import { HowInsightsWork } from "@/components/insights/how-insights-work"
import {
  MasteryPanel,
  RecentChecksPanel,
} from "@/components/insights/mastery-panel"
import { MetricCards } from "@/components/insights/metric-cards"
import { StrugglePanel } from "@/components/insights/struggle-panel"
import { requireRole } from "@/lib/auth/session"
import { listRecentSnapshotsForStudent } from "@/lib/coding/snapshots"
import {
  getLatestStudentInsightReport,
  type InsightReportContentView,
} from "@/lib/insights/reports"
import { getStudentInsightsSummary } from "@/lib/memory"

export const dynamic = "force-dynamic"

const StudentInsightsPage = async () => {
  const user = await requireRole(["student"])
  const [insights, report, snapshots] = await Promise.all([
    getStudentInsightsSummary(user.id),
    getLatestStudentInsightReport(user.id),
    listRecentSnapshotsForStudent(user.id, 16),
  ])

  const reportContent = (report?.content ??
    null) as InsightReportContentView | null

  const serializableSnapshots = snapshots.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }))
  const lessonSnapshotCount = snapshots.filter(
    (row) => row.mode === "lesson"
  ).length
  const freeSnapshotCount = snapshots.filter((row) => row.mode === "free").length

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Your insights
        </h1>
        <p className="max-w-2xl text-base text-[var(--app-muted)]">
          A coaching view of your lesson checks and coding snapshots — with
          clear explanations and next actions, not just numbers.
        </p>
      </header>

      <HowInsightsWork />

      <AiReportPanel
        content={reportContent}
        generatedAt={report?.generatedAt ?? null}
        model={report?.model ?? null}
      />

      <MetricCards
        totalEvents={insights.totalEvents}
        passRate={insights.passRate}
        passCount={insights.passCount}
        failCount={insights.failCount}
        struggleCount={insights.strugglingTopics.length}
        lessonSnapshotCount={lessonSnapshotCount}
        freeSnapshotCount={freeSnapshotCount}
      />

      {insights.totalEvents === 0 && snapshots.length === 0 ? (
        <div className="app-surface rounded-2xl p-5 text-sm text-[var(--app-muted)]">
          Nothing to analyze yet. Complete a lesson check or write some code —
          then refresh the AI report.
        </div>
      ) : null}

      <CodingActivityPanel snapshots={serializableSnapshots} />

      <StrugglePanel
        topics={insights.strugglingTopics}
        misconceptions={insights.topMisconceptions}
      />

      <MasteryPanel mastery={insights.mastery} />

      <RecentChecksPanel events={insights.recentEvents} />
    </div>
  )
}

export default StudentInsightsPage
