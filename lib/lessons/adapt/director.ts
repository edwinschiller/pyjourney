import { z } from "zod"

import {
  lessonBlockSchema,
  type LessonBlock,
  type LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import type { AdaptRequest, AdaptResult } from "@/lib/lessons/adapt/rules"

const adaptAiResponseSchema = z.object({
  message: z.string().nullable(),
  blocks: z.array(lessonBlockSchema).max(4),
  finishLesson: z.boolean().optional(),
})

const isOpenAiConfigured = () =>
  Boolean(process.env.OPENAI_API_KEY?.trim())

/**
 * Optional OpenAI director. Falls back silently when unset or invalid.
 * Prompt asks for 0–4 next blocks that serve the lesson objective.
 */
export const adaptLessonWithOpenAi = async (
  request: AdaptRequest
): Promise<AdaptResult | null> => {
  if (!isOpenAiConfigured()) {
    return null
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
  const { session, trigger, blockId } = request
  const recent = session.events.slice(-8)
  const current = session.blocks.find((block) => block.id === blockId)

  const system = `You are a Python lesson director for PyJourney.
You adapt micro-lesson blocks for one student. Keep the lesson objective in mind.
Return ONLY JSON matching:
{ "message": string|null, "blocks": LessonBlock[], "finishLesson"?: boolean }
Allowed block kinds: intro, multipleChoice, prediction, dragOrder, fillBlank, debug, match, miniEdit, coding, complete.
Rules:
- At most 4 blocks.
- Prefer short interactive blocks (quiz / fill / miniEdit) for remediation.
- Only use coding if needed; coding blocks MUST include deterministic tests[].
- Use finishLesson/complete only when the objective is met.
- English UI copy.
- Every block needs a unique id (prefix "ai-").`

  const user = JSON.stringify({
    objective: session.objective,
    conceptSlug: session.conceptSlug,
    trigger,
    currentBlock: current
      ? { id: current.id, kind: current.kind }
      : null,
    recentEvents: recent,
    revealedKinds: session.blocks.map((block) => block.kind),
    adaptationCount: session.adaptationCount,
  })

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    })

    if (!response.ok) {
      console.error("adaptLessonWithOpenAi status", response.status)
      return null
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = json.choices?.[0]?.message?.content
    if (!content) return null

    const parsed = adaptAiResponseSchema.safeParse(JSON.parse(content))
    if (!parsed.success) {
      console.error("adaptLessonWithOpenAi zod", parsed.error.message)
      return null
    }

    let blocks: LessonBlock[] = parsed.data.blocks
    if (parsed.data.finishLesson) {
      const hasComplete = blocks.some((block) => block.kind === "complete")
      if (!hasComplete) {
        blocks = [
          ...blocks,
          {
            id: `ai-complete-${Date.now()}`,
            kind: "complete",
            title: "Lesson complete",
            lines: ["You met the lesson objective."],
          },
        ]
      }
    }

    if (blocks.length === 0) {
      return {
        session,
        appended: [],
        message: parsed.data.message,
        source: "openai",
      }
    }

    const existingIds = new Set(session.blocks.map((block) => block.id))
    const unique = blocks.filter((block) => !existingIds.has(block.id))
    const insertAt = Math.min(session.cursor + 1, session.blocks.length)
    const nextBlocks = [
      ...session.blocks.slice(0, insertAt),
      ...unique,
      ...session.blocks.slice(insertAt),
    ]

    const nextSession: LessonSession = {
      ...session,
      blocks: nextBlocks,
      adaptationCount: session.adaptationCount + 1,
      codingPassed:
        trigger === "coding_passed" ? true : session.codingPassed,
    }

    return {
      session: nextSession,
      appended: unique,
      message: parsed.data.message,
      source: "openai",
    }
  } catch (error) {
    console.error("adaptLessonWithOpenAi", error)
    return null
  }
}

export const runLessonDirector = async (
  request: AdaptRequest
): Promise<AdaptResult> => {
  // Prefer rules for coding_passed completion reliability; AI for remediation.
  if (request.trigger === "coding_passed") {
    const { adaptLessonWithRules } = await import("@/lib/lessons/adapt/rules")
    return adaptLessonWithRules(request)
  }

  if (
    request.trigger === "step_failed" ||
    request.trigger === "coding_failed"
  ) {
    const ai = await adaptLessonWithOpenAi(request)
    if (ai && ai.appended.length > 0) {
      return ai
    }
  }

  const { adaptLessonWithRules } = await import("@/lib/lessons/adapt/rules")
  return adaptLessonWithRules(request)
}
