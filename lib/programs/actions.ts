"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/session"
import { getDb } from "@/lib/db"
import { savedPrograms } from "@/lib/db/schema"

export type ProgramActionState = {
  ok: boolean
  error?: string
  message?: string
  programId?: string
} | null

export type PersistProgramInput = {
  programId?: string | null
  title: string
  code: string
}

const MAX_TITLE = 80
const MAX_CODE = 200_000

const normalizeTitle = (raw: string) => {
  const title = raw.trim() || "Untitled program"
  if (title.length > MAX_TITLE) {
    return { error: `Title must be at most ${MAX_TITLE} characters.` as const }
  }
  return { title }
}

const normalizeCode = (raw: string) => {
  if (raw.length > MAX_CODE) {
    return { error: "Program is too large to save." as const }
  }
  return { code: raw }
}

const revalidateProgramPaths = () => {
  revalidatePath("/student/code")
  revalidatePath("/student/programs")
}

export const persistProgram = async (
  studentId: string,
  input: PersistProgramInput
): Promise<ProgramActionState> => {
  const parsedTitle = normalizeTitle(input.title)
  if ("error" in parsedTitle) {
    return { ok: false, error: parsedTitle.error }
  }
  const parsedCode = normalizeCode(input.code)
  if ("error" in parsedCode) {
    return { ok: false, error: parsedCode.error }
  }

  const programId = input.programId?.trim() || ""

  try {
    const db = getDb()

    if (programId) {
      const existing = await db
        .select({ id: savedPrograms.id })
        .from(savedPrograms)
        .where(
          and(
            eq(savedPrograms.id, programId),
            eq(savedPrograms.studentId, studentId)
          )
        )
        .limit(1)

      if (!existing[0]) {
        return { ok: false, error: "Program not found." }
      }

      await db
        .update(savedPrograms)
        .set({
          title: parsedTitle.title,
          code: parsedCode.code,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(savedPrograms.id, programId),
            eq(savedPrograms.studentId, studentId)
          )
        )

      revalidateProgramPaths()
      return {
        ok: true,
        message: "Program saved.",
        programId,
      }
    }

    const [created] = await db
      .insert(savedPrograms)
      .values({
        studentId,
        title: parsedTitle.title,
        code: parsedCode.code,
        source: "ide",
      })
      .returning({ id: savedPrograms.id })

    revalidateProgramPaths()
    return {
      ok: true,
      message: "Program saved.",
      programId: created.id,
    }
  } catch (error) {
    console.error("persistProgram", error)
    return { ok: false, error: "Could not save the program." }
  }
}

export const saveProgramAction = async (
  _prev: ProgramActionState,
  formData: FormData
): Promise<ProgramActionState> => {
  const user = await requireRole(["student"])
  return persistProgram(user.id, {
    programId: String(formData.get("programId") ?? ""),
    title: String(formData.get("title") ?? ""),
    code: String(formData.get("code") ?? ""),
  })
}

/** Client-callable autosave (navigation / background flush). */
export const autosaveProgramAction = async (
  input: PersistProgramInput
): Promise<ProgramActionState> => {
  const user = await requireRole(["student"])
  return persistProgram(user.id, input)
}

export const deleteProgramAction = async (
  _prev: ProgramActionState,
  formData: FormData
): Promise<ProgramActionState> => {
  const user = await requireRole(["student"])
  const programId = String(formData.get("programId") ?? "").trim()
  if (!programId) {
    return { ok: false, error: "Missing program." }
  }

  try {
    const db = getDb()
    await db
      .delete(savedPrograms)
      .where(
        and(
          eq(savedPrograms.id, programId),
          eq(savedPrograms.studentId, user.id)
        )
      )

    revalidateProgramPaths()
    return { ok: true, message: "Program deleted." }
  } catch (error) {
    console.error("deleteProgramAction", error)
    return { ok: false, error: "Could not delete the program." }
  }
}
