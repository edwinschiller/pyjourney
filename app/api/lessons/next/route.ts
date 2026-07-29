import { NextResponse } from "next/server"

import {
  lessonEventSchema,
  parseLessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import { requireRole } from "@/lib/auth/session"
import {
  getLessonForStudent,
  updateLessonContent,
} from "@/lib/lessons/queries"
import {
  LessonIntegrityError,
  verifyLessonEvent,
} from "@/lib/lessons/verify-event"
import {
  listStruggleTopicIdsForStudent,
  recordLessonCheckEvent,
} from "@/lib/memory"
import { runLessonNext } from "@/lib/lesson-engine/director"

export const runtime = "nodejs"

/**
 * POST /api/lessons/next
 * Core lesson engine endpoint — decides and returns the next micro-blocks.
 */
export const POST = async (request: Request) => {
  try {
    const user = await requireRole(["student"])
    const body = (await request.json()) as {
      lessonId?: string
      event?: unknown
      bootstrap?: boolean
    }

    const lessonId = body.lessonId?.trim()
    if (!lessonId) {
      return NextResponse.json({ error: "lessonId required" }, { status: 400 })
    }

    const lesson = await getLessonForStudent(lessonId, user.id)
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const session = parseLessonSession(lesson.content)
    const allowBootstrap =
      Boolean(body.bootstrap) && session.blocks.length === 0

    let event = body.event
      ? lessonEventSchema.parse(body.event)
      : undefined

    if (event) {
      event = verifyLessonEvent(session, event)
    }

    const struggleTopicIds = await listStruggleTopicIdsForStudent(
      user.id,
      lesson.conceptId
    )

    const result = await runLessonNext({
      session,
      event,
      bootstrap: allowBootstrap,
      struggleTopicIds,
    })

    await updateLessonContent(lessonId, user.id, result.session)

    if (event) {
      const topicTitle =
        result.session.topics.find((topic) => topic.id === event.topicId)
          ?.title ?? null
      await recordLessonCheckEvent({
        studentId: user.id,
        conceptId: lesson.conceptId,
        conceptSlug: lesson.conceptSlug,
        lessonId,
        event,
        topicTitle,
      })
    }

    return NextResponse.json({
      ok: true,
      session: result.session,
      speak: result.output.speak,
      intent: result.output.intent,
      reason: result.output.reason,
      source: result.source,
    })
  } catch (error) {
    if (error instanceof LessonIntegrityError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("POST /api/lessons/next", error)
    return NextResponse.json(
      { error: "Could not continue the lesson." },
      { status: 500 }
    )
  }
}
