import type {
  LessonBlock,
  LessonEvent,
  LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import { VARIABLES_REMEDIATION } from "@/lib/lessons/templates/variables"

export type AdaptTrigger =
  | "step_failed"
  | "coding_failed"
  | "coding_passed"
  | "manual"

export type AdaptRequest = {
  session: LessonSession
  trigger: AdaptTrigger
  blockId: string
}

export type AdaptResult = {
  session: LessonSession
  appended: LessonBlock[]
  message: string | null
  source: "rules" | "openai" | "none"
  /** Optional cursor override after injection. */
  cursor?: number
}

const recentFailsForBlock = (events: LessonEvent[], blockId: string) => {
  let count = 0
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const event = events[i]
    if (event.blockId !== blockId) {
      if (event.passed) break
      continue
    }
    if (event.passed) break
    count += 1
  }
  return count
}

const hasCompleteBlock = (blocks: LessonBlock[]) =>
  blocks.some((block) => block.kind === "complete")

const insertAtIndex = (
  session: LessonSession,
  index: number,
  newBlocks: LessonBlock[]
): LessonSession => {
  if (newBlocks.length === 0) return session
  const existingIds = new Set(session.blocks.map((block) => block.id))
  const unique = newBlocks.filter((block) => !existingIds.has(block.id))
  if (unique.length === 0) return session

  const insertAt = Math.max(0, Math.min(index, session.blocks.length))
  const blocks = [
    ...session.blocks.slice(0, insertAt),
    ...unique,
    ...session.blocks.slice(insertAt),
  ]

  return {
    ...session,
    blocks,
    adaptationCount: session.adaptationCount + 1,
  }
}

const appendBlocks = (
  session: LessonSession,
  newBlocks: LessonBlock[]
): LessonSession => {
  if (newBlocks.length === 0) return session
  const existingIds = new Set(session.blocks.map((block) => block.id))
  const unique = newBlocks.filter((block) => !existingIds.has(block.id))
  if (unique.length === 0) return session
  return {
    ...session,
    blocks: [...session.blocks, ...unique],
    adaptationCount: session.adaptationCount + 1,
  }
}

/**
 * Rule-based lesson director. Keeps the objective in mind and injects
 * remediation or completion blocks without revealing the whole path upfront.
 */
export const adaptLessonWithRules = (request: AdaptRequest): AdaptResult => {
  const { session, trigger, blockId } = request

  if (!session.adaptive) {
    return { session, appended: [], message: null, source: "none" }
  }

  if (trigger === "coding_passed") {
    if (hasCompleteBlock(session.blocks)) {
      return {
        session: { ...session, codingPassed: true },
        appended: [],
        message: null,
        source: "none",
      }
    }
    const complete = VARIABLES_REMEDIATION.complete()
    const next = appendBlocks({ ...session, codingPassed: true }, complete)
    return {
      session: next,
      appended: complete,
      message: "Great work — finishing this lesson.",
      source: "rules",
    }
  }

  if (trigger === "coding_failed") {
    const fails = recentFailsForBlock(session.events, blockId)
    if (fails < 2 || session.adaptationCount >= 4) {
      return { session, appended: [], message: null, source: "none" }
    }
    const already = session.blocks.some((block) => block.id === "var-rem-mini")
    if (already) {
      return { session, appended: [], message: null, source: "none" }
    }
    const scaffold = VARIABLES_REMEDIATION.codingScaffold()
    // Insert warm-up *before* the coding challenge, jump cursor there.
    const next = insertAtIndex(session, session.cursor, scaffold)
    return {
      session: { ...next, cursor: session.cursor },
      appended: scaffold,
      message: "Let's warm up with a smaller step, then retry the challenge.",
      source: "rules",
      cursor: session.cursor,
    }
  }

  if (trigger === "step_failed") {
    const fails = recentFailsForBlock(session.events, blockId)
    if (fails < 2 || session.adaptationCount >= 4) {
      return { session, appended: [], message: null, source: "none" }
    }
    const already = session.blocks.some((block) => block.id === "var-rem-intro")
    if (already) {
      return { session, appended: [], message: null, source: "none" }
    }
    if (session.conceptSlug !== "variables") {
      return { session, appended: [], message: null, source: "none" }
    }
    const remediation = VARIABLES_REMEDIATION.assignBasics()
    const next = insertAtIndex(session, session.cursor + 1, remediation)
    return {
      session: next,
      appended: remediation,
      message: "Quick review unlocked — then continue.",
      source: "rules",
    }
  }

  return { session, appended: [], message: null, source: "none" }
}
