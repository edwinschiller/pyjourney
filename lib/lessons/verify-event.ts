import type {
  LessonBlock,
  LessonEvent,
  LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import {
  allTopicsMastered,
} from "@/lib/lesson-engine/policy"
import {
  createInitialStepState,
  isStepComplete,
} from "@/lib/lessons/validate-step"

export class LessonIntegrityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "LessonIntegrityError"
  }
}

type EventDetail = {
  interaction?: string
  choiceId?: string
  response?: string
  code?: string
  stderr?: string
}

const asDetail = (value: unknown): EventDetail => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const record = value as Record<string, unknown>
  return {
    interaction:
      typeof record.interaction === "string" ? record.interaction : undefined,
    choiceId: typeof record.choiceId === "string" ? record.choiceId : undefined,
    response: typeof record.response === "string" ? record.response : undefined,
    code: typeof record.code === "string" ? record.code : undefined,
    stderr: typeof record.stderr === "string" ? record.stderr : undefined,
  }
}

const findBlock = (session: LessonSession, blockId: string) =>
  session.blocks.find((block) => block.id === blockId) ?? null

/**
 * Recompute whether a check event actually passed against the lesson block.
 * Never trusts client `passed` / apply shortcuts.
 */
export const verifyLessonEvent = (
  session: LessonSession,
  event: LessonEvent
): LessonEvent => {
  if (event.kind === "apply") {
    throw new LessonIntegrityError(
      "Apply results must go through the review action."
    )
  }

  const block = findBlock(session, event.blockId)
  if (!block) {
    throw new LessonIntegrityError("Check does not match this lesson.")
  }

  if (block.kind !== "quiz" && block.kind !== "practice") {
    throw new LessonIntegrityError("This step cannot record a check event.")
  }

  if (event.kind !== block.kind) {
    throw new LessonIntegrityError("Check kind does not match the step.")
  }

  if (event.topicId && block.topicId && event.topicId !== block.topicId) {
    throw new LessonIntegrityError("Check topic does not match the step.")
  }

  const detail = asDetail(event.detail)
  const passed = evaluateBlockPass(block, detail)

  return {
    ...event,
    kind: block.kind,
    topicId: block.topicId ?? event.topicId,
    passed,
    detail: {
      ...detail,
      interaction:
        detail.interaction ??
        (block.kind === "quiz"
          ? "choice"
          : block.mode === "fillBlank"
            ? "fillBlank"
            : "miniEdit"),
      verified: true,
    },
  }
}

const evaluateBlockPass = (block: LessonBlock, detail: EventDetail) => {
  if (block.kind === "quiz") {
    const choiceId = detail.choiceId?.trim()
    if (!choiceId) {
      throw new LessonIntegrityError("Quiz checks require a selected choice.")
    }
    const valid = block.choices.some((choice) => choice.id === choiceId)
    if (!valid) {
      throw new LessonIntegrityError("Selected choice is not valid for this quiz.")
    }
    return choiceId === block.correctId
  }

  if (block.kind === "practice" && block.mode === "fillBlank") {
    const state = {
      ...createInitialStepState(block),
      fillValue: detail.response ?? "",
      fillSubmitted: true,
      attempts: 1,
    }
    return isStepComplete(block, state)
  }

  if (block.kind === "practice" && block.mode === "miniEdit") {
    if (typeof detail.code !== "string") {
      throw new LessonIntegrityError("Practice checks require the editor code.")
    }
    const state = {
      ...createInitialStepState(block),
      miniEditCode: detail.code,
      miniEditChecked: true,
      attempts: 1,
    }
    return isStepComplete(block, state, { stderr: detail.stderr })
  }

  throw new LessonIntegrityError("Unsupported practice mode.")
}

/** Lesson may finish only on the complete step after apply evidence. */
export const assertLessonCompletable = (session: LessonSession) => {
  const block = session.blocks[session.cursor]
  if (!block || block.kind !== "complete") {
    throw new LessonIntegrityError(
      "Finish is only available on the complete step."
    )
  }

  if (session.applyPassed) return

  if (session.phase === "done" && allTopicsMastered(session.topics)) return

  throw new LessonIntegrityError(
    "Finish requires a passed apply challenge first."
  )
}
