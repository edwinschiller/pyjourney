import { z } from "zod"

import { assertUsableQuizBlock, withShuffledQuizChoices } from "@/lib/lessons/quiz-quality"
import { expandCollapsedPython, normalizeMarkdownFences } from "@/lib/markdown/fences"

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

export const lessonNextIntentSchema = z.enum([
  "explain",
  "quiz",
  "practice",
  "remediate",
  "apply",
  "complete",
])

/**
 * Flat block shape for OpenAI structured output.
 * Responses API rejects `oneOf` (Zod discriminatedUnion) in array items,
 * and requires every property in `required` — use nullables instead of optional.
 */
export const lessonBlockAiSchema = z.object({
  kind: z.enum(["explain", "quiz", "practice", "apply", "complete"]),
  id: z.string().min(1),
  topicId: z.string().nullable(),
  fingerprint: z.string().nullable(),
  title: z.string().nullable(),
  body: z.string().nullable(),
  prompt: z.string().nullable(),
  code: z.string().nullable(),
  choices: z.array(choiceOptionSchema).nullable(),
  correctId: z.string().nullable(),
  feedback: stepFeedbackSchema.nullable(),
  difficulty: z.enum(["easy", "hard"]).nullable(),
  mode: z.enum(["fillBlank", "miniEdit"]).nullable(),
  template: z.string().nullable(),
  answers: z.array(z.string()).nullable(),
  lines: z.array(z.string()).nullable(),
  starterCode: z.string().nullable(),
  mustContain: z.array(z.string()).nullable(),
  mustNotContain: z.array(z.string()).nullable(),
  mustMatchAny: z.array(z.string()).nullable(),
  placeholder: z.string().nullable(),
  brief: z.string().nullable(),
  criteria: z.array(z.string().min(1)).nullable(),
})

export const lessonNextAiOutputSchema = z.object({
  speak: z.string().min(1),
  intent: lessonNextIntentSchema,
  topicId: z.string().nullable(),
  reason: z.string().min(1),
  blocks: z.array(lessonBlockAiSchema).min(1).max(3),
})

export const lessonNextOutputSchema = z.object({
  speak: z.string().min(1),
  intent: lessonNextIntentSchema,
  topicId: z.string().optional(),
  reason: z.string().min(1),
  blocks: z.array(lessonBlockSchema).min(1).max(3),
})

export type LessonBlock = z.infer<typeof lessonBlockSchema>
export type LessonEvent = z.infer<typeof lessonEventSchema>
export type TopicProgress = z.infer<typeof topicProgressSchema>
export type LessonSession = z.infer<typeof lessonSessionSchema>
export type LessonNextOutput = z.infer<typeof lessonNextOutputSchema>

const nullToUndefined = <T,>(value: T | null | undefined): T | undefined =>
  value == null ? undefined : value

export const coerceLessonBlock = (
  block: z.infer<typeof lessonBlockAiSchema>
): LessonBlock => {
  const base = {
    id: block.id,
    topicId: nullToUndefined(block.topicId),
    fingerprint: nullToUndefined(block.fingerprint),
  }

  switch (block.kind) {
    case "explain":
      return explainBlockSchema.parse({
        ...base,
        kind: "explain",
        title: nullToUndefined(block.title),
        body: normalizeMarkdownFences(block.body ?? ""),
      })
    case "quiz": {
      const prompt = (block.prompt ?? "").trim()
      const choices = block.choices ?? []
      const correctId = block.correctId ?? ""
      const rawCode = nullToUndefined(block.code)
      assertUsableQuizBlock({
        prompt,
        choices,
        correctId,
        code: rawCode,
      })
      return withShuffledQuizChoices(
        quizBlockSchema.parse({
          ...base,
          kind: "quiz",
          prompt,
          code: rawCode ? expandCollapsedPython(rawCode) : undefined,
          choices,
          correctId,
          feedback: block.feedback ?? {
            correct: "Correct!",
            wrong: "Not quite — try again.",
          },
          difficulty: block.difficulty ?? "easy",
        })
      )
    }
    case "practice": {
      const mode = block.mode ?? "miniEdit"
      const prompt = (block.prompt ?? "").trim()
      if (!prompt) {
        throw new Error("Practice block missing prompt")
      }
      if (mode === "fillBlank") {
        if (!(block.template ?? "").includes("___")) {
          throw new Error("fillBlank practice needs a template with ___")
        }
        if (!(block.answers ?? []).length) {
          throw new Error("fillBlank practice needs answers")
        }
      } else {
        const lines = (block.lines ?? []).map((line) => line.trim()).filter(Boolean)
        const mustContain = (block.mustContain ?? [])
          .map((item) => item.trim())
          .filter(Boolean)
        if (lines.length === 0 && mustContain.length === 0) {
          throw new Error(
            "miniEdit practice needs requirement lines or mustContain"
          )
        }
        if (lines.length > 4) {
          throw new Error("miniEdit practice is too large (max 4 requirement lines)")
        }
        if (/accomplishes the following|write a (complete )?program/i.test(prompt)) {
          throw new Error("miniEdit practice looks like a full apply challenge")
        }
        const starterLines = (block.starterCode ?? "").split("\n").length
        if (starterLines > 12) {
          throw new Error("miniEdit starterCode is too long for practice")
        }
      }
      return practiceBlockSchema.parse({
        ...base,
        kind: "practice",
        prompt,
        mode,
        template: nullToUndefined(block.template),
        answers: nullToUndefined(block.answers),
        lines: nullToUndefined(block.lines)?.filter((line) => line.trim()),
        starterCode: nullToUndefined(block.starterCode),
        mustContain: nullToUndefined(block.mustContain),
        mustNotContain: nullToUndefined(block.mustNotContain),
        mustMatchAny: nullToUndefined(block.mustMatchAny),
        feedback: block.feedback ?? {
          correct: "Nice work!",
          wrong: "Check the requirements and try again.",
        },
        placeholder: nullToUndefined(block.placeholder),
      })
    }
    case "apply": {
      const brief = (block.brief ?? "").trim()
      const criteria = (block.criteria ?? [])
        .map((item) => item.trim())
        .filter(Boolean)
      if (!brief || criteria.length < 2) {
        throw new Error("Apply block needs brief and at least 2 criteria")
      }
      return applyBlockSchema.parse({
        ...base,
        kind: "apply",
        title: (block.title ?? "Apply").trim() || "Apply",
        brief,
        criteria,
        starterCode: block.starterCode ?? "",
      })
    }
    case "complete":
      return completeBlockSchema.parse({
        ...base,
        kind: "complete",
        title: block.title ?? "Complete",
        body: normalizeMarkdownFences(block.body ?? ""),
      })
  }
}

export const coerceLessonNextOutput = (
  raw: z.infer<typeof lessonNextAiOutputSchema>
): LessonNextOutput =>
  lessonNextOutputSchema.parse({
    speak: raw.speak,
    intent: raw.intent,
    topicId: nullToUndefined(raw.topicId),
    reason: raw.reason,
    blocks: raw.blocks.map(coerceLessonBlock),
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

/** OpenAI-safe apply review (nullable instead of optional). */
export const applyReviewAiSchema = z.object({
  passed: z.boolean(),
  speak: z.string().min(1),
  criteriaResults: z.array(
    z.object({
      criterion: z.string(),
      met: z.boolean(),
      note: z.string().nullable(),
    })
  ),
})

export type ApplyReview = z.infer<typeof applyReviewSchema>

export const coerceApplyReview = (
  raw: z.infer<typeof applyReviewAiSchema>
): ApplyReview =>
  applyReviewSchema.parse({
    ...raw,
    criteriaResults: raw.criteriaResults.map((row) => ({
      criterion: row.criterion,
      met: row.met,
      note: row.note ?? undefined,
    })),
  })

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
