import { NextResponse } from "next/server"

import { requireRole } from "@/lib/auth/session"
import { runLessonDirector } from "@/lib/lessons/adapt/director"
import type { AdaptTrigger } from "@/lib/lessons/adapt/rules"
import {
  getLessonForStudent,
  updateLessonContent,
} from "@/lib/lessons/queries"
import { parseLessonSession } from "@/lib/ai/schemas/lesson-blocks"

export const runtime = "nodejs"

type AdaptBody = {
  lessonId?: string
  trigger?: AdaptTrigger
  blockId?: string
}

/**
 * POST /api/lessons/adapt
 * Monitors session state and appends remediation / completion blocks.
 */
export const POST = async (request: Request) => {
  try {
    const user = await requireRole(["student"])
    const body = (await request.json()) as AdaptBody
    const lessonId = body.lessonId?.trim()
    const trigger = body.trigger
    const blockId = body.blockId?.trim()

    if (!lessonId || !trigger || !blockId) {
      return NextResponse.json(
        { error: "lessonId, trigger, and blockId are required." },
        { status: 400 }
      )
    }

    const lesson = await getLessonForStudent(lessonId, user.id)
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 })
    }
    if (lesson.status !== "active") {
      return NextResponse.json(
        { error: "Lesson is not active.", session: lesson.content },
        { status: 409 }
      )
    }

    const session = parseLessonSession(lesson.content)
    const adapted = await runLessonDirector({
      session,
      trigger,
      blockId,
    })

    await updateLessonContent(lessonId, user.id, adapted.session)

    return NextResponse.json({
      ok: true,
      session: adapted.session,
      appended: adapted.appended,
      message: adapted.message,
      source: adapted.source,
      cursor: adapted.cursor ?? adapted.session.cursor,
    })
  } catch (error) {
    console.error("POST /api/lessons/adapt", error)
    return NextResponse.json(
      { error: "Could not adapt lesson." },
      { status: 500 }
    )
  }
}
