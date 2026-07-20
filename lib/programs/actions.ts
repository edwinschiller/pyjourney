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

const MAX_TITLE = 80
const MAX_CODE = 200_000

const parseTitle = (raw: FormDataEntryValue | null) => {
  if (typeof raw !== "string") {
    return { error: "Title is required." as const }
  }
  const title = raw.trim()
  if (title.length < 1) {
    return { error: "Title is required." as const }
  }
  if (title.length > MAX_TITLE) {
    return { error: `Title must be at most ${MAX_TITLE} characters.` as const }
  }
  return { title }
}

const parseCode = (raw: FormDataEntryValue | null) => {
  if (typeof raw !== "string") {
    return { error: "Code is required." as const }
  }
  if (raw.length > MAX_CODE) {
    return { error: "Program is too large to save." as const }
  }
  return { code: raw }
}

const revalidateProgramPaths = () => {
  revalidatePath("/student/code")
  revalidatePath("/student/programs")
}

export const saveProgramAction = async (
  _prev: ProgramActionState,
  formData: FormData
): Promise<ProgramActionState> => {
  const user = await requireRole(["student"])
  const parsedTitle = parseTitle(formData.get("title"))
  if ("error" in parsedTitle) {
    return { ok: false, error: parsedTitle.error }
  }
  const parsedCode = parseCode(formData.get("code"))
  if ("error" in parsedCode) {
    return { ok: false, error: parsedCode.error }
  }

  const programId = String(formData.get("programId") ?? "").trim()

  try {
    const db = getDb()

    if (programId) {
      const existing = await db
        .select({ id: savedPrograms.id })
        .from(savedPrograms)
        .where(
          and(
            eq(savedPrograms.id, programId),
            eq(savedPrograms.studentId, user.id)
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
        .where(eq(savedPrograms.id, programId))

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
        studentId: user.id,
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
    console.error("saveProgramAction", error)
    return { ok: false, error: "Could not save the program." }
  }
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
