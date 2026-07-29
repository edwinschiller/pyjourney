import Link from "next/link"

import { GenerateInsightReportButton } from "@/components/insights/generate-insight-report-button"
import { InsightsCollapsible } from "@/components/insights/insights-collapsible"
import type { InsightReportContentView } from "@/lib/insights/reports"
import { cn } from "@/lib/utils"

type ReportAudience = "student-self" | "teacher-student" | "class"

type AiReportPanelProps = {
  content: InsightReportContentView | null
  generatedAt?: Date | null
  model?: string | null
  audience?: ReportAudience
  studentId?: string
  classroomId?: string
  showActions?: boolean
}

const formatWhen = (date: Date) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)

const TipList = ({
  title,
  items,
  empty,
}: {
  title: string
  items: string[]
  empty: string
}) => (
  <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-4">
    <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
      {title}
    </p>
    {items.length === 0 ? (
      <p className="mt-2 text-sm text-[var(--app-muted)]">{empty}</p>
    ) : (
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm leading-relaxed text-[var(--app-fg)] before:mr-2 before:text-[var(--brand-blue)] before:content-['→']"
          >
            {item}
          </li>
        ))}
      </ul>
    )}
  </div>
)

const copyForAudience = (audience: ReportAudience) => {
  if (audience === "class") {
    return {
      eyebrow: "Class AI coaching report",
      emptyTitle: "Class AI report",
      emptyBody:
        "Generate a coaching summary from shared struggle topics, patterns, and check stats — for lesson planning, not grading.",
      generateLabel: "Generate class AI report",
      refreshLabel: "Refresh class report",
      defaultHeadline: "Class learning report",
      categorySummary: "Whole-class tips for lessons vs optional IDE practice.",
      lessonTitle: "Lesson reteach ideas",
      freeTitle: "Optional IDE practice",
      examplesSummary: "Short teaching examples you can use tomorrow.",
      strengthEmpty: "Strengths appear as the class builds pass evidence.",
      focusEmpty: "No shared weak spots yet.",
      nextEmpty: "Generate a report after students run a few checks.",
    }
  }
  if (audience === "teacher-student") {
    return {
      eyebrow: "Student AI coaching report",
      emptyTitle: "Student AI report",
      emptyBody:
        "Generate a coaching summary from this learner’s lesson checks and coding snapshots.",
      generateLabel: "Generate student AI report",
      refreshLabel: "Refresh report",
      defaultHeadline: "Student learning report",
      categorySummary: "Tips split by lesson path vs free IDE practice.",
      lessonTitle: "Lessons (path)",
      freeTitle: "Free practice (IDE)",
      examplesSummary: "Short ideas tied to this learner’s struggles.",
      strengthEmpty: "Strengths will show after more successful checks.",
      focusEmpty: "No repeated weak spots yet.",
      nextEmpty: "More lesson checks unlock concrete next steps.",
    }
  }
  return {
    eyebrow: "AI coaching report",
    emptyTitle: "AI coaching report",
    emptyBody:
      "Generate a short coaching summary from your lesson checks and coding snapshots — strengths, focus areas, and concrete next steps.",
    generateLabel: "Generate AI report",
    refreshLabel: "Refresh report",
    defaultHeadline: "Your learning report",
    categorySummary: "Separate tips for lessons vs free IDE practice.",
    lessonTitle: "Lessons (path)",
    freeTitle: "Free practice (IDE)",
    examplesSummary: "Short ideas tied to what you have been practicing.",
    strengthEmpty: "Keep practicing — strengths will show up here.",
    focusEmpty: "No repeated weak spots yet.",
    nextEmpty: "Finish a lesson check to unlock steps.",
  }
}

export const AiReportPanel = ({
  content,
  generatedAt,
  model,
  audience = "student-self",
  studentId,
  classroomId,
  showActions = audience === "student-self",
}: AiReportPanelProps) => {
  const copy = copyForAudience(audience)
  const generateKind =
    audience === "class"
      ? "class"
      : audience === "teacher-student"
        ? "student"
        : "student-self"

  if (!content) {
    return (
      <section className="app-surface flex flex-col gap-4 rounded-2xl border border-dashed border-[var(--app-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl space-y-1">
          <h2 className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {copy.emptyTitle}
          </h2>
          <p className="text-sm text-[var(--app-muted)]">{copy.emptyBody}</p>
        </div>
        <GenerateInsightReportButton
          kind={generateKind}
          studentId={studentId}
          classroomId={classroomId}
          label={copy.generateLabel}
        />
      </section>
    )
  }

  const strengths = content.strengths ?? []
  const focusAreas = content.focusAreas ?? []
  const nextSteps = content.recommendedNextSteps ?? []
  const lessonTips = content.lessonTips ?? []
  const freeTips = content.freePracticeTips ?? []
  const examples = content.examples ?? []

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--app-border)]",
        "bg-[linear-gradient(135deg,color-mix(in_oklch,var(--brand-blue)_8%,transparent),color-mix(in_oklch,var(--brand-yellow)_6%,transparent))]"
      )}
      aria-labelledby="ai-report-heading"
    >
      <div className="flex flex-col gap-4 border-b border-[var(--app-border)]/70 bg-[var(--app-surface)]/80 px-5 py-5 backdrop-blur-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
            {copy.eyebrow}
          </p>
          <h2
            id="ai-report-heading"
            className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
          >
            {content.headline ?? copy.defaultHeadline}
          </h2>
          {generatedAt ? (
            <p className="text-xs text-[var(--app-muted)]">
              {formatWhen(generatedAt)}
              {" · "}
              {model
                ? `AI model: ${model}`
                : "Rule-based summary (no AI key)"}
            </p>
          ) : null}
        </div>
        <GenerateInsightReportButton
          kind={generateKind}
          studentId={studentId}
          classroomId={classroomId}
          label={copy.refreshLabel}
        />
      </div>

      <div className="space-y-5 bg-[var(--app-surface)] px-5 py-5">
        <p className="max-w-3xl text-sm leading-relaxed text-[var(--app-fg)]">
          {content.summary}
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <TipList
            title="Strengths"
            items={strengths}
            empty={copy.strengthEmpty}
          />
          <TipList title="Focus" items={focusAreas} empty={copy.focusEmpty} />
          <TipList
            title="Next steps"
            items={nextSteps}
            empty={copy.nextEmpty}
          />
        </div>

        <InsightsCollapsible
          id={`${audience}-report-categories`}
          title="By category"
          summary={copy.categorySummary}
          defaultOpen
          className="border-0 shadow-none"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <TipList
              title={copy.lessonTitle}
              items={lessonTips}
              empty="No lesson-specific tips yet."
            />
            <TipList
              title={copy.freeTitle}
              items={freeTips}
              empty="No free-practice tips yet."
            />
          </div>
        </InsightsCollapsible>

        {examples.length > 0 ? (
          <InsightsCollapsible
            id={`${audience}-report-examples`}
            title="Examples & explanations"
            summary={copy.examplesSummary}
            badge={`${examples.length}`}
            defaultOpen={audience !== "student-self"}
          >
            <ul className="space-y-3">
              {examples.map((example) => (
                <li
                  key={example.title}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/40 px-4 py-3"
                >
                  <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {example.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--app-muted)]">
                    {example.explanation}
                  </p>
                </li>
              ))}
            </ul>
          </InsightsCollapsible>
        ) : null}

        {showActions ? (
          <div className="flex flex-wrap gap-2 border-t border-[var(--app-border)] pt-4">
            <Link
              href="/student/learn"
              className="inline-flex h-9 items-center rounded-lg bg-[var(--brand-blue)] px-3 text-xs font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
            >
              Continue learning
            </Link>
            <Link
              href="/student/code"
              className="inline-flex h-9 items-center rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 text-xs font-semibold text-[var(--app-fg)] hover:bg-[var(--app-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
            >
              Open IDE
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
