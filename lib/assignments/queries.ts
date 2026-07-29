import { and, asc, desc, eq, inArray } from "drizzle-orm"

import { getDb } from "@/lib/db"
import {
  assignmentRecipients,
  assignments,
  classrooms,
  concepts,
} from "@/lib/db/schema"

export type TeacherAssignmentRow = {
  id: string
  title: string
  classroomId: string
  classroomName: string
  conceptId: string | null
  conceptTitle: string | null
  createdAt: Date
  recipientCount: number
  completedCount: number
}

export const listTeacherAssignments = async (
  teacherId: string
): Promise<TeacherAssignmentRow[]> => {
  const db = getDb()

  const rows = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      classroomId: assignments.classroomId,
      classroomName: classrooms.name,
      conceptId: assignments.conceptId,
      conceptTitle: concepts.title,
      createdAt: assignments.createdAt,
    })
    .from(assignments)
    .innerJoin(classrooms, eq(classrooms.id, assignments.classroomId))
    .leftJoin(concepts, eq(concepts.id, assignments.conceptId))
    .where(eq(assignments.createdBy, teacherId))
    .orderBy(desc(assignments.createdAt))
    .limit(50)

  if (rows.length === 0) return []

  const ids = rows.map((row) => row.id)
  const recipientRows = await db
    .select({
      assignmentId: assignmentRecipients.assignmentId,
      status: assignmentRecipients.status,
    })
    .from(assignmentRecipients)
    .where(inArray(assignmentRecipients.assignmentId, ids))

  const stats = new Map<string, { total: number; completed: number }>()
  for (const row of recipientRows) {
    const current = stats.get(row.assignmentId) ?? { total: 0, completed: 0 }
    current.total += 1
    if (row.status === "completed") current.completed += 1
    stats.set(row.assignmentId, current)
  }

  return rows.map((row) => {
    const counts = stats.get(row.id) ?? { total: 0, completed: 0 }
    return {
      ...row,
      recipientCount: counts.total,
      completedCount: counts.completed,
    }
  })
}

export const listActiveConceptsForAssign = async () => {
  const db = getDb()
  return db
    .select({
      id: concepts.id,
      title: concepts.title,
      slug: concepts.slug,
      orderIndex: concepts.orderIndex,
    })
    .from(concepts)
    .where(eq(concepts.isActive, true))
    .orderBy(asc(concepts.orderIndex), asc(concepts.title))
}

export const countAssignedRecipients = async (assignmentId: string) => {
  const db = getDb()
  const rows = await db
    .select({ studentId: assignmentRecipients.studentId })
    .from(assignmentRecipients)
    .where(
      and(
        eq(assignmentRecipients.assignmentId, assignmentId),
        eq(assignmentRecipients.status, "assigned")
      )
    )
  return rows.length
}

/** Mark open concept assignments complete when the student finishes that lesson. */
export const completeAssignmentsForConcept = async (
  studentId: string,
  conceptId: string
) => {
  const db = getDb()
  const open = await db
    .select({
      assignmentId: assignmentRecipients.assignmentId,
    })
    .from(assignmentRecipients)
    .innerJoin(
      assignments,
      eq(assignments.id, assignmentRecipients.assignmentId)
    )
    .where(
      and(
        eq(assignmentRecipients.studentId, studentId),
        eq(assignmentRecipients.status, "assigned"),
        eq(assignments.conceptId, conceptId)
      )
    )

  if (open.length === 0) return 0

  const ids = open.map((row) => row.assignmentId)
  await db
    .update(assignmentRecipients)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(
      and(
        eq(assignmentRecipients.studentId, studentId),
        inArray(assignmentRecipients.assignmentId, ids)
      )
    )
  return ids.length
}
