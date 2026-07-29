import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { and, desc, eq } from "drizzle-orm"

import { getDb } from "@/lib/db"
import { exerciseAttempts, hints } from "@/lib/db/schema"
import { applyMasteryEvent } from "@/lib/mastery"
import { getBlueprint, getTopicSpec } from "@/lib/lesson-engine/curricula"

export type HintSlideKind = "quiz" | "practice" | "apply"

const buildFallbackHint = (input: {
  slideKind: HintSlideKind
  level: number
  conceptSlug: string
  topicId?: string | null
}) => {
  const topic = input.topicId
    ? getTopicSpec(input.conceptSlug, input.topicId)
    : null
  const blueprint = getBlueprint(input.conceptSlug)

  if (input.slideKind === "apply") {
    const applyHints = blueprint?.apply.hints ?? []
    return (
      applyHints[Math.min(input.level - 1, Math.max(0, applyHints.length - 1))] ??
      "Check each success criterion one by one, then change only one thing and re-run."
    )
  }

  // Quiz / practice: stay on the current topic — never pull apply-challenge tips.
  if (input.level === 1) {
    return (
      topic?.teachingGoal ??
      "Re-read the question carefully, then try the smallest change that could be right."
    )
  }
  if (input.level === 2) {
    return (
      topic?.checkIdeas?.[0] ??
      topic?.mustCover?.[0] ??
      "Name the Python idea this step is testing, then answer from that idea only."
    )
  }
  if (input.level === 3) {
    return (
      topic?.misconceptions?.[0]
        ? `Watch out for this common mistake: ${topic.misconceptions[0]}`
        : topic?.examples?.[0]
          ? `Compare with this pattern (do not copy blindly): ${topic.examples[0]}`
          : "Eliminate one wrong option / line, then decide again."
    )
  }
  return (
    topic?.examples?.[0] ??
    "You are close — focus on the exact syntax or choice this topic requires."
  )
}

export const requestLessonHint = async (input: {
  studentId: string
  lessonId: string
  conceptId: string
  conceptSlug: string
  slideKind: HintSlideKind
  topicId?: string | null
  code?: string
  slidePrompt?: string | null
  slideBody?: string | null
  level?: number
}) => {
  const db = getDb()
  const existing = await db
    .select({ level: hints.level })
    .from(hints)
    .where(
      and(eq(hints.studentId, input.studentId), eq(hints.lessonId, input.lessonId))
    )
    .orderBy(desc(hints.level))
    .limit(1)

  const nextLevel = Math.min(
    4,
    Math.max(1, input.level ?? (existing[0]?.level ?? 0) + 1)
  )
  const topic = input.topicId
    ? getTopicSpec(input.conceptSlug, input.topicId)
    : null

  let message = buildFallbackHint({
    slideKind: input.slideKind,
    level: nextLevel,
    conceptSlug: input.conceptSlug,
    topicId: input.topicId,
  })

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (apiKey) {
    try {
      const openai = createOpenAI({ apiKey })
      const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
      const result = await generateText({
        model: openai(modelId),
        system: `You give staged Python learning hints for school students.
Slide kind: ${input.slideKind}. Stay strictly on THIS slide — do not talk about a later final project.
Level ${nextLevel}/4: 1=nudge, 2=strategy, 3=concrete tip, 4=near-answer without full solution.
English, max 3 short sentences. Never paste a complete solution.`,
        prompt: JSON.stringify({
          concept: input.conceptSlug,
          slideKind: input.slideKind,
          topic: topic
            ? {
                id: topic.id,
                title: topic.title,
                teachingGoal: topic.teachingGoal,
                misconceptions: topic.misconceptions,
                checkIdeas: topic.checkIdeas,
                examples: topic.examples,
              }
            : null,
          slidePrompt: input.slidePrompt,
          slideBody: input.slideBody?.slice(0, 1500) ?? null,
          code: input.code?.slice(0, 4000) ?? "",
          level: nextLevel,
        }),
        temperature: 0.4,
        maxOutputTokens: 180,
      })
      if (result.text.trim()) message = result.text.trim()
    } catch (error) {
      console.error("hint generation failed", error)
    }
  }

  const attempt = await db
    .insert(exerciseAttempts)
    .values({
      studentId: input.studentId,
      lessonId: input.lessonId,
      conceptId: input.conceptId,
      code: input.code ?? "",
      passed: false,
      hintLevelReached: nextLevel,
      testResults: { source: "hint", slideKind: input.slideKind },
    })
    .returning()

  await db.insert(hints).values({
    studentId: input.studentId,
    lessonId: input.lessonId,
    exerciseAttemptId: attempt[0]?.id ?? null,
    level: nextLevel,
    message,
  })

  await applyMasteryEvent(input.studentId, input.conceptId, {
    type: "hint_used",
    level: nextLevel,
  })

  return { level: nextLevel, message }
}
