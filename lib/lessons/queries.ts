import { and, eq } from "drizzle-orm"

import { getDb } from "@/lib/db"
import { concepts, lessons } from "@/lib/db/schema"
import {
  parseLessonContent,
  type LessonContent,
} from "@/lib/lessons/schema"

export type LessonRecord = {
  id: string
  studentId: string
  conceptId: string
  conceptSlug: string
  conceptTitle: string
  status: "active" | "completed" | "abandoned"
  content: LessonContent
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

  return {
    id: row.id,
    studentId: row.studentId,
    conceptId: row.conceptId,
    conceptSlug: row.conceptSlug,
    conceptTitle: row.conceptTitle,
    status: row.status,
    content: parseLessonContent(row.content),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
