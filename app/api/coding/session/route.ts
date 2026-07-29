import { z } from "zod"

import { startCodingSession, CodingSessionAccessError } from "@/lib/coding/sessions"
import { requireRole } from "@/lib/auth/session"

export const runtime = "nodejs"

const bodySchema = z.object({
  mode: z.enum(["lesson", "free"]),
  lessonId: z.string().uuid().nullable().optional(),
  conceptId: z.string().uuid().nullable().optional(),
})

export const POST = async (request: Request) => {
  try {
    const user = await requireRole(["student"])
    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json({ error: "Invalid request." }, { status: 400 })
    }
    const session = await startCodingSession({
      studentId: user.id,
      mode: parsed.data.mode,
      lessonId: parsed.data.lessonId,
      conceptId: parsed.data.conceptId,
    })
    return Response.json({ sessionId: session.id })
  } catch (error) {
    if (error instanceof CodingSessionAccessError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error("coding session", error)
    return Response.json({ error: "Could not start session." }, { status: 500 })
  }
}
