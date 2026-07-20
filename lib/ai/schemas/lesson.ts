import { z } from "zod"

export const lessonComprehensionCheckSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  correctIndex: z.number().int().nonnegative(),
  explanation: z.string().min(1),
})

export const lessonTestSchema = z
  .object({
    id: z.string().min(1),
    description: z.string().min(1),
    /** Optional Python setup before the assertion (same namespace as student code). */
    setup: z.string().optional(),
    /** Python that must not raise — typically assert statements. */
    assertion: z.string().optional(),
    /** Checked against captured stdout after student code runs. */
    expectsStdoutIncludes: z.string().optional(),
  })
  .refine((test) => Boolean(test.assertion || test.expectsStdoutIncludes), {
    message: "Each test needs assertion and/or expectsStdoutIncludes.",
  })

/** Zod LessonSchema used by UI, DB content, and (later) AI generation. */
export const lessonContentSchema = z.object({
  title: z.string().min(1),
  objective: z.string().min(1),
  explanation: z.string().min(1),
  example: z.string().min(1),
  comprehensionCheck: lessonComprehensionCheckSchema,
  exercise: z.string().min(1),
  starterCode: z.string(),
  visibleExamples: z.array(z.string()).default([]),
  tests: z.array(lessonTestSchema).min(1),
  transfer: z
    .object({
      prompt: z.string().min(1),
      starterCode: z.string().optional(),
      tests: z.array(lessonTestSchema).optional(),
    })
    .optional(),
})

export type LessonContent = z.infer<typeof lessonContentSchema>
export type LessonTest = z.infer<typeof lessonTestSchema>
export type LessonComprehensionCheck = z.infer<
  typeof lessonComprehensionCheckSchema
>

export const parseLessonContent = (value: unknown): LessonContent =>
  lessonContentSchema.parse(value)

export const safeParseLessonContent = (value: unknown) =>
  lessonContentSchema.safeParse(value)
