import { createOpenAI } from "@ai-sdk/openai"
import { generateText, Output } from "ai"

import {
  parseLessonSession,
  pyjoNextOutputSchema,
  type LessonEvent,
  type LessonSession,
  type PyjoNextOutput,
} from "@/lib/ai/schemas/lesson-blocks"
import { buildVariablesBlocksForIntent, emptyVariablesSession } from "@/lib/pyjo/bank"
import { choosePyjoIntent, updateLearnerState } from "@/lib/pyjo/policy"

const isAiConfigured = () => Boolean(process.env.OPENAI_API_KEY?.trim())

export type PyjoNextRequest = {
  session: LessonSession
  /** Optional event that just happened before asking for next blocks. */
  event?: LessonEvent
  bootstrap?: boolean
}

export type PyjoNextResult = {
  session: LessonSession
  output: PyjoNextOutput
  source: "openai" | "rules"
}

const appendUniqueBlocks = (
  session: LessonSession,
  blocks: LessonSession["blocks"]
) => {
  const ids = new Set(session.blocks.map((block) => block.id))
  const unique = blocks.filter((block) => !ids.has(block.id))
  return {
    ...session,
    blocks: [...session.blocks, ...unique],
  }
}

const runRules = (session: LessonSession, bootstrap: boolean): PyjoNextResult => {
  const intent = choosePyjoIntent({
    learner: session.learner,
    lastEvent: session.events.at(-1) ?? null,
    hasCodingPassed: session.codingPassed,
    hasComplete: session.blocks.some((block) => block.kind === "complete"),
    pyjoTurns: session.pyjoTurns,
    revealedKinds: session.blocks.map((block) => block.kind),
  })

  // Fresh lesson: always start with explain
  const effectiveIntent = bootstrap || session.pyjoTurns === 0 ? "explain" : intent
  const output = buildVariablesBlocksForIntent(effectiveIntent, session)
  let next = appendUniqueBlocks(session, output.blocks)
  next = {
    ...next,
    pyjoTurns: next.pyjoTurns + 1,
    lastCoachSpeak: output.speak,
    cursor: Math.max(0, next.blocks.length - output.blocks.length),
  }

  return { session: next, output, source: "rules" }
}

const runOpenAi = async (
  session: LessonSession,
  bootstrap: boolean
): Promise<PyjoNextResult | null> => {
  if (!isAiConfigured()) return null

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
  const intentHint = choosePyjoIntent({
    learner: session.learner,
    lastEvent: session.events.at(-1) ?? null,
    hasCodingPassed: session.codingPassed,
    hasComplete: session.blocks.some((block) => block.kind === "complete"),
    pyjoTurns: session.pyjoTurns,
    revealedKinds: session.blocks.map((block) => block.kind),
  })

  try {
    const result = await generateText({
      model: openai(modelId),
      output: Output.object({ schema: pyjoNextOutputSchema }),
      system: `You are PyJo, a warm, concise Python coach inside PyJourney.
Return the next 1–3 micro-lesson blocks for ONE student.
Speak in English, short coach voice (1–2 sentences in "speak").
Respect the suggested intent unless you have a strong reason.
Block kinds: intro, multipleChoice, prediction, fillBlank, debug, miniEdit, coding, complete.
Coding blocks MUST include deterministic tests[].
Never reveal a full solution early. Unique block ids required.`,
      prompt: JSON.stringify({
        bootstrap,
        suggestedIntent: bootstrap ? "explain" : intentHint,
        objective: session.objective,
        conceptSlug: session.conceptSlug,
        learner: session.learner,
        recentEvents: session.events.slice(-8),
        revealedKinds: session.blocks.map((block) => block.kind),
        codingPassed: session.codingPassed,
        pyjoTurns: session.pyjoTurns,
      }),
    })

    const output = result.output
    if (!output) return null

    let next = appendUniqueBlocks(session, output.blocks)
    next = {
      ...next,
      pyjoTurns: next.pyjoTurns + 1,
      lastCoachSpeak: output.speak,
      cursor: Math.max(0, next.blocks.length - output.blocks.length),
    }
    return { session: next, output, source: "openai" }
  } catch (error) {
    console.error("PyJo OpenAI next failed", error)
    return null
  }
}

/** Core PyJo turn: update learner from event, then fetch next blocks. */
export const runPyjoNext = async (
  request: PyjoNextRequest
): Promise<PyjoNextResult> => {
  let session = parseLessonSession(request.session)

  if (request.event) {
    session = {
      ...session,
      events: [...session.events, request.event],
      learner: updateLearnerState(session.learner, request.event),
      codingPassed:
        request.event.kind === "coding" && request.event.passed
          ? true
          : session.codingPassed,
    }
  }

  const bootstrap = Boolean(request.bootstrap) || session.blocks.length === 0

  const ai = await runOpenAi(session, bootstrap)
  if (ai) return ai
  return runRules(session, bootstrap)
}

export const createInitialSessionForSlug = (slug: string): LessonSession | null => {
  if (slug !== "variables") return null
  return emptyVariablesSession()
}

export const hasPyjoLessonForSlug = (slug: string) => slug === "variables"
