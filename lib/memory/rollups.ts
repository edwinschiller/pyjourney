import { and, eq } from "drizzle-orm"

import { getDb } from "@/lib/db"
import {
  learnerMisconceptionStats,
  learnerTopicStats,
} from "@/lib/db/schema"

import type { LearnerEventOutcome } from "./types"

export const bumpTopicStats = async (input: {
  studentId: string
  conceptId: string
  topicId: string
  topicTitle: string
  outcome: LearnerEventOutcome
  latencyMs?: number | null
}) => {
  const db = getDb()
  const now = new Date()
  const latency = Math.max(0, Math.round(input.latencyMs ?? 0))
  const passInc = input.outcome === "pass" ? 1 : 0
  const failInc = input.outcome === "fail" ? 1 : 0

  const existing = await db
    .select()
    .from(learnerTopicStats)
    .where(
      and(
        eq(learnerTopicStats.studentId, input.studentId),
        eq(learnerTopicStats.conceptId, input.conceptId),
        eq(learnerTopicStats.topicId, input.topicId)
      )
    )
    .limit(1)

  const row = existing[0]
  if (!row) {
    await db.insert(learnerTopicStats).values({
      studentId: input.studentId,
      conceptId: input.conceptId,
      topicId: input.topicId,
      topicTitle: input.topicTitle || input.topicId,
      attempts: 1,
      passes: passInc,
      fails: failInc,
      totalLatencyMs: latency,
      lastOutcome: input.outcome,
      lastSeenAt: now,
      updatedAt: now,
    })
    return
  }

  await db
    .update(learnerTopicStats)
    .set({
      topicTitle: input.topicTitle || row.topicTitle,
      attempts: row.attempts + 1,
      passes: row.passes + passInc,
      fails: row.fails + failInc,
      totalLatencyMs: row.totalLatencyMs + latency,
      lastOutcome: input.outcome,
      lastSeenAt: now,
      updatedAt: now,
    })
    .where(eq(learnerTopicStats.id, row.id))
}

export const bumpMisconceptionStats = async (input: {
  studentId: string
  conceptId?: string | null
  tag: string
}) => {
  const tag = input.tag.trim().slice(0, 160)
  if (!tag) return

  const db = getDb()
  const now = new Date()

  const existing = await db
    .select()
    .from(learnerMisconceptionStats)
    .where(
      and(
        eq(learnerMisconceptionStats.studentId, input.studentId),
        eq(learnerMisconceptionStats.tag, tag)
      )
    )
    .limit(1)

  const row = existing[0]
  if (!row) {
    await db.insert(learnerMisconceptionStats).values({
      studentId: input.studentId,
      conceptId: input.conceptId ?? null,
      tag,
      count: 1,
      lastSeenAt: now,
      updatedAt: now,
    })
    return
  }

  await db
    .update(learnerMisconceptionStats)
    .set({
      conceptId: input.conceptId ?? row.conceptId,
      count: row.count + 1,
      lastSeenAt: now,
      updatedAt: now,
    })
    .where(eq(learnerMisconceptionStats.id, row.id))
}
