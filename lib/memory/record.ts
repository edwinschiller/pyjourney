import type { LessonEvent } from "@/lib/ai/schemas/lesson-blocks"
import { getDb } from "@/lib/db"
import { learnerEvents } from "@/lib/db/schema"
import { getTopicSpec } from "@/lib/lesson-engine/curricula"

import { bumpMisconceptionStats, bumpTopicStats } from "./rollups"
import {
  resolveMisconceptionTag,
  sourceFromBlockKind,
} from "./tags"
import type { RecordLearnerEventInput } from "./types"

const insertEvent = async (input: RecordLearnerEventInput) => {
  const db = getDb()
  const [row] = await db
    .insert(learnerEvents)
    .values({
      studentId: input.studentId,
      conceptId: input.conceptId,
      lessonId: input.lessonId ?? null,
      topicId: input.topicId ?? null,
      source: input.source,
      outcome: input.outcome,
      signal: input.signal.slice(0, 80),
      misconceptionTag: input.misconceptionTag?.slice(0, 160) ?? null,
      latencyMs:
        typeof input.latencyMs === "number"
          ? Math.max(0, Math.round(input.latencyMs))
          : null,
      payload: input.payload ?? null,
    })
    .returning({ id: learnerEvents.id })

  return row?.id ?? null
}

/**
 * Record a learning signal and refresh rollups.
 * Soft-fails so lesson sync is never blocked by analytics.
 */
export const recordLearnerEvent = async (
  input: RecordLearnerEventInput
): Promise<{ ok: boolean; id?: string }> => {
  try {
    const id = await insertEvent(input)

    if (input.topicId) {
      await bumpTopicStats({
        studentId: input.studentId,
        conceptId: input.conceptId,
        topicId: input.topicId,
        topicTitle:
          input.topicTitle ||
          getTopicSpec(input.conceptSlug ?? "", input.topicId)?.title ||
          input.topicId,
        outcome: input.outcome,
        latencyMs: input.latencyMs,
      })
    }

    if (input.outcome === "fail" && input.misconceptionTag) {
      await bumpMisconceptionStats({
        studentId: input.studentId,
        conceptId: input.conceptId,
        tag: input.misconceptionTag,
      })
    }

    return { ok: true, id: id ?? undefined }
  } catch (error) {
    console.error("recordLearnerEvent", error)
    return { ok: false }
  }
}

export const recordLessonCheckEvent = async (input: {
  studentId: string
  conceptId: string
  conceptSlug: string
  lessonId: string
  event: LessonEvent
  topicTitle?: string | null
}) => {
  const source = sourceFromBlockKind(input.event.kind)
  if (!source) return { ok: false as const }

  const outcome = input.event.passed ? ("pass" as const) : ("fail" as const)
  const signal = input.event.passed ? `${source}_pass` : `${source}_fail`
  const misconceptionTag =
    outcome === "fail"
      ? resolveMisconceptionTag({
          conceptSlug: input.conceptSlug,
          topicId: input.event.topicId,
          fallbackSignal: signal,
        })
      : null

  return recordLearnerEvent({
    studentId: input.studentId,
    conceptId: input.conceptId,
    lessonId: input.lessonId,
    topicId: input.event.topicId,
    topicTitle: input.topicTitle,
    conceptSlug: input.conceptSlug,
    source,
    outcome,
    signal,
    misconceptionTag,
    latencyMs: input.event.latencyMs,
    payload: {
      blockId: input.event.blockId,
      attempts: input.event.attempts,
      detail:
        typeof input.event.detail === "string"
          ? input.event.detail.slice(0, 200)
          : undefined,
    },
  })
}

export const recordApplyReviewEvents = async (input: {
  studentId: string
  conceptId: string
  conceptSlug: string
  lessonId: string
  passed: boolean
  criteriaResults?: Array<{
    criterion: string
    met: boolean
    note?: string
  }>
}) => {
  const results = await Promise.all(
    (input.criteriaResults ?? []).map((row) =>
      recordLearnerEvent({
        studentId: input.studentId,
        conceptId: input.conceptId,
        lessonId: input.lessonId,
        conceptSlug: input.conceptSlug,
        source: "apply",
        outcome: row.met ? "pass" : "fail",
        signal: row.met ? "criterion_met" : "criterion_miss",
        misconceptionTag: row.met
          ? null
          : (row.note?.trim() || row.criterion).slice(0, 160),
        payload: { criterion: row.criterion, note: row.note },
      })
    )
  )

  // Overall apply outcome (even when criteria list is empty).
  await recordLearnerEvent({
    studentId: input.studentId,
    conceptId: input.conceptId,
    lessonId: input.lessonId,
    conceptSlug: input.conceptSlug,
    source: "apply",
    outcome: input.passed ? "pass" : "fail",
    signal: input.passed ? "apply_pass" : "apply_fail",
    misconceptionTag: input.passed
      ? null
      : "Application task still needs work",
  })

  return results
}

export const recordLessonCompleteEvent = async (input: {
  studentId: string
  conceptId: string
  lessonId: string
}) =>
  recordLearnerEvent({
    studentId: input.studentId,
    conceptId: input.conceptId,
    lessonId: input.lessonId,
    source: "lesson_complete",
    outcome: "pass",
    signal: "lesson_complete",
  })
