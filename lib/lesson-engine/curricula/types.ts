/**
 * Curriculum layer — source of truth for WHAT a lesson must teach.
 *
 * Runtime sessions only store slim topic progress (id/title/goal/status).
 * Teaching depth lives here and drives the content bank + AI prompts.
 */

export type TopicSpec = {
  id: string
  title: string
  /** One-line outcome the learner should achieve. */
  teachingGoal: string
  /** Ordered points that MUST appear across explains for this topic. */
  mustCover: string[]
  /** Wrong ideas the lesson should remediate. */
  misconceptions: string[]
  /** Canonical Python snippets (shown in ```python fences in content). */
  examples: string[]
  /** What checks should probe (bank quizzes / AI quiz generation). */
  checkIdeas: string[]
  /** How many correct checks before the topic is mastered (minimum enforced at 3). */
  masteryChecks: number
}

export type ApplySpec = {
  title: string
  /** Learner-facing brief (no solution code). */
  brief: string
  /** Visible success criteria. */
  criteria: string[]
  /** Progressive hints that may surface after a failed review. */
  hints: string[]
  /**
   * Server/AI-only grading guidance — never paste a full solution.
   * Used by reviewApplySubmission.
   */
  evaluationGuide: string
}

export type LessonBlueprint = {
  slug: string
  title: string
  /** Overall lesson objective shown to the learner. */
  objective: string
  /**
   * Why this lesson exists in the path (author notes, not shown in UI).
   */
  rationale: string
  /** Ordered coverage — teach loop walks this left → right. */
  topics: TopicSpec[]
  apply: ApplySpec
}

/** Slim view copied into LessonSession.topics. */
export const toSessionTopics = (blueprint: LessonBlueprint) =>
  blueprint.topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    teachingGoal: topic.teachingGoal,
    status: "pending" as const,
    correctChecks: 0,
    failChecks: 0,
    quizPasses: 0,
    practicePasses: 0,
    needsRecheck: false,
  }))

/**
 * Effective checks required for mastery.
 * Floor of 3, plus extra evidence after failures.
 */
export const effectiveMasteryChecks = (
  masteryChecks: number | undefined,
  failChecks: number
) => {
  const base = Math.max(masteryChecks ?? 3, 3)
  const extra = failChecks >= 2 ? 2 : failChecks >= 1 ? 1 : 0
  return base + extra
}