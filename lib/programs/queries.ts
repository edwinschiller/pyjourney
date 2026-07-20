import { and, desc, eq } from "drizzle-orm"

import { getDb } from "@/lib/db"
import { savedPrograms } from "@/lib/db/schema"

export type SavedProgramRecord = {
  id: string
  title: string
  code: string
  source: "ide" | "lesson"
  updatedAt: Date
  createdAt: Date
}

export const listIdeProgramsForStudent = async (
  studentId: string
): Promise<SavedProgramRecord[]> => {
  const db = getDb()
  const rows = await db
    .select({
      id: savedPrograms.id,
      title: savedPrograms.title,
      code: savedPrograms.code,
      source: savedPrograms.source,
      updatedAt: savedPrograms.updatedAt,
      createdAt: savedPrograms.createdAt,
    })
    .from(savedPrograms)
    .where(
      and(
        eq(savedPrograms.studentId, studentId),
        eq(savedPrograms.source, "ide")
      )
    )
    .orderBy(desc(savedPrograms.updatedAt))

  return rows
}

export const getProgramForStudent = async (
  studentId: string,
  programId: string
): Promise<SavedProgramRecord | null> => {
  const db = getDb()
  const rows = await db
    .select({
      id: savedPrograms.id,
      title: savedPrograms.title,
      code: savedPrograms.code,
      source: savedPrograms.source,
      updatedAt: savedPrograms.updatedAt,
      createdAt: savedPrograms.createdAt,
    })
    .from(savedPrograms)
    .where(
      and(
        eq(savedPrograms.id, programId),
        eq(savedPrograms.studentId, studentId)
      )
    )
    .limit(1)

  return rows[0] ?? null
}
