/**
 * Legacy single-page lesson schema removed in favour of micro-block sessions.
 * @see `@/lib/ai/schemas/lesson-blocks`
 */
export {
  lessonBlockSchema,
  lessonSessionSchema,
  lessonTestSchema,
  parseLessonSession,
  safeParseLessonSession,
  type LessonBlock,
  type LessonSession,
  type LessonTest,
} from "@/lib/ai/schemas/lesson-blocks"
