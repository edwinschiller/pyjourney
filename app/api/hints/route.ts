import { z } from "zod"

import { requireRole } from "@/lib/auth/session"
import { getLessonForStudent } from "@/lib/lessons/queries"
import {
  slideBodyForBlock,
  slidePromptForBlock,
} from "@/lib/lessons/slide-context"
import { requestLessonHint } from "@/lib/hints/request-hint"

export const runtime = "nodejs"

const bodySchema = z.object({
  lessonId: z.string().uuid(),
  slideKind: z.enum(["quiz", "practice", "apply"]),
  topicId: z.string().nullish(),
  code: z.string().max(12_000).nullish(),
})

export const POST = async (request: Request) => {
  try {
    const user = await requireRole(["student"])
    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json(
        {
          error:
            "Hints are only available on quiz, practice, and apply steps.",
        },
        { status: 400 }
      )
    }

    const lesson = await getLessonForStudent(parsed.data.lessonId, user.id)
    if (!lesson) {
      return Response.json({ error: "Lesson not found." }, { status: 404 })
    }

    const session = lesson.content
    const current = session.blocks[session.cursor]
    if (
      !current ||
      (current.kind !== "quiz" &&
        current.kind !== "practice" &&
        current.kind !== "apply")
    ) {
      return Response.json(
        { error: "Hints are only available on active check steps." },
        { status: 400 }
      )
    }

    if (current.kind !== parsed.data.slideKind) {
      return Response.json(
        { error: "Hint step does not match the current lesson step." },
        { status: 400 }
      )
    }

    const hint = await requestLessonHint({
      studentId: user.id,
      lessonId: lesson.id,
      conceptId: lesson.conceptId,
      conceptSlug: lesson.conceptSlug,
      slideKind: current.kind,
      topicId: current.topicId ?? parsed.data.topicId ?? null,
      code: parsed.data.code ?? "",
      slidePrompt: slidePromptForBlock(current),
      slideBody: slideBodyForBlock(current),
    })

    return Response.json(hint)
  } catch (error) {
    console.error("hint POST", error)
    return Response.json({ error: "Could not create hint." }, { status: 500 })
  }
}
