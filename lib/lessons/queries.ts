import { and, desc, eq, inArray } from "drizzle-orm"

import {
  normalizeLessonSession,
  parseLessonSession,
  type LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import { getDb } from "@/lib/db"
import { concepts, lessons } from "@/lib/db/schema"

export type LessonRecord = {
  id: string
  studentId: string
  conceptId: string
  conceptSlug: string
  conceptTitle: string
  status: "active" | "completed" | "abandoned"
  content: LessonSession
  createdAt: Date
  updatedAt: Date
}

export const getLessonForStudent = async (
  lessonId: string,
  studentId: string
): Promise<LessonRecord | null> => {
  const db = getDb()
  const rows = await db
    .select({
      id: lessons.id,
      studentId: lessons.studentId,
      conceptId: lessons.conceptId,
      status: lessons.status,
      content: lessons.content,
      createdAt: lessons.createdAt,
      updatedAt: lessons.updatedAt,
      conceptSlug: concepts.slug,
      conceptTitle: concepts.title,
    })
    .from(lessons)
    .innerJoin(concepts, eq(concepts.id, lessons.conceptId))
    .where(and(eq(lessons.id, lessonId), eq(lessons.studentId, studentId)))
    .limit(1)

  const row = rows[0]
  if (!row) return null

  try {
    const parsed = parseLessonSession(row.content)
    const content = normalizeLessonSession(parsed)
    if (content.confidence !== parsed.confidence && row.status === "active") {
      await db
        .update(lessons)
        .set({
          content,
          updatedAt: new Date(),
          schemaVersion: 4,
        })
        .where(and(eq(lessons.id, lessonId), eq(lessons.studentId, studentId)))
    }
    return {
      id: row.id,
      studentId: row.studentId,
      conceptId: row.conceptId,
      conceptSlug: row.conceptSlug,
      conceptTitle: row.conceptTitle,
      status: row.status,
      content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  } catch {
    return null
  }
}

export const listActiveLessonsByConcept = async (studentId: string) => {
  const db = getDb()
  const rows = await db
    .select({
      id: lessons.id,
      conceptId: lessons.conceptId,
      content: lessons.content,
    })
    .from(lessons)
    .where(and(eq(lessons.studentId, studentId), eq(lessons.status, "active")))
    .orderBy(desc(lessons.createdAt))

  const map = new Map<string, string>()
  const topicProgressByConcept = new Map<
    string,
    { topicsMastered: number; topicsTotal: number }
  >()

  for (const row of rows) {
    if (map.has(row.conceptId)) continue
    const progress = readTopicProgressSummary(row.content)
    if (!progress) continue
    map.set(row.conceptId, row.id)
    topicProgressByConcept.set(row.conceptId, progress)
  }
  return { byConceptId: map, topicProgressByConcept }
}

/** Lightweight topic counts without full session parse/heal. */
const readTopicProgressSummary = (content: unknown) => {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return null
  }
  const topics = (content as { topics?: unknown }).topics
  if (!Array.isArray(topics)) return null

  let topicsMastered = 0
  for (const topic of topics) {
    if (!topic || typeof topic !== "object" || Array.isArray(topic)) continue
    const row = topic as { status?: unknown; needsRecheck?: unknown }
    if (row.status === "mastered" && row.needsRecheck !== true) {
      topicsMastered += 1
    }
  }
  return { topicsMastered, topicsTotal: topics.length }
}

export const listCompletedConceptIds = async (studentId: string) => {
  const db = getDb()
  const rows = await db
    .select({ conceptId: lessons.conceptId })
    .from(lessons)
    .where(
      and(eq(lessons.studentId, studentId), eq(lessons.status, "completed"))
    )
  return new Set(rows.map((row) => row.conceptId))
}

export const updateLessonContent = async (
  lessonId: string,
  studentId: string,
  content: LessonSession,
  status?: "active" | "completed" | "abandoned"
) => {
  const db = getDb()
  const updated = await db
    .update(lessons)
    .set({
      content,
      updatedAt: new Date(),
      schemaVersion: 4,
      ...(status ? { status } : {}),
    })
    .where(and(eq(lessons.id, lessonId), eq(lessons.studentId, studentId)))
    .returning({ id: lessons.id })
  return Boolean(updated[0])
}

export const abandonActiveLessonsForConcept = async (
  studentId: string,
  conceptId: string
) => {
  const db = getDb()
  const active = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(
      and(
        eq(lessons.studentId, studentId),
        eq(lessons.conceptId, conceptId),
        eq(lessons.status, "active")
      )
    )
  const ids = active.map((row) => row.id)
  if (ids.length === 0) return
  await db
    .update(lessons)
    .set({ status: "abandoned", updatedAt: new Date() })
    .where(inArray(lessons.id, ids))
}
