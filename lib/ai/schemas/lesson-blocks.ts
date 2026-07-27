import { z } from "zod"

export const stepFeedbackSchema = z.object({
  correct: z.string().min(1),
  wrong: z.string().min(1),
})

export const choiceOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
})

const blockBase = {
  id: z.string().min(1),
  /** Which curriculum topic this block teaches/checks. */
  topicId: z.string().min(1).optional(),
  /** Dedup key so the lesson never reuses the same item. */
  fingerprint: z.string().min(1).optional(),
}

/** Explain slot — body may include ```python fenced examples. */
export const explainBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("explain"),
  title: z.string().optional(),
  body: z.string().min(1),
})

/** Quiz slot — question + options; one correctId. */
export const quizBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("quiz"),
  prompt: z.string().min(1),
  code: z.string().optional(),
  choices: z.array(choiceOptionSchema).min(2).max(6),
  correctId: z.string().min(1),
  feedback: stepFeedbackSchema,
  difficulty: z.enum(["easy", "hard"]).default("easy"),
})

/** Short practice (fill / mini edit) before the final apply task. */
export const practiceBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("practice"),
  prompt: z.string().min(1),
  mode: z.enum(["fillBlank", "miniEdit"]),
  template: z.string().optional(),
  answers: z.array(z.string()).optional(),
  lines: z.array(z.string()).optional(),
  starterCode: z.string().optional(),
  mustContain: z.array(z.string()).optional(),
  /** Fail the check if any of these substrings are still present. */
  mustNotContain: z.array(z.string()).optional(),
  /** At least one regex (as string) must match the code. */
  mustMatchAny: z.array(z.string()).optional(),
  feedback: stepFeedbackSchema,
  placeholder: z.string().optional(),
})

/**
 * Final application task — open coding against criteria.
 * No prescribed solution / deterministic tests; AI reviews the submission.
 */
export const applyBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("apply"),
  title: z.string().min(1),
  brief: z.string().min(1),
  criteria: z.array(z.string().min(1)).min(2),
  /** Empty or tiny stub only — never the full solution. */
  starterCode: z.string().default(""),
})

export const completeBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("complete"),
  title: z.string().min(1),
  body: z.string().min(1),
})

export const lessonBlockSchema = z.discriminatedUnion("kind", [
  explainBlockSchema,
  quizBlockSchema,
  practiceBlockSchema,
  applyBlockSchema,
  completeBlockSchema,
])

export const topicStatusSchema = z.enum([
  "pending",
  "introduced",
  "checking",
  "mastered",
])

export const topicProgressSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  teachingGoal: z.string().min(1),
  status: topicStatusSchema.default("pending"),
  correctChecks: z.number().int().nonnegative().default(0),
  failChecks: z.number().int().nonnegative().default(0),
  /** Successful quiz checks on this topic (breadth). */
  quizPasses: z.number().int().nonnegative().default(0),
  /** Successful practice checks on this topic (breadth). */
  practicePasses: z.number().int().nonnegative().default(0),
  /**
   * After a wrong answer this stays true until the learner rebuilds
   * enough evidence (quiz + practice) — cannot be mastered while set.
   */
  needsRecheck: z.boolean().default(false),
})

export const lessonEventSchema = z.object({
  at: z.string().min(1),
  blockId: z.string().min(1),
  kind: z.string().min(1),
  passed: z.boolean(),
  topicId: z.string().optional(),
  latencyMs: z.number().nonnegative().optional(),
  attempts: z.number().int().positive().optional(),
  detail: z.unknown().optional(),
})

export const analyticsSnapshotSchema = z.object({
  at: z.string().min(1),
  confidence: z.number(),
  phase: z.string(),
  topicsMastered: z.number().int(),
  topicsTotal: z.number().int(),
  note: z.string().optional(),
})

export const lessonSessionSchema = z.object({
  version: z.literal(4),
  title: z.string().min(1),
  objective: z.string().min(1),
  conceptSlug: z.string().min(1),
  /** Curriculum coverage for this lesson — source of truth for the teach loop. */
  topics: z.array(topicProgressSchema).min(1),
  /** 0–100; starts at 0. Reaches ~100 when topics are mastered. */
  confidence: z.number().min(0).max(100).default(0),
  phase: z.enum(["teach", "apply", "done"]).default("teach"),
  pace: z.enum(["fast", "steady", "slow"]).default("steady"),
  blocks: z.array(lessonBlockSchema).default([]),
  cursor: z.number().int().nonnegative().default(0),
  events: z.array(lessonEventSchema).default([]),
  usedFingerprints: z.array(z.string()).default([]),
  analytics: z.array(analyticsSnapshotSchema).default([]),
  applyPassed: z.boolean().default(false),
  /** Number of adaptive turns in this session. */
  turnCount: z.number().int().nonnegative().optional(),
  /** @deprecated Prefer turnCount — kept for older in-flight sessions. */
  pyjoTurns: z.number().int().nonnegative().optional(),
  lastCoachSpeak: z.string().optional(),
})

export const sessionTurnCount = (session: {
  turnCount?: number
  pyjoTurns?: number
}) => session.turnCount ?? session.pyjoTurns ?? 0

export const pyjoNextOutputSchema = z.object({
  speak: z.string().min(1),
  intent: z.enum([
    "explain",
    "quiz",
    "practice",
    "remediate",
    "apply",
    "complete",
  ]),
  topicId: z.string().optional(),
  reason: z.string().min(1),
  blocks: z.array(lessonBlockSchema).min(1).max(3),
})

export const applyReviewSchema = z.object({
  passed: z.boolean(),
  speak: z.string().min(1),
  criteriaResults: z.array(
    z.object({
      criterion: z.string(),
      met: z.boolean(),
      note: z.string().optional(),
    })
  ),
})

export type LessonBlock = z.infer<typeof lessonBlockSchema>
export type LessonEvent = z.infer<typeof lessonEventSchema>
export type TopicProgress = z.infer<typeof topicProgressSchema>
export type LessonSession = z.infer<typeof lessonSessionSchema>
export type PyjoNextOutput = z.infer<typeof pyjoNextOutputSchema>
export type ApplyReview = z.infer<typeof applyReviewSchema>

export const parseLessonSession = (value: unknown): LessonSession =>
  lessonSessionSchema.parse(value)

export const safeParseLessonSession = (value: unknown) =>
  lessonSessionSchema.safeParse(value)

/**
 * Migrate sessions that still carry the old default start confidence (50)
 * before any successful check. New lessons start at 0.
 */
export const normalizeLessonSession = (session: LessonSession): LessonSession => {
  const hasSuccessfulCheck = session.topics.some(
    (topic) => topic.correctChecks > 0 || topic.status === "mastered"
  )
  if (hasSuccessfulCheck || session.confidence === 0) return session
  return { ...session, confidence: 0 }
}
