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
import { runPyjoNext } from "@/lib/pyjo/director"

export const runtime = "nodejs"

/**
 * POST /api/pyjo/next
 * Core coach endpoint — decides and returns the next micro-blocks.
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

    const event = body.event
      ? lessonEventSchema.parse(body.event)
      : undefined

    const result = await runPyjoNext({
      session: parseLessonSession(lesson.content),
      event,
      bootstrap: body.bootstrap,
    })

    await updateLessonContent(lessonId, user.id, result.session)

    return NextResponse.json({
      ok: true,
      session: result.session,
      speak: result.output.speak,
      intent: result.output.intent,
      reason: result.output.reason,
      source: result.source,
    })
  } catch (error) {
    console.error("POST /api/pyjo/next", error)
    return NextResponse.json({ error: "PyJo could not continue." }, { status: 500 })
  }
}
