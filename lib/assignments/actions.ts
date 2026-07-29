"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/session"
import {
  assertTeacherOwnsClassroom,
  ClassroomAccessError,
} from "@/lib/classrooms/access"
import { listClassroomMembers } from "@/lib/classrooms/queries"
import { getDb } from "@/lib/db"
import {
  assignmentRecipients,
  assignments,
  concepts,
} from "@/lib/db/schema"

export type AssignmentActionState = {
  ok: boolean
  error?: string
} | null

export const createClassAssignmentAction = async (
  _prev: AssignmentActionState,
  formData: FormData
): Promise<AssignmentActionState> => {
  const user = await requireRole(["teacher"])
  const classroomId = String(formData.get("classroomId") ?? "").trim()
  const conceptId = String(formData.get("conceptId") ?? "").trim()
  const titleRaw = String(formData.get("title") ?? "").trim()

  if (!classroomId || !conceptId) {
    return { ok: false, error: "Choose a class and a concept." }
  }

  try {
    await assertTeacherOwnsClassroom(user.id, classroomId)
  } catch (error) {
    if (error instanceof ClassroomAccessError) {
      return { ok: false, error: "Classroom not found." }
    }
    throw error
  }

  const db = getDb()
  const conceptRows = await db
    .select({
      id: concepts.id,
      title: concepts.title,
      isActive: concepts.isActive,
    })
    .from(concepts)
    .where(eq(concepts.id, conceptId))
    .limit(1)

  const concept = conceptRows[0]
  if (!concept?.isActive) {
    return { ok: false, error: "Concept not found." }
  }

  const members = await listClassroomMembers(classroomId)
  if (members.length === 0) {
    return {
      ok: false,
      error: "Add students to the class before assigning work.",
    }
  }

  const title =
    titleRaw || `Practice: ${concept.title}`

  const [created] = await db
    .insert(assignments)
    .values({
      classroomId,
      createdBy: user.id,
      title,
      conceptId: concept.id,
      customPrompt: null,
      dueAt: null,
    })
    .returning({ id: assignments.id })

  if (!created) {
    return { ok: false, error: "Could not create assignment." }
  }

  await db.insert(assignmentRecipients).values(
    members.map((member) => ({
      assignmentId: created.id,
      studentId: member.studentId,
      status: "assigned" as const,
    }))
  )

  revalidatePath("/teacher/assignments")
  revalidatePath("/teacher/classes")
  revalidatePath(`/teacher/classes/${classroomId}`)
  revalidatePath("/student")
  revalidatePath("/student/learn")
  return { ok: true }
}
