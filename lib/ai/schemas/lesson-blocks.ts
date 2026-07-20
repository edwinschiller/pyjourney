import { z } from "zod"

/** Deterministic coding checks (Pyodide harness). */
export const lessonTestSchema = z
  .object({
    id: z.string().min(1),
    description: z.string().min(1),
    setup: z.string().optional(),
    assertion: z.string().optional(),
    expectsStdoutIncludes: z.string().optional(),
  })
  .refine((test) => Boolean(test.assertion || test.expectsStdoutIncludes), {
    message: "Each test needs assertion and/or expectsStdoutIncludes.",
  })

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
}

export const introBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("intro"),
  title: z.string().optional(),
  lines: z.array(z.string().min(1)).min(1),
})

export const multipleChoiceBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("multipleChoice"),
  prompt: z.string().min(1),
  code: z.string().optional(),
  choices: z.array(choiceOptionSchema).min(2).max(6),
  correctId: z.string().min(1),
  feedback: stepFeedbackSchema,
})

export const predictionBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("prediction"),
  prompt: z.string().min(1),
  code: z.string().min(1),
  choices: z.array(choiceOptionSchema).min(2).max(6),
  correctId: z.string().min(1),
  feedback: stepFeedbackSchema,
})

export const dragOrderBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("dragOrder"),
  prompt: z.string().min(1),
  blocks: z.array(z.string().min(1)).min(2),
  correctOrder: z.array(z.number().int().nonnegative()).min(2),
  feedback: stepFeedbackSchema,
})

export const fillBlankBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("fillBlank"),
  prompt: z.string().min(1),
  template: z.string().min(1),
  answers: z.array(z.string()),
  feedback: stepFeedbackSchema,
  placeholder: z.string().optional(),
})

export const debugBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("debug"),
  prompt: z.string().min(1),
  code: z.string().min(1),
  choices: z.array(choiceOptionSchema).min(2).max(6),
  correctId: z.string().min(1),
  feedback: stepFeedbackSchema,
})

export const matchBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("match"),
  prompt: z.string().min(1),
  pairs: z
    .array(
      z.object({
        left: z.string().min(1),
        right: z.string().min(1),
      })
    )
    .min(2),
  feedback: stepFeedbackSchema,
})

export const miniEditBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("miniEdit"),
  prompt: z.string().min(1),
  lines: z.array(z.string().min(1)).min(1),
  starterCode: z.string(),
  mustContain: z.array(z.string().min(1)).min(1),
  feedback: stepFeedbackSchema,
})

export const codingBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("coding"),
  title: z.string().min(1),
  lines: z.array(z.string().min(1)).min(1),
  starterCode: z.string().default(""),
  tests: z.array(lessonTestSchema).min(1),
  successCriteria: z.string().optional(),
})

export const completeBlockSchema = z.object({
  ...blockBase,
  kind: z.literal("complete"),
  title: z.string().min(1),
  lines: z.array(z.string().min(1)).min(1),
})

export const lessonBlockSchema = z.discriminatedUnion("kind", [
  introBlockSchema,
  multipleChoiceBlockSchema,
  predictionBlockSchema,
  dragOrderBlockSchema,
  fillBlankBlockSchema,
  debugBlockSchema,
  matchBlockSchema,
  miniEditBlockSchema,
  codingBlockSchema,
  completeBlockSchema,
])

export const lessonEventSchema = z.object({
  at: z.string().min(1),
  blockId: z.string().min(1),
  kind: z.string().min(1),
  passed: z.boolean(),
  detail: z.unknown().optional(),
})

/** Persistable lesson session (revealed blocks only grow over time). */
export const lessonSessionSchema = z.object({
  version: z.literal(2),
  title: z.string().min(1),
  objective: z.string().min(1),
  conceptSlug: z.string().min(1),
  /** When true, director may append remediation / complete blocks. */
  adaptive: z.boolean().default(true),
  blocks: z.array(lessonBlockSchema).min(1),
  cursor: z.number().int().nonnegative().default(0),
  events: z.array(lessonEventSchema).default([]),
  codingPassed: z.boolean().default(false),
  adaptationCount: z.number().int().nonnegative().default(0),
})

export type LessonTest = z.infer<typeof lessonTestSchema>
export type StepFeedback = z.infer<typeof stepFeedbackSchema>
export type LessonBlock = z.infer<typeof lessonBlockSchema>
export type LessonEvent = z.infer<typeof lessonEventSchema>
export type LessonSession = z.infer<typeof lessonSessionSchema>
export type CodingBlock = z.infer<typeof codingBlockSchema>

export const parseLessonSession = (value: unknown): LessonSession =>
  lessonSessionSchema.parse(value)

export const safeParseLessonSession = (value: unknown) =>
  lessonSessionSchema.safeParse(value)

/** @deprecated Old single-page lesson shape — kept for type narrowing only. */
export const isLegacyLessonContent = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  return "explanation" in record && "comprehensionCheck" in record
}
