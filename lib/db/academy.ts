import { eq } from "drizzle-orm"

import {
  ACADEMY_CLASS_NAME,
  ACADEMY_JOIN_CODE,
  SYSTEM_ACADEMY_EMAIL,
  SYSTEM_ACADEMY_TEACHER_ID,
} from "./constants"
import { getDb } from "./index"
import { classroomMemberships, classrooms, profiles } from "./schema"

export const ensureAcademyClassroom = async () => {
  const db = getDb()

  const existingTeacher = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, SYSTEM_ACADEMY_TEACHER_ID))
    .limit(1)

  if (existingTeacher.length === 0) {
    await db.insert(profiles).values({
      id: SYSTEM_ACADEMY_TEACHER_ID,
      email: SYSTEM_ACADEMY_EMAIL,
      displayName: "PyJourney Academy",
      role: "admin",
      status: "active",
    })
  }

  const existingClass = await db
    .select()
    .from(classrooms)
    .where(eq(classrooms.joinCode, ACADEMY_JOIN_CODE))
    .limit(1)

  if (existingClass[0]) {
    return existingClass[0]
  }

  const [created] = await db
    .insert(classrooms)
    .values({
      name: ACADEMY_CLASS_NAME,
      joinCode: ACADEMY_JOIN_CODE,
      teacherId: SYSTEM_ACADEMY_TEACHER_ID,
    })
    .returning()

  return created
}

export const ensureAcademyMembership = async (studentId: string) => {
  const academy = await ensureAcademyClassroom()
  const db = getDb()

  await db
    .insert(classroomMemberships)
    .values({
      classroomId: academy.id,
      studentId,
    })
    .onConflictDoNothing()

  return academy
}
