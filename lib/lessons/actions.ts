"use server"

import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import {
  lessonEventSchema,
  normalizeLessonSession,
  parseLessonSession,
  type LessonEvent,
  type LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import { requireRole } from "@/lib/auth/session"
import { getDb } from "@/lib/db"
import { concepts, lessons } from "@/lib/db/schema"
import {
  abandonActiveLessonsForConcept,
  getLessonForStudent,
  listCompletedConceptIds,
  updateLessonContent,
} from "@/lib/lessons/queries"
import {
  PREREQUISITE_MET_SCORE,
  isConceptUnlocked,
  loadCurriculumGraph,
} from "@/lib/curriculum"
import {
  applyMasteryEvent,
  getMasteryForConcept,
  getMasteryScoreMapForStudent,
  upsertMasteryScore,
} from "@/lib/mastery"
import {
  recordApplyReviewEvents,
  recordLessonCheckEvent,
  recordLessonCompleteEvent,
  listStruggleTopicIdsForStudent,
} from "@/lib/memory"
import {
  createInitialSessionForSlug,
  reviewApplySubmission,
  runPyjoNext,
} from "@/lib/pyjo/director"
import { applyEventToCoverage } from "@/lib/pyjo/policy"

export type StartLessonState = {
  ok: boolean
  error?: string
  redirectTo?: string
  lessonId?: string
  resumed?: boolean
} | null

export type SyncLessonState = {
  ok: boolean
  error?: string
  session?: LessonSession
  coachSpeak?: string
  completed?: boolean
  source?: "openai" | "rules"
} | null

export type ReviewApplyState = {
  ok: boolean
  error?: string
  session?: LessonSession
  coachSpeak?: string
  passed?: boolean
  criteriaResults?: Array<{
    criterion: string
    met: boolean
    note?: string
  }>
  completed?: boolean
  source?: "openai" | "rules"
} | null

const SESSION_VERSION = 4

const revalidateLesson = (lessonId: string) => {
  revalidatePath("/student/learn")
  revalidatePath(`/student/learn/${lessonId}`)
  revalidatePath("/student")
  revalidatePath("/student/insights")
  revalidatePath("/teacher")
  revalidatePath("/teacher/classes")
}

const isV4Session = (content: unknown) => {
  const parsed = (() => {
    try {
      return parseLessonSession(content)
    } catch {
      return null
    }
  })()
  return Boolean(parsed && parsed.version === SESSION_VERSION)
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
        error: `“${concept.title}” is not ready yet. Try Variables.`,
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

    const [graph, masteryMap, completedIds] = await Promise.all([
      loadCurriculumGraph(),
      getMasteryScoreMapForStudent(user.id),
      listCompletedConceptIds(user.id),
    ])
    if (!isConceptUnlocked(graph, concept.id, masteryMap, completedIds)) {
      if (existing[0]) {
        await abandonActiveLessonsForConcept(user.id, concept.id)
      }
      return {
        ok: false,
        error: `Finish the prerequisites for “${concept.title}” first.`,
      }
    }

    if (existing[0]) {
      if (isV4Session(existing[0].content)) {
        const existingSession = parseLessonSession(existing[0].content)
        const topicIds = existingSession.topics.map((topic) => topic.id).join(",")
        const expectedIds = seed.topics.map((topic) => topic.id).join(",")
        if (
          existingSession.topics.length === seed.topics.length &&
          topicIds === expectedIds
        ) {
          // Refresh learner-facing titles/goals from the current curriculum.
          const refreshedTopics = existingSession.topics.map((topic) => {
            const fresh = seed.topics.find((item) => item.id === topic.id)
            if (!fresh) return topic
            return {
              ...topic,
              title: fresh.title,
              teachingGoal: fresh.teachingGoal,
            }
          })
          const nextSession = normalizeLessonSession({
            ...existingSession,
            topics: refreshedTopics,
          })
          const changed =
            nextSession.confidence !== existingSession.confidence ||
            refreshedTopics.some(
              (topic, index) =>
                topic.title !== existingSession.topics[index]?.title ||
                topic.teachingGoal !==
                  existingSession.topics[index]?.teachingGoal
            )
          if (changed) {
            await updateLessonContent(existing[0].id, user.id, nextSession)
          }
          return {
            ok: true,
            lessonId: existing[0].id,
            resumed: true,
            redirectTo: `/student/learn/${existing[0].id}`,
          }
        }
      }
      await abandonActiveLessonsForConcept(user.id, concept.id)
    }

    const bootstrapped = await runPyjoNext({
      session: seed,
      bootstrap: true,
    })

    const inserted = await db
      .insert(lessons)
      .values({
        studentId: user.id,
        conceptId: concept.id,
        schemaVersion: SESSION_VERSION,
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
      resumed: false,
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

    const atEnd = session.cursor >= Math.max(session.blocks.length - 1, 0)
    const onComplete = session.blocks[session.cursor]?.kind === "complete"
    const needsNext =
      Boolean(input.requestNext) ||
      Boolean(event && !event.passed) ||
      Boolean(event?.passed && atEnd && !onComplete)

    const struggleTopicIds = needsNext
      ? await listStruggleTopicIdsForStudent(user.id, lesson.conceptId)
      : []

    if (needsNext) {
      const result = await runPyjoNext({
        session,
        event,
        bootstrap: false,
        struggleTopicIds,
      })
      session = result.session
      coachSpeak = result.output.speak
      source = result.source
    } else if (event) {
      session = applyEventToCoverage(session, event)
    }

    if (event) {
      const topicTitle =
        session.topics.find((topic) => topic.id === event.topicId)?.title ??
        null
      await recordLessonCheckEvent({
        studentId: user.id,
        conceptId: lesson.conceptId,
        conceptSlug: lesson.conceptSlug,
        lessonId,
        event,
        topicTitle,
      })
    }

    let completed = false
    if (input.completeLesson) {
      await updateLessonContent(lessonId, user.id, session, "completed")
      await applyMasteryEvent(user.id, lesson.conceptId, {
        type: "test_pass",
        strength:
          session.confidence >= 85 && session.applyPassed
            ? "strong"
            : "normal",
      })
      // Completing a lesson always meets the unlock floor for dependents.
      const mastery = await getMasteryForConcept(user.id, lesson.conceptId)
      if ((mastery?.score ?? 0) < PREREQUISITE_MET_SCORE) {
        await upsertMasteryScore({
          studentId: user.id,
          conceptId: lesson.conceptId,
          score: PREREQUISITE_MET_SCORE,
          evidenceDelta: 0,
        })
      }
      await recordLessonCompleteEvent({
        studentId: user.id,
        conceptId: lesson.conceptId,
        lessonId,
      })
      completed = true
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

type ReviewInput = {
  lessonId: string
  code: string
  cursor?: number
  stdout?: string
  stderr?: string
}

export const reviewApplyAction = async (
  input: ReviewInput
): Promise<ReviewApplyState> => {
  const user = await requireRole(["student"])
  const lessonId = input.lessonId.trim()
  if (!lessonId) return { ok: false, error: "Lesson is required." }

  try {
    const lesson = await getLessonForStudent(lessonId, user.id)
    if (!lesson) return { ok: false, error: "Lesson not found." }
    if (lesson.status !== "active") {
      return { ok: false, error: "Lesson is not active." }
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

    const current = session.blocks[session.cursor]
    if (!current || current.kind !== "apply") {
      return { ok: false, error: "Not on an application task." }
    }

    const { review, source } = await reviewApplySubmission({
      session,
      code: input.code,
      stdout: input.stdout,
      stderr: input.stderr,
    })

    const event = lessonEventSchema.parse({
      at: new Date().toISOString(),
      blockId: current.id,
      kind: "apply",
      passed: review.passed,
      latencyMs: 0,
      attempts: 1,
      detail: review.speak,
    })

    const next = await runPyjoNext({
      session,
      event,
      bootstrap: false,
    })

    await updateLessonContent(lessonId, user.id, next.session)

    await recordApplyReviewEvents({
      studentId: user.id,
      conceptId: lesson.conceptId,
      conceptSlug: lesson.conceptSlug,
      lessonId,
      passed: review.passed,
      criteriaResults: review.criteriaResults,
    })

    revalidateLesson(lessonId)

    return {
      ok: true,
      session: next.session,
      coachSpeak: review.passed
        ? `${review.speak} ${next.output.speak}`
        : review.speak,
      passed: review.passed,
      criteriaResults: review.criteriaResults,
      source,
    }
  } catch (error) {
    console.error("reviewApplyAction", error)
    return { ok: false, error: "Could not review application task." }
  }
}
