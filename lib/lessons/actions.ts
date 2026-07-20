"use server"

import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/session"
import { getDb } from "@/lib/db"
import { concepts, lessons } from "@/lib/db/schema"
import {
  lessonEventSchema,
  parseLessonSession,
  type LessonEvent,
  type LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import { runLessonDirector } from "@/lib/lessons/adapt/director"
import type { AdaptTrigger } from "@/lib/lessons/adapt/rules"
import {
  abandonActiveLessonsForConcept,
  getLessonForStudent,
  updateLessonContent,
} from "@/lib/lessons/queries"
import { getTemplateSessionForSlug } from "@/lib/lessons/templates/variables"
import { applyMasteryEvent } from "@/lib/mastery"

export type StartLessonState = {
  ok: boolean
  error?: string
  redirectTo?: string
  lessonId?: string
} | null

export type SyncLessonState = {
  ok: boolean
  error?: string
  session?: LessonSession
  adaptMessage?: string | null
  completed?: boolean
} | null

const revalidateLesson = (lessonId: string) => {
  revalidatePath("/student/learn")
  revalidatePath(`/student/learn/${lessonId}`)
}

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

    const template = getTemplateSessionForSlug(concept.slug, { adaptive: true })
    if (!template) {
      return {
        ok: false,
        error: `No lesson path yet for “${concept.title}”. Variables is available.`,
      }
    }

    const existing = await db
      .select({ id: lessons.id, content: lessons.content })
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
      const parsed = (() => {
        try {
          return parseLessonSession(existing[0].content)
        } catch {
          return null
        }
      })()
      if (parsed) {
        return {
          ok: true,
          lessonId: existing[0].id,
          redirectTo: `/student/learn/${existing[0].id}`,
        }
      }
      await abandonActiveLessonsForConcept(user.id, concept.id)
    }

    const inserted = await db
      .insert(lessons)
      .values({
        studentId: user.id,
        conceptId: concept.id,
        schemaVersion: 2,
        content: template,
        status: "active",
      })
      .returning({ id: lessons.id })

    const lessonId = inserted[0]?.id
    if (!lessonId) {
      return { ok: false, error: "Could not create lesson." }
    }

    revalidateLesson(lessonId)
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

type SyncLessonInput = {
  lessonId: string
  cursor: number
  event?: LessonEvent
  adaptTrigger?: AdaptTrigger
  completeLesson?: boolean
}

export const syncLessonProgressAction = async (
  input: SyncLessonInput
): Promise<SyncLessonState> => {
  const user = await requireRole(["student"])
  const lessonId = input.lessonId.trim()
  if (!lessonId) {
    return { ok: false, error: "Lesson is required." }
  }

  try {
    const lesson = await getLessonForStudent(lessonId, user.id)
    if (!lesson) {
      return { ok: false, error: "Lesson not found." }
    }
    if (lesson.status !== "active") {
      return {
        ok: true,
        session: lesson.content,
        completed: lesson.status === "completed",
      }
    }

    let session: LessonSession = {
      ...lesson.content,
      cursor: Math.max(
        0,
        Math.min(input.cursor, Math.max(lesson.content.blocks.length - 1, 0))
      ),
    }

    if (input.event) {
      const event = lessonEventSchema.parse(input.event)
      session = {
        ...session,
        events: [...session.events, event],
      }
    }

    let adaptMessage: string | null = null
    if (input.adaptTrigger && session.adaptive) {
      const adapted = await runLessonDirector({
        session,
        trigger: input.adaptTrigger,
        blockId:
          input.event?.blockId ?? session.blocks[session.cursor]?.id ?? "",
      })
      session = adapted.session
      if (typeof adapted.cursor === "number") {
        session = { ...session, cursor: adapted.cursor }
      }
      adaptMessage = adapted.message
    }

    let completed = false
    if (input.completeLesson) {
      session = { ...session, codingPassed: true }
      await updateLessonContent(lessonId, user.id, session, "completed")
      await applyMasteryEvent(user.id, lesson.conceptId, {
        type: "test_pass",
        strength: "normal",
      })
      completed = true
    } else {
      await updateLessonContent(lessonId, user.id, session)
    }

    revalidateLesson(lessonId)
    return { ok: true, session, adaptMessage, completed }
  } catch (error) {
    console.error("syncLessonProgressAction", error)
    return { ok: false, error: "Could not sync lesson progress." }
  }
}

export const completeLessonAction = async (
  lessonId: string
): Promise<{ ok: boolean; error?: string }> => {
  const user = await requireRole(["student"])
  const lesson = await getLessonForStudent(lessonId, user.id)
  if (!lesson) {
    return { ok: false, error: "Lesson not found." }
  }
  const result = await syncLessonProgressAction({
    lessonId,
    cursor: lesson.content.cursor,
    completeLesson: true,
  })
  if (!result?.ok) {
    return { ok: false, error: result?.error ?? "Could not complete lesson." }
  }
  return { ok: true }
}
