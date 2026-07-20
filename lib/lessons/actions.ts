"use server"

import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/session"
import { getDb } from "@/lib/db"
import { concepts, lessons } from "@/lib/db/schema"
import { parseLessonContent } from "@/lib/lessons/schema"
import { getTemplateLessonForSlug } from "@/lib/lessons/templates"

export type StartLessonState = {
  ok: boolean
  error?: string
  redirectTo?: string
  lessonId?: string
} | null

export const startLessonForConceptAction = async (
  conceptId: string
): Promise<StartLessonState> => {
  const user = await requireRole(["student"])
  const trimmedId = conceptId.trim()
  if (!trimmedId) {
    return { ok: false, error: "Concept is required." }
  }

  try {
    const db = getDb()
    const conceptRows = await db
      .select({
        id: concepts.id,
        slug: concepts.slug,
        title: concepts.title,
      })
      .from(concepts)
      .where(and(eq(concepts.id, trimmedId), eq(concepts.isActive, true)))
      .limit(1)

    const concept = conceptRows[0]
    if (!concept) {
      return { ok: false, error: "Concept not found." }
    }

    const template = getTemplateLessonForSlug(concept.slug)
    if (!template) {
      return {
        ok: false,
        error: `No lesson template yet for “${concept.title}”. Try Variables for now.`,
      }
    }

    const existing = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(
        and(
          eq(lessons.studentId, user.id),
          eq(lessons.conceptId, concept.id),
          eq(lessons.status, "active")
        )
      )
      .orderBy(desc(lessons.createdAt))
      .limit(1)

    if (existing[0]) {
      return {
        ok: true,
        lessonId: existing[0].id,
        redirectTo: `/student/learn/${existing[0].id}`,
      }
    }

    const content = parseLessonContent(template)
    const inserted = await db
      .insert(lessons)
      .values({
        studentId: user.id,
        conceptId: concept.id,
        schemaVersion: 1,
        content,
        status: "active",
      })
      .returning({ id: lessons.id })

    const lessonId = inserted[0]?.id
    if (!lessonId) {
      return { ok: false, error: "Could not create lesson." }
    }

    revalidatePath("/student/learn")
    revalidatePath(`/student/learn/${lessonId}`)

    return {
      ok: true,
      lessonId,
      redirectTo: `/student/learn/${lessonId}`,
    }
  } catch (error) {
    console.error("startLessonForConceptAction", error)
    return { ok: false, error: "Could not start lesson." }
  }
}

export const completeLessonAction = async (
  lessonId: string
): Promise<{ ok: boolean; error?: string }> => {
  const user = await requireRole(["student"])
  const trimmedId = lessonId.trim()
  if (!trimmedId) {
    return { ok: false, error: "Lesson is required." }
  }

  try {
    const db = getDb()
    const updated = await db
      .update(lessons)
      .set({ status: "completed", updatedAt: new Date() })
      .where(
        and(
          eq(lessons.id, trimmedId),
          eq(lessons.studentId, user.id),
          eq(lessons.status, "active")
        )
      )
      .returning({ id: lessons.id })

    if (!updated[0]) {
      return { ok: false, error: "Lesson not found or already completed." }
    }

    revalidatePath(`/student/learn/${trimmedId}`)
    revalidatePath("/student/learn")
    return { ok: true }
  } catch (error) {
    console.error("completeLessonAction", error)
    return { ok: false, error: "Could not complete lesson." }
  }
}
