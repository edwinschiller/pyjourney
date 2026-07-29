import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm"

import { getDb } from "@/lib/db"
import {
  classroomMemberships,
  classrooms,
  concepts,
  conceptPrerequisites,
  profiles,
} from "@/lib/db/schema"

export type AdminDashboardStats = {
  userCount: number
  studentCount: number
  teacherCount: number
  adminCount: number
  activeClassCount: number
  archivedClassCount: number
  conceptCount: number
}

export type AdminUserRow = {
  id: string
  email: string
  displayName: string | null
  role: "student" | "teacher" | "admin"
  status: "active" | "disabled"
  createdAt: Date
}

export type AdminClassroomRow = {
  id: string
  name: string
  joinCode: string
  archivedAt: Date | null
  createdAt: Date
  memberCount: number
  teacherEmail: string
  teacherDisplayName: string | null
}

export type AdminConceptRow = {
  id: string
  slug: string
  title: string
  description: string
  orderIndex: number
  isActive: boolean
  prerequisiteTitles: string[]
}

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const db = getDb()

  const [roleRows, activeClassRows, archivedClassRows, conceptRows] =
    await Promise.all([
      db
        .select({
          role: profiles.role,
          value: count(),
        })
        .from(profiles)
        .groupBy(profiles.role),
      db
        .select({ value: count() })
        .from(classrooms)
        .where(isNull(classrooms.archivedAt)),
      db
        .select({ value: count() })
        .from(classrooms)
        .where(sql`${classrooms.archivedAt} is not null`),
      db
        .select({ value: count() })
        .from(concepts)
        .where(eq(concepts.isActive, true)),
    ])

  const byRole = Object.fromEntries(
    roleRows.map((row) => [row.role, Number(row.value)])
  ) as Partial<Record<"student" | "teacher" | "admin", number>>

  return {
    userCount:
      (byRole.student ?? 0) + (byRole.teacher ?? 0) + (byRole.admin ?? 0),
    studentCount: byRole.student ?? 0,
    teacherCount: byRole.teacher ?? 0,
    adminCount: byRole.admin ?? 0,
    activeClassCount: Number(activeClassRows[0]?.value ?? 0),
    archivedClassCount: Number(archivedClassRows[0]?.value ?? 0),
    conceptCount: Number(conceptRows[0]?.value ?? 0),
  }
}

export const listAdminUsers = async (limit = 100): Promise<AdminUserRow[]> => {
  const db = getDb()
  return db
    .select({
      id: profiles.id,
      email: profiles.email,
      displayName: profiles.displayName,
      role: profiles.role,
      status: profiles.status,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .orderBy(asc(profiles.role), asc(profiles.email))
    .limit(limit)
}

export const listAdminClassrooms = async (): Promise<AdminClassroomRow[]> => {
  const db = getDb()
  const rows = await db
    .select({
      id: classrooms.id,
      name: classrooms.name,
      joinCode: classrooms.joinCode,
      archivedAt: classrooms.archivedAt,
      createdAt: classrooms.createdAt,
      memberCount: count(classroomMemberships.studentId),
      teacherEmail: profiles.email,
      teacherDisplayName: profiles.displayName,
    })
    .from(classrooms)
    .innerJoin(profiles, eq(profiles.id, classrooms.teacherId))
    .leftJoin(
      classroomMemberships,
      eq(classroomMemberships.classroomId, classrooms.id)
    )
    .groupBy(
      classrooms.id,
      classrooms.name,
      classrooms.joinCode,
      classrooms.archivedAt,
      classrooms.createdAt,
      profiles.email,
      profiles.displayName
    )
    .orderBy(desc(classrooms.createdAt))

  return rows.map((row) => ({
    ...row,
    memberCount: Number(row.memberCount),
  }))
}

export const listAdminCurriculum = async (): Promise<AdminConceptRow[]> => {
  const db = getDb()
  const [conceptRows, edgeRows] = await Promise.all([
    db
      .select({
        id: concepts.id,
        slug: concepts.slug,
        title: concepts.title,
        description: concepts.description,
        orderIndex: concepts.orderIndex,
        isActive: concepts.isActive,
      })
      .from(concepts)
      .orderBy(asc(concepts.orderIndex), asc(concepts.title)),
    db
      .select({
        conceptId: conceptPrerequisites.conceptId,
        prerequisiteId: conceptPrerequisites.prerequisiteId,
      })
      .from(conceptPrerequisites),
  ])

  const titleById = new Map(conceptRows.map((row) => [row.id, row.title]))
  const prereqsByConcept = new Map<string, string[]>()
  for (const edge of edgeRows) {
    const title = titleById.get(edge.prerequisiteId)
    if (!title) continue
    const list = prereqsByConcept.get(edge.conceptId) ?? []
    list.push(title)
    prereqsByConcept.set(edge.conceptId, list)
  }

  return conceptRows.map((row) => ({
    ...row,
    prerequisiteTitles: prereqsByConcept.get(row.id) ?? [],
  }))
}

export const countActiveClassrooms = async () => {
  const db = getDb()
  const rows = await db
    .select({ value: count() })
    .from(classrooms)
    .where(isNull(classrooms.archivedAt))
  return Number(rows[0]?.value ?? 0)
}

export const countAdmins = async () => {
  const db = getDb()
  const rows = await db
    .select({ value: count() })
    .from(profiles)
    .where(and(eq(profiles.role, "admin"), eq(profiles.status, "active")))
  return Number(rows[0]?.value ?? 0)
}
