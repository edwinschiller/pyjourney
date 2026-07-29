import { z } from "zod"

import { IDE_ASSISTANT_SCOPE } from "@/lib/assistant/constants"
import {
  createConversation,
  deleteConversation,
  getConversationForStudent,
  getLatestConversation,
  listConversations,
} from "@/lib/assistant/conversations"
import { requireRole } from "@/lib/auth/session"

export const runtime = "nodejs"

export const GET = async (request: Request) => {
  try {
    const user = await requireRole(["student"])
    const url = new URL(request.url)
    const conversationId = url.searchParams.get("conversationId")
    const scopeKey = url.searchParams.get("scopeKey") || IDE_ASSISTANT_SCOPE
    const list = url.searchParams.get("list") === "1"

    if (list) {
      const conversations = await listConversations(user.id, scopeKey)
      return Response.json({ conversations })
    }

    if (conversationId) {
      const conversation = await getConversationForStudent(
        conversationId,
        user.id
      )
      if (!conversation) {
        return Response.json({ error: "Not found." }, { status: 404 })
      }
      return Response.json({ conversation })
    }

    const conversation = await getLatestConversation(user.id, scopeKey)
    return Response.json({ conversation })
  } catch (error) {
    console.error("assistant history GET", error)
    return Response.json({ error: "Could not load history." }, { status: 500 })
  }
}

const postSchema = z.object({
  scope: z.enum(["lesson", "ide"]),
  scopeKey: z.string().min(1),
  title: z.string().max(80).optional(),
})

export const POST = async (request: Request) => {
  try {
    const user = await requireRole(["student"])
    const parsed = postSchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json({ error: "Invalid request." }, { status: 400 })
    }
    const created = await createConversation({
      studentId: user.id,
      scope: parsed.data.scope,
      scopeKey: parsed.data.scopeKey,
      title: parsed.data.title ?? "New chat",
    })
    return Response.json({
      conversation: {
        id: created.id,
        title: created.title,
        messages: [],
      },
    })
  } catch (error) {
    console.error("assistant history POST", error)
    return Response.json({ error: "Could not create chat." }, { status: 500 })
  }
}

export const DELETE = async (request: Request) => {
  try {
    const user = await requireRole(["student"])
    const url = new URL(request.url)
    const conversationId = url.searchParams.get("conversationId")
    if (!conversationId) {
      return Response.json({ error: "conversationId required." }, { status: 400 })
    }
    await deleteConversation(conversationId, user.id)
    return Response.json({ ok: true })
  } catch (error) {
    console.error("assistant history DELETE", error)
    return Response.json({ error: "Could not delete chat." }, { status: 500 })
  }
}
