import { and, eq } from "drizzle-orm"

import type { MasteryScoreMap } from "@/lib/curriculum"
import { getDb } from "@/lib/db"
import { conceptMastery } from "@/lib/db/schema"

import {
  clampScore,
  scoreToBand,
  type MasteryBand,
  type MasteryRecord,
} from "./bands"

export const listMasteryForStudent = async (
  studentId: string
): Promise<MasteryRecord[]> => {
  const db = getDb()
  const rows = await db
    .select()
    .from(conceptMastery)
    .where(eq(conceptMastery.studentId, studentId))

  return rows.map((row) => ({
    id: row.id,
    studentId: row.studentId,
    conceptId: row.conceptId,
    score: row.score,
    band: row.band,
    evidenceCount: row.evidenceCount,
    updatedAt: row.updatedAt,
  }))
}

export const toMasteryScoreMap = (
  records: MasteryRecord[]
): MasteryScoreMap => {
  const map: MasteryScoreMap = new Map()
  for (const record of records) {
    map.set(record.conceptId, record.score)
  }
  return map
}

export const getMasteryScoreMapForStudent = async (studentId: string) => {
  const records = await listMasteryForStudent(studentId)
  return toMasteryScoreMap(records)
}

export const getMasteryForConcept = async (
  studentId: string,
  conceptId: string
): Promise<MasteryRecord | null> => {
  const db = getDb()
  const rows = await db
    .select()
    .from(conceptMastery)
    .where(
      and(
        eq(conceptMastery.studentId, studentId),
        eq(conceptMastery.conceptId, conceptId)
      )
    )
    .limit(1)

  const row = rows[0]
  if (!row) {
    return null
  }

  return {
    id: row.id,
    studentId: row.studentId,
    conceptId: row.conceptId,
    score: row.score,
    band: row.band,
    evidenceCount: row.evidenceCount,
    updatedAt: row.updatedAt,
  }
}

type UpsertMasteryInput = {
  studentId: string
  conceptId: string
  score: number
  evidenceDelta?: number
}

export const upsertMasteryScore = async (
  input: UpsertMasteryInput
): Promise<MasteryRecord> => {
  const db = getDb()
  const score = clampScore(input.score)
  const band: MasteryBand = scoreToBand(score)
  const evidenceDelta = input.evidenceDelta ?? 0

  const existing = await getMasteryForConcept(input.studentId, input.conceptId)

  if (existing) {
    const [updated] = await db
      .update(conceptMastery)
      .set({
        score,
        band,
        evidenceCount: Math.max(0, existing.evidenceCount + evidenceDelta),
        updatedAt: new Date(),
      })
      .where(eq(conceptMastery.id, existing.id))
      .returning()

    return {
      id: updated.id,
      studentId: updated.studentId,
      conceptId: updated.conceptId,
      score: updated.score,
      band: updated.band,
      evidenceCount: updated.evidenceCount,
      updatedAt: updated.updatedAt,
    }
  }

  const [created] = await db
    .insert(conceptMastery)
    .values({
      studentId: input.studentId,
      conceptId: input.conceptId,
      score,
      band,
      evidenceCount: Math.max(0, evidenceDelta),
    })
    .returning()

  return {
    id: created.id,
    studentId: created.studentId,
    conceptId: created.conceptId,
    score: created.score,
    band: created.band,
    evidenceCount: created.evidenceCount,
    updatedAt: created.updatedAt,
  }
}
