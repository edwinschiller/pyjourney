import { eq, sql } from "drizzle-orm"
import { redirect } from "next/navigation"

import { getAuth, isNeonAuthConfigured } from "@/lib/auth/server"
import {
  assignmentRecipients,
  assignments,
  auditEvents,
  classrooms,
  classroomMemberships,
  codeSnapshots,
  codingSessions,
  conceptMastery,
  exerciseAttempts,
  getDb,
  hints,
  lessons,
  profiles,
  savedPrograms,
  studentInsightReports,
} from "@/lib/db"
import { ensureAcademyMembership } from "@/lib/db/academy"
import { isOnboardingComplete } from "@/lib/onboarding/parse"

export type UserRole = "student" | "teacher" | "admin"

export type SessionUser = {
  id: string
  email: string
  displayName: string | null
  role: UserRole
  status: "active" | "disabled"
  onboarding: unknown
}

type EnsureProfileInput = {
  id: string
  email: string
  displayName?: string | null
  role?: Extract<UserRole, "student" | "teacher">
  /** When true, update role on an existing profile (used for registration) */
  applyRole?: boolean
}

const toSessionUser = (row: typeof profiles.$inferSelect): SessionUser => ({
  id: row.id,
  email: row.email,
  displayName: row.displayName,
  role: row.role,
  status: row.status,
  onboarding: row.onboarding,
})

const resolveRole = (
  input: EnsureProfileInput,
  current?: UserRole
): UserRole => {
  if (current === "admin") {
    return "admin"
  }
  if (input.applyRole && input.role) {
    return input.role
  }
  if (current) {
    return current
  }
  return input.role ?? "student"
}

/** Move FK references from an old Neon user id to the current one */
const relinkProfileId = async (oldId: string, newId: string) => {
  const db = getDb()

  await db
    .update(classroomMemberships)
    .set({ studentId: newId })
    .where(eq(classroomMemberships.studentId, oldId))
  await db
    .update(classrooms)
    .set({ teacherId: newId })
    .where(eq(classrooms.teacherId, oldId))
  await db
    .update(conceptMastery)
    .set({ studentId: newId })
    .where(eq(conceptMastery.studentId, oldId))
  await db
    .update(assignments)
    .set({ createdBy: newId })
    .where(eq(assignments.createdBy, oldId))
  await db
    .update(assignmentRecipients)
    .set({ studentId: newId })
    .where(eq(assignmentRecipients.studentId, oldId))
  await db
    .update(lessons)
    .set({ studentId: newId })
    .where(eq(lessons.studentId, oldId))
  await db
    .update(codingSessions)
    .set({ studentId: newId })
    .where(eq(codingSessions.studentId, oldId))
  await db
    .update(codeSnapshots)
    .set({ studentId: newId })
    .where(eq(codeSnapshots.studentId, oldId))
  await db
    .update(savedPrograms)
    .set({ studentId: newId })
    .where(eq(savedPrograms.studentId, oldId))
  await db
    .update(exerciseAttempts)
    .set({ studentId: newId })
    .where(eq(exerciseAttempts.studentId, oldId))
  await db
    .update(hints)
    .set({ studentId: newId })
    .where(eq(hints.studentId, oldId))
  await db
    .update(studentInsightReports)
    .set({ studentId: newId })
    .where(eq(studentInsightReports.studentId, oldId))
  await db
    .update(auditEvents)
    .set({ actorId: newId })
    .where(eq(auditEvents.actorId, oldId))
}

export const ensureProfile = async (
  input: EnsureProfileInput
): Promise<SessionUser> => {
  const db = getDb()
  const existingById = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, input.id))
    .limit(1)

  if (existingById[0]) {
    const row = existingById[0]
    const nextRole = resolveRole(input, row.role)
    const shouldUpdateEmail = row.email !== input.email
    const shouldUpdateRole = nextRole !== row.role

    if (shouldUpdateEmail || shouldUpdateRole) {
      const [updated] = await db
        .update(profiles)
        .set({
          ...(shouldUpdateEmail ? { email: input.email } : {}),
          ...(shouldUpdateRole ? { role: nextRole } : {}),
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, input.id))
        .returning()
      return toSessionUser(updated)
    }
    return toSessionUser(row)
  }

  const emailKey = input.email.trim().toLowerCase()
  const existingByEmail = await db
    .select()
    .from(profiles)
    .where(sql`lower(${profiles.email}) = ${emailKey}`)
    .limit(1)

  if (existingByEmail[0]) {
    const old = existingByEmail[0]
    const nextRole = resolveRole(input, old.role)

    // Free the unique email, create row for current Neon id, move FKs, drop stale row
    await db
      .update(profiles)
      .set({
        email: `${old.email}.relocated.${old.id}`,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, old.id))

    const [created] = await db
      .insert(profiles)
      .values({
        id: input.id,
        email: input.email,
        displayName: input.displayName ?? old.displayName,
        role: nextRole,
        status: old.status,
        onboarding: old.onboarding,
      })
      .returning()

    await relinkProfileId(old.id, input.id)
    await db.delete(profiles).where(eq(profiles.id, old.id))

    return toSessionUser(created)
  }

  const role = resolveRole(input)

  const [created] = await db
    .insert(profiles)
    .values({
      id: input.id,
      email: input.email,
      displayName: input.displayName ?? null,
      role,
      status: "active",
    })
    .returning()

  return toSessionUser(created)
}

export const getSessionUser = async (): Promise<SessionUser | null> => {
  if (!isNeonAuthConfigured()) {
    return null
  }

  const result = await getAuth().getSession()
  const session = result.data
  const user = session?.user

  if (!user?.id || !user.email) {
    return null
  }

  if (user.emailVerified === false) {
    return null
  }

  const profile = await ensureProfile({
    id: user.id,
    email: user.email,
    displayName: user.name ?? null,
  })

  if (profile.role === "student") {
    await ensureAcademyMembership(profile.id)
  }

  return profile
}

export const requireRole = async (roles: UserRole[]): Promise<SessionUser> => {
  const user = await getSessionUser()
  if (!user || user.status !== "active") {
    redirect("/login")
  }
  if (!roles.includes(user.role)) {
    redirect("/")
  }
  return user
}

export const requireStudentWithOnboarding = async (): Promise<SessionUser> => {
  const user = await requireRole(["student"])
  if (!isOnboardingComplete(user.onboarding)) {
    redirect("/onboarding")
  }
  return user
}
