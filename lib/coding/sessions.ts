import { and, desc, eq, isNull } from "drizzle-orm"

import { getDb } from "@/lib/db"
import { codingSessions, concepts, lessons } from "@/lib/db/schema"

export class CodingSessionAccessError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CodingSessionAccessError"
  }
}

const assertSessionTargets = async (input: {
  studentId: string
  mode: "lesson" | "free"
  lessonId?: string | null
  conceptId?: string | null
}) => {
  const db = getDb()
  const lessonId = input.lessonId ?? null
  const conceptId = input.conceptId ?? null

  if (input.mode === "lesson" && !lessonId) {
    throw new CodingSessionAccessError("Lesson sessions require a lessonId.")
  }

  if (!lessonId && !conceptId) return

  if (lessonId) {
    const rows = await db
      .select({
        id: lessons.id,
        conceptId: lessons.conceptId,
      })
      .from(lessons)
      .where(
        and(eq(lessons.id, lessonId), eq(lessons.studentId, input.studentId))
      )
      .limit(1)

    const lesson = rows[0]
    if (!lesson) {
      throw new CodingSessionAccessError("Lesson not found for this student.")
    }

    if (conceptId && conceptId !== lesson.conceptId) {
      throw new CodingSessionAccessError(
        "Concept does not match the lesson session."
      )
    }
    return
  }

  if (conceptId) {
    const rows = await db
      .select({ id: concepts.id })
      .from(concepts)
      .where(and(eq(concepts.id, conceptId), eq(concepts.isActive, true)))
      .limit(1)

    if (!rows[0]) {
      throw new CodingSessionAccessError("Concept not found.")
    }
  }
}

export const startCodingSession = async (input: {
  studentId: string
  mode: "lesson" | "free"
  lessonId?: string | null
  conceptId?: string | null
}) => {
  await assertSessionTargets(input)

  const db = getDb()
  // Reuse open session for same lesson/free mode to avoid spam rows.
  const existing = await db
    .select()
    .from(codingSessions)
    .where(
      and(
        eq(codingSessions.studentId, input.studentId),
        eq(codingSessions.mode, input.mode),
        isNull(codingSessions.endedAt),
        input.lessonId
          ? eq(codingSessions.lessonId, input.lessonId)
          : isNull(codingSessions.lessonId)
      )
    )
    .orderBy(desc(codingSessions.startedAt))
    .limit(1)

  if (existing[0]) return existing[0]

  const created = await db
    .insert(codingSessions)
    .values({
      studentId: input.studentId,
      mode: input.mode,
      lessonId: input.lessonId ?? null,
      conceptId: input.conceptId ?? null,
    })
    .returning()
  return created[0]!
}

export const touchCodingSession = async (
  sessionId: string,
  studentId: string,
  activeSecondsDelta = 15
) => {
  const db = getDb()
  const rows = await db
    .select({ activeSeconds: codingSessions.activeSeconds })
    .from(codingSessions)
    .where(
      and(
        eq(codingSessions.id, sessionId),
        eq(codingSessions.studentId, studentId)
      )
    )
    .limit(1)
  const current = rows[0]?.activeSeconds ?? 0
  await db
    .update(codingSessions)
    .set({ activeSeconds: current + activeSecondsDelta })
    .where(eq(codingSessions.id, sessionId))
}

export const endCodingSession = async (
  sessionId: string,
  studentId: string
) => {
  const db = getDb()
  await db
    .update(codingSessions)
    .set({ endedAt: new Date() })
    .where(
      and(
        eq(codingSessions.id, sessionId),
        eq(codingSessions.studentId, studentId)
      )
    )
}
