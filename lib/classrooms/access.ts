import { and, eq, isNull } from "drizzle-orm"
import { redirect } from "next/navigation"

import { getDb } from "@/lib/db"
import { classroomMemberships, classrooms } from "@/lib/db/schema"

export class ClassroomAccessError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ClassroomAccessError"
  }
}

export const getOwnedClassroom = async (
  teacherId: string,
  classroomId: string
) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(classrooms)
    .where(
      and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, teacherId))
    )
    .limit(1)

  return rows[0] ?? null
}

export const assertTeacherOwnsClassroom = async (
  teacherId: string,
  classroomId: string
) => {
  const classroom = await getOwnedClassroom(teacherId, classroomId)
  if (!classroom) {
    throw new ClassroomAccessError("Classroom not found")
  }
  return classroom
}

export const assertActiveClassroomForJoin = async (classroomId: string) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(classrooms)
    .where(and(eq(classrooms.id, classroomId), isNull(classrooms.archivedAt)))
    .limit(1)

  const classroom = rows[0]
  if (!classroom) {
    throw new ClassroomAccessError("Classroom is not available to join")
  }
  return classroom
}

export const assertStudentInClassroom = async (
  studentId: string,
  classroomId: string
) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(classroomMemberships)
    .where(
      and(
        eq(classroomMemberships.classroomId, classroomId),
        eq(classroomMemberships.studentId, studentId)
      )
    )
    .limit(1)

  if (!rows[0]) {
    throw new ClassroomAccessError("Student is not a member of this classroom")
  }
}

export const requireOwnedClassroomOrRedirect = async (
  teacherId: string,
  classroomId: string
) => {
  const classroom = await getOwnedClassroom(teacherId, classroomId)
  if (!classroom) {
    redirect("/teacher/classes")
  }
  return classroom
}
