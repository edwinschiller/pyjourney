import {
  applyDeltaToScore,
  computeMasteryDelta,
  type MasteryEvent,
} from "./rules"
import type { MasteryRecord } from "./bands"
import { getMasteryForConcept, upsertMasteryScore } from "./queries"

export type ApplyMasteryEventResult = {
  previousScore: number
  delta: number
  record: MasteryRecord
}

/**
 * Apply a learning event to a student's concept mastery.
 * Creates a row at score 0 if none exists yet.
 */
export const applyMasteryEvent = async (
  studentId: string,
  conceptId: string,
  event: MasteryEvent
): Promise<ApplyMasteryEventResult> => {
  const existing = await getMasteryForConcept(studentId, conceptId)
  const previousScore = existing?.score ?? 0
  const delta = computeMasteryDelta(event)
  const nextScore = applyDeltaToScore(previousScore, delta)
  const evidenceDelta = delta !== 0 || event.type === "test_fail" ? 1 : 0

  const record = await upsertMasteryScore({
    studentId,
    conceptId,
    score: nextScore,
    evidenceDelta,
  })

  return { previousScore, delta, record }
}
