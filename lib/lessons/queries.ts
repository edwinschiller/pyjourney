import { and, desc, eq, inArray } from "drizzle-orm"

import { getDb } from "@/lib/db"
import { concepts, lessons } from "@/lib/db/schema"
import {
  parseLessonSession,
  type LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"

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
  if (!row) {
    return null
  }

  try {
    return {
      id: row.id,
      studentId: row.studentId,
      conceptId: row.conceptId,
      conceptSlug: row.conceptSlug,
      conceptTitle: row.conceptTitle,
      status: row.status,
      content: parseLessonSession(row.content),
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
      createdAt: lessons.createdAt,
    })
    .from(lessons)
    .where(and(eq(lessons.studentId, studentId), eq(lessons.status, "active")))
    .orderBy(desc(lessons.createdAt))

  const map = new Map<string, string>()
  for (const row of rows) {
    if (!map.has(row.conceptId)) {
      map.set(row.conceptId, row.id)
    }
  }
  return map
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
      ...(status ? { status } : {}),
    })
    .where(and(eq(lessons.id, lessonId), eq(lessons.studentId, studentId)))
    .returning({ id: lessons.id })

  return Boolean(updated[0])
}

export const abandonActiveLessonsForConcept = async (
  studentId: string,
  conceptId: string,
  exceptLessonId?: string
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

  const ids = active
    .map((row) => row.id)
    .filter((id) => id !== exceptLessonId)

  if (ids.length === 0) return

  await db
    .update(lessons)
    .set({ status: "abandoned", updatedAt: new Date() })
    .where(inArray(lessons.id, ids))
}
