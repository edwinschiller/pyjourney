"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireRole } from "@/lib/auth/session"
import {
  assertTeacherOwnsClassroom,
  ClassroomAccessError,
} from "@/lib/classrooms/access"
import {
  allocateUniqueJoinCode,
  isReservedJoinCode,
  normalizeJoinCode,
} from "@/lib/classrooms/join-code"
import { getDb } from "@/lib/db"
import { classroomMemberships, classrooms } from "@/lib/db/schema"

export type ClassroomActionState = {
  ok: boolean
  error?: string
  message?: string
} | null

const MIN_NAME_LENGTH = 3
const MAX_NAME_LENGTH = 80

const parseName = (raw: FormDataEntryValue | null) => {
  if (typeof raw !== "string") {
    return { error: "Class name is required." as const }
  }
  const name = raw.trim()
  if (name.length < MIN_NAME_LENGTH) {
    return {
      error: `Class name must be at least ${MIN_NAME_LENGTH} characters.` as const,
    }
  }
  if (name.length > MAX_NAME_LENGTH) {
    return {
      error: `Class name must be at most ${MAX_NAME_LENGTH} characters.` as const,
    }
  }
  return { name }
}

const revalidateTeacherPaths = (classroomId?: string) => {
  revalidatePath("/teacher")
  revalidatePath("/teacher/classes")
  if (classroomId) {
    revalidatePath(`/teacher/classes/${classroomId}`)
  }
}

export const createClassroomAction = async (
  _prev: ClassroomActionState,
  formData: FormData
): Promise<ClassroomActionState> => {
  const user = await requireRole(["teacher"])
  const parsed = parseName(formData.get("name"))
  if ("error" in parsed) {
    return { ok: false, error: parsed.error }
  }

  let classroomId: string
  try {
    const db = getDb()
    const joinCode = await allocateUniqueJoinCode()
    const [created] = await db
      .insert(classrooms)
      .values({
        name: parsed.name,
        joinCode,
        teacherId: user.id,
      })
      .returning({ id: classrooms.id })

    classroomId = created.id
  } catch (error) {
    console.error("createClassroomAction", error)
    return { ok: false, error: "Could not create the class. Try again." }
  }

  revalidateTeacherPaths(classroomId)
  redirect(`/teacher/classes/${classroomId}`)
}

export const renameClassroomAction = async (
  _prev: ClassroomActionState,
  formData: FormData
): Promise<ClassroomActionState> => {
  const user = await requireRole(["teacher"])
  const classroomId = String(formData.get("classroomId") ?? "")
  const parsed = parseName(formData.get("name"))
  if (!classroomId) {
    return { ok: false, error: "Missing classroom." }
  }
  if ("error" in parsed) {
    return { ok: false, error: parsed.error }
  }

  try {
    await assertTeacherOwnsClassroom(user.id, classroomId)
    const db = getDb()
    await db
      .update(classrooms)
      .set({ name: parsed.name, updatedAt: new Date() })
      .where(eq(classrooms.id, classroomId))

    revalidateTeacherPaths(classroomId)
    return { ok: true, message: "Class name updated." }
  } catch (error) {
    if (error instanceof ClassroomAccessError) {
      return { ok: false, error: error.message }
    }
    console.error("renameClassroomAction", error)
    return { ok: false, error: "Could not rename the class." }
  }
}

export const archiveClassroomAction = async (
  _prev: ClassroomActionState,
  formData: FormData
): Promise<ClassroomActionState> => {
  const user = await requireRole(["teacher"])
  const classroomId = String(formData.get("classroomId") ?? "")
  const archive = String(formData.get("archive") ?? "true") === "true"

  if (!classroomId) {
    return { ok: false, error: "Missing classroom." }
  }

  try {
    await assertTeacherOwnsClassroom(user.id, classroomId)
    const db = getDb()
    await db
      .update(classrooms)
      .set({
        archivedAt: archive ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(classrooms.id, classroomId))

    revalidateTeacherPaths(classroomId)
    return {
      ok: true,
      message: archive ? "Class archived." : "Class restored.",
    }
  } catch (error) {
    if (error instanceof ClassroomAccessError) {
      return { ok: false, error: error.message }
    }
    console.error("archiveClassroomAction", error)
    return { ok: false, error: "Could not update archive status." }
  }
}

export const regenerateJoinCodeAction = async (
  _prev: ClassroomActionState,
  formData: FormData
): Promise<ClassroomActionState> => {
  const user = await requireRole(["teacher"])
  const classroomId = String(formData.get("classroomId") ?? "")

  if (!classroomId) {
    return { ok: false, error: "Missing classroom." }
  }

  try {
    await assertTeacherOwnsClassroom(user.id, classroomId)
    const joinCode = await allocateUniqueJoinCode()
    const db = getDb()
    await db
      .update(classrooms)
      .set({ joinCode, updatedAt: new Date() })
      .where(eq(classrooms.id, classroomId))

    revalidateTeacherPaths(classroomId)
    return { ok: true, message: `New join code: ${joinCode}` }
  } catch (error) {
    if (error instanceof ClassroomAccessError) {
      return { ok: false, error: error.message }
    }
    console.error("regenerateJoinCodeAction", error)
    return { ok: false, error: "Could not regenerate join code." }
  }
}

export const removeClassroomMemberAction = async (
  _prev: ClassroomActionState,
  formData: FormData
): Promise<ClassroomActionState> => {
  const user = await requireRole(["teacher"])
  const classroomId = String(formData.get("classroomId") ?? "")
  const studentId = String(formData.get("studentId") ?? "")

  if (!classroomId || !studentId) {
    return { ok: false, error: "Missing member details." }
  }

  try {
    await assertTeacherOwnsClassroom(user.id, classroomId)
    const db = getDb()
    await db
      .delete(classroomMemberships)
      .where(
        and(
          eq(classroomMemberships.classroomId, classroomId),
          eq(classroomMemberships.studentId, studentId)
        )
      )

    revalidateTeacherPaths(classroomId)
    revalidatePath("/student")
    return { ok: true, message: "Student removed from class." }
  } catch (error) {
    if (error instanceof ClassroomAccessError) {
      return { ok: false, error: error.message }
    }
    console.error("removeClassroomMemberAction", error)
    return { ok: false, error: "Could not remove student." }
  }
}

export const joinClassroomAction = async (
  _prev: ClassroomActionState,
  formData: FormData
): Promise<ClassroomActionState> => {
  const user = await requireRole(["student"])
  const code = normalizeJoinCode(String(formData.get("joinCode") ?? ""))

  if (!code) {
    return { ok: false, error: "Enter a join code." }
  }

  if (isReservedJoinCode(code)) {
    return {
      ok: true,
      message: "You are already in PyJourney Academy.",
    }
  }

  try {
    const db = getDb()
    const rows = await db
      .select()
      .from(classrooms)
      .where(eq(classrooms.joinCode, code))
      .limit(1)

    const classroom = rows[0]
    if (!classroom) {
      return { ok: false, error: "No class found for that join code." }
    }
    if (classroom.archivedAt) {
      return { ok: false, error: "This class is archived and cannot be joined." }
    }

    await db
      .insert(classroomMemberships)
      .values({
        classroomId: classroom.id,
        studentId: user.id,
      })
      .onConflictDoNothing()

    revalidatePath("/student")
    revalidatePath(`/teacher/classes/${classroom.id}`)
    return {
      ok: true,
      message: `Joined “${classroom.name}”.`,
    }
  } catch (error) {
    console.error("joinClassroomAction", error)
    return { ok: false, error: "Could not join the class. Try again." }
  }
}
