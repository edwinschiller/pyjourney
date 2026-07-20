import { z } from "zod"

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

const blockBase = { id: z.string().min(1) }

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
  fillBlankBlockSchema,
  debugBlockSchema,
  miniEditBlockSchema,
  codingBlockSchema,
  completeBlockSchema,
])

export const lessonEventSchema = z.object({
  at: z.string().min(1),
  blockId: z.string().min(1),
  kind: z.string().min(1),
  passed: z.boolean(),
  /** Milliseconds from block shown to submit/check. */
  latencyMs: z.number().nonnegative().optional(),
  attempts: z.number().int().positive().optional(),
  detail: z.unknown().optional(),
})

export const learnerStateSchema = z.object({
  pace: z.enum(["fast", "steady", "slow"]).default("steady"),
  confidence: z.number().min(0).max(1).default(0.5),
  struggleTopics: z.array(z.string()).default([]),
  correctStreak: z.number().int().nonnegative().default(0),
  failStreak: z.number().int().nonnegative().default(0),
  stepsCompleted: z.number().int().nonnegative().default(0),
})

export const lessonSessionSchema = z.object({
  version: z.literal(3),
  title: z.string().min(1),
  objective: z.string().min(1),
  conceptSlug: z.string().min(1),
  coachName: z.literal("PyJo").default("PyJo"),
  blocks: z.array(lessonBlockSchema).default([]),
  cursor: z.number().int().nonnegative().default(0),
  events: z.array(lessonEventSchema).default([]),
  learner: learnerStateSchema.default({
    pace: "steady",
    confidence: 0.5,
    struggleTopics: [],
    correctStreak: 0,
    failStreak: 0,
    stepsCompleted: 0,
  }),
  codingPassed: z.boolean().default(false),
  pyjoTurns: z.number().int().nonnegative().default(0),
  lastCoachSpeak: z.string().optional(),
})

export const pyjoNextOutputSchema = z.object({
  speak: z.string().min(1),
  intent: z.enum([
    "explain",
    "quiz_easy",
    "quiz_hard",
    "scaffold",
    "coding",
    "complete",
    "remediate",
  ]),
  reason: z.string().min(1),
  blocks: z.array(lessonBlockSchema).min(1).max(3),
  masteryDeltaSuggestion: z.number().min(-5).max(12).optional(),
})

export type LessonTest = z.infer<typeof lessonTestSchema>
export type LessonBlock = z.infer<typeof lessonBlockSchema>
export type LessonEvent = z.infer<typeof lessonEventSchema>
export type LearnerState = z.infer<typeof learnerStateSchema>
export type LessonSession = z.infer<typeof lessonSessionSchema>
export type PyjoNextOutput = z.infer<typeof pyjoNextOutputSchema>

export const parseLessonSession = (value: unknown): LessonSession =>
  lessonSessionSchema.parse(value)

export const safeParseLessonSession = (value: unknown) =>
  lessonSessionSchema.safeParse(value)
