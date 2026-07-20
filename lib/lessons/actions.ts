"use server"

import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import {
  lessonEventSchema,
  type LessonEvent,
  type LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import { requireRole } from "@/lib/auth/session"
import { getDb } from "@/lib/db"
import { concepts, lessons } from "@/lib/db/schema"
import {
  abandonActiveLessonsForConcept,
  getLessonForStudent,
  updateLessonContent,
} from "@/lib/lessons/queries"
import { applyMasteryEvent } from "@/lib/mastery"
import {
  createInitialSessionForSlug,
  runPyjoNext,
} from "@/lib/pyjo/director"

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
  coachSpeak?: string
  completed?: boolean
  source?: "openai" | "rules"
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
  if (!trimmedId) return { ok: false, error: "Concept is required." }

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
    if (!concept) return { ok: false, error: "Concept not found." }

    const seed = createInitialSessionForSlug(concept.slug)
    if (!seed) {
      return {
        ok: false,
        error: `PyJo is not ready for “${concept.title}” yet. Try Variables.`,
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
      try {
        const { parseLessonSession } = await import(
          "@/lib/ai/schemas/lesson-blocks"
        )
        parseLessonSession(existing[0].content)
        return {
          ok: true,
          lessonId: existing[0].id,
          redirectTo: `/student/learn/${existing[0].id}`,
        }
      } catch {
        await abandonActiveLessonsForConcept(user.id, concept.id)
      }
    }

    // Bootstrap first PyJo blocks before insert
    const bootstrapped = await runPyjoNext({
      session: seed,
      bootstrap: true,
    })

    const inserted = await db
      .insert(lessons)
      .values({
        studentId: user.id,
        conceptId: concept.id,
        schemaVersion: 3,
        content: bootstrapped.session,
        status: "active",
      })
      .returning({ id: lessons.id })

    const lessonId = inserted[0]?.id
    if (!lessonId) return { ok: false, error: "Could not create lesson." }

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

type SyncInput = {
  lessonId: string
  cursor?: number
  event?: LessonEvent
  requestNext?: boolean
  completeLesson?: boolean
}

export const syncLessonProgressAction = async (
  input: SyncInput
): Promise<SyncLessonState> => {
  const user = await requireRole(["student"])
  const lessonId = input.lessonId.trim()
  if (!lessonId) return { ok: false, error: "Lesson is required." }

  try {
    const lesson = await getLessonForStudent(lessonId, user.id)
    if (!lesson) return { ok: false, error: "Lesson not found." }
    if (lesson.status !== "active") {
      return {
        ok: true,
        session: lesson.content,
        completed: lesson.status === "completed",
      }
    }

    let session = lesson.content
    if (typeof input.cursor === "number") {
      session = {
        ...session,
        cursor: Math.max(
          0,
          Math.min(input.cursor, Math.max(session.blocks.length - 1, 0))
        ),
      }
    }

    let coachSpeak = session.lastCoachSpeak
    let source: "openai" | "rules" | undefined

    const event = input.event
      ? lessonEventSchema.parse(input.event)
      : undefined

    const atEnd =
      session.cursor >= Math.max(session.blocks.length - 1, 0)
    const needsNext =
      Boolean(input.requestNext) ||
      Boolean(event && !event.passed) ||
      Boolean(event?.passed && event.kind === "coding") ||
      Boolean(
        event?.passed &&
          atEnd &&
          session.blocks[session.cursor]?.kind !== "complete"
      )

    if (needsNext) {
      const result = await runPyjoNext({
        session,
        event,
        bootstrap: false,
      })
      session = result.session
      coachSpeak = result.output.speak
      source = result.source
    } else if (event) {
      const { updateLearnerState } = await import("@/lib/pyjo/policy")
      session = {
        ...session,
        events: [...session.events, event],
        learner: updateLearnerState(session.learner, event),
        codingPassed:
          event.kind === "coding" && event.passed
            ? true
            : session.codingPassed,
      }
    }

    let completed = false
    if (
      input.completeLesson ||
      session.blocks[session.cursor]?.kind === "complete"
    ) {
      // Only complete when explicitly finishing complete step
      if (input.completeLesson) {
        await updateLessonContent(lessonId, user.id, session, "completed")
        await applyMasteryEvent(user.id, lesson.conceptId, {
          type: "test_pass",
          strength:
            session.learner.pace === "fast" && session.learner.confidence > 0.7
              ? "strong"
              : "normal",
        })
        completed = true
      } else {
        await updateLessonContent(lessonId, user.id, session)
      }
    } else {
      await updateLessonContent(lessonId, user.id, session)
    }

    revalidateLesson(lessonId)
    return { ok: true, session, coachSpeak, completed, source }
  } catch (error) {
    console.error("syncLessonProgressAction", error)
    return { ok: false, error: "Could not sync lesson." }
  }
}
