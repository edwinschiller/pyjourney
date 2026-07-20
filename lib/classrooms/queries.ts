import { and, asc, count, desc, eq, isNull } from "drizzle-orm"

import { getDb } from "@/lib/db"
import { classroomMemberships, classrooms, profiles } from "@/lib/db/schema"

export type ClassroomListItem = {
  id: string
  name: string
  joinCode: string
  archivedAt: Date | null
  createdAt: Date
  memberCount: number
}

export type ClassroomMember = {
  studentId: string
  displayName: string | null
  email: string
  joinedAt: Date
}

export const listTeacherClassrooms = async (
  teacherId: string
): Promise<ClassroomListItem[]> => {
  const db = getDb()

  const rows = await db
    .select({
      id: classrooms.id,
      name: classrooms.name,
      joinCode: classrooms.joinCode,
      archivedAt: classrooms.archivedAt,
      createdAt: classrooms.createdAt,
      memberCount: count(classroomMemberships.studentId),
    })
    .from(classrooms)
    .leftJoin(
      classroomMemberships,
      eq(classroomMemberships.classroomId, classrooms.id)
    )
    .where(eq(classrooms.teacherId, teacherId))
    .groupBy(
      classrooms.id,
      classrooms.name,
      classrooms.joinCode,
      classrooms.archivedAt,
      classrooms.createdAt
    )
    .orderBy(desc(classrooms.createdAt))

  return rows
    .map((row) => ({
      ...row,
      memberCount: Number(row.memberCount),
    }))
    .sort((a, b) => {
      const aArchived = a.archivedAt ? 1 : 0
      const bArchived = b.archivedAt ? 1 : 0
      if (aArchived !== bArchived) {
        return aArchived - bArchived
      }
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
}

export const countActiveTeacherClassrooms = async (teacherId: string) => {
  const db = getDb()
  const rows = await db
    .select({ value: count() })
    .from(classrooms)
    .where(
      and(eq(classrooms.teacherId, teacherId), isNull(classrooms.archivedAt))
    )

  return Number(rows[0]?.value ?? 0)
}

export const listClassroomMembers = async (
  classroomId: string
): Promise<ClassroomMember[]> => {
  const db = getDb()

  return db
    .select({
      studentId: classroomMemberships.studentId,
      displayName: profiles.displayName,
      email: profiles.email,
      joinedAt: classroomMemberships.joinedAt,
    })
    .from(classroomMemberships)
    .innerJoin(profiles, eq(profiles.id, classroomMemberships.studentId))
    .where(eq(classroomMemberships.classroomId, classroomId))
    .orderBy(asc(profiles.displayName), asc(profiles.email))
}

export const listStudentClassrooms = async (studentId: string) => {
  const db = getDb()

  return db
    .select({
      id: classrooms.id,
      name: classrooms.name,
      joinCode: classrooms.joinCode,
      archivedAt: classrooms.archivedAt,
      joinedAt: classroomMemberships.joinedAt,
      teacherDisplayName: profiles.displayName,
      teacherEmail: profiles.email,
    })
    .from(classroomMemberships)
    .innerJoin(
      classrooms,
      eq(classrooms.id, classroomMemberships.classroomId)
    )
    .innerJoin(profiles, eq(profiles.id, classrooms.teacherId))
    .where(eq(classroomMemberships.studentId, studentId))
    .orderBy(desc(classroomMemberships.joinedAt))
}
