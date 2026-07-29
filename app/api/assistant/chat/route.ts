import { z } from "zod"

import {
  ASSISTANT_MAX_CODE_CHARS,
  ASSISTANT_MAX_QUESTION_CHARS,
  ASSISTANT_MAX_TERMINAL_CHARS,
  IDE_ASSISTANT_SCOPE,
} from "@/lib/assistant/constants"
import {
  canAcceptMoreMessages,
  isAssistantAiConfigured,
  streamAssistantReply,
} from "@/lib/assistant/chat"
import {
  createConversation,
  getConversationForStudent,
  getLatestConversation,
  saveConversationMessages,
  type StoredAssistantMessage,
} from "@/lib/assistant/conversations"
import type { AssistantChatContext } from "@/lib/assistant/prompts"
import { requireRole } from "@/lib/auth/session"
import { getLessonForStudent } from "@/lib/lessons/queries"
import {
  slideBodyForBlock,
  slidePromptForBlock,
} from "@/lib/lessons/slide-context"

export const runtime = "nodejs"

const lessonContextSchema = z.object({
  scope: z.literal("lesson"),
  conceptSlug: z.string().min(1),
  conceptTitle: z.string().min(1),
  lessonId: z.string().uuid(),
  topicId: z.string().nullish(),
  topicTitle: z.string().nullish(),
  teachingGoal: z.string().nullish(),
  slideKind: z.string().nullish(),
  slidePrompt: z.string().nullish(),
  slideBody: z.string().nullish(),
  objective: z.string().nullish(),
})

const ideContextSchema = z.object({
  scope: z.literal("ide"),
  programTitle: z.string().nullish(),
  programId: z.string().nullish(),
  lineCount: z.number().int().nonnegative().nullish(),
  terminalOutput: z.string().max(ASSISTANT_MAX_TERMINAL_CHARS).nullish(),
  terminalError: z.string().max(ASSISTANT_MAX_TERMINAL_CHARS).nullish(),
})

const bodySchema = z.object({
  conversationId: z.string().uuid().nullish(),
  question: z.string().trim().min(1).max(ASSISTANT_MAX_QUESTION_CHARS),
  studentCode: z
    .string()
    .max(ASSISTANT_MAX_CODE_CHARS)
    .nullish()
    .transform((value) => value ?? ""),
  context: z.union([lessonContextSchema, ideContextSchema]),
})

const newId = () =>
  `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const POST = async (request: Request) => {
  try {
    const user = await requireRole(["student"])
    if (!isAssistantAiConfigured()) {
      return Response.json(
        { error: "Assistant is unavailable until OPENAI_API_KEY is set." },
        { status: 503 }
      )
    }

    const json = await request.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      console.error("assistant chat validation", parsed.error.flatten())
      return Response.json(
        {
          error: "Invalid request.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { question, studentCode } = parsed.data
    let context: AssistantChatContext

    if (parsed.data.context.scope === "lesson") {
      const clientContext = parsed.data.context
      const lesson = await getLessonForStudent(clientContext.lessonId, user.id)
      if (!lesson) {
        return Response.json({ error: "Lesson not found." }, { status: 404 })
      }
      const current = lesson.content.blocks[lesson.content.cursor]
      const focusTopic =
        lesson.content.topics.find(
          (topic) => topic.id === (current?.topicId ?? clientContext.topicId)
        ) ?? null
      context = {
        scope: "lesson",
        lessonId: lesson.id,
        conceptSlug: lesson.conceptSlug,
        conceptTitle: lesson.conceptTitle,
        objective: lesson.content.objective,
        topicId: current?.topicId ?? focusTopic?.id ?? null,
        topicTitle: focusTopic?.title ?? null,
        teachingGoal: focusTopic?.teachingGoal ?? null,
        slideKind: current?.kind ?? null,
        slidePrompt: current ? slidePromptForBlock(current) : null,
        slideBody: current ? slideBodyForBlock(current) : null,
      }
    } else {
      context = {
        scope: "ide",
        programTitle: parsed.data.context.programTitle ?? null,
        programId: parsed.data.context.programId ?? null,
        lineCount: parsed.data.context.lineCount ?? undefined,
        terminalOutput: parsed.data.context.terminalOutput ?? undefined,
        terminalError: parsed.data.context.terminalError ?? null,
      }
    }

    const conversationId = parsed.data.conversationId ?? undefined
    const scopeKey =
      context.scope === "lesson" ? context.lessonId : IDE_ASSISTANT_SCOPE

    let conversation = conversationId
      ? await getConversationForStudent(conversationId, user.id)
      : await getLatestConversation(user.id, scopeKey)

    if (!conversation) {
      const created = await createConversation({
        studentId: user.id,
        scope: context.scope,
        scopeKey,
        title: question.slice(0, 48),
      })
      conversation = {
        id: created.id,
        scope: created.scope,
        scopeKey: created.scopeKey,
        title: created.title,
        messages: [],
        updatedAt: created.updatedAt,
      }
    }

    if (!canAcceptMoreMessages(conversation.messages.length + 2)) {
      return Response.json(
        { error: "This chat is full. Start a new chat." },
        { status: 400 }
      )
    }

    const userMessage: StoredAssistantMessage = {
      id: newId(),
      role: "user",
      text: question,
      createdAt: new Date().toISOString(),
    }

    const result = await streamAssistantReply({
      context,
      studentCode,
      history: conversation.messages,
      question,
    })

    const assistantId = newId()
    let fullText = ""

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const send = (chunk: string) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
          )
        }
        try {
          for await (const delta of result.textStream) {
            fullText += delta
            send(delta)
          }
          const nextMessages = [
            ...conversation.messages,
            userMessage,
            {
              id: assistantId,
              role: "assistant" as const,
              text: fullText.trim() || "I could not generate a reply.",
              createdAt: new Date().toISOString(),
            },
          ]
          await saveConversationMessages({
            conversationId: conversation.id,
            studentId: user.id,
            messages: nextMessages,
            title:
              conversation.messages.length === 0
                ? question.slice(0, 48)
                : undefined,
          })
          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({
                conversationId: conversation.id,
                assistantMessageId: assistantId,
              })}\n\n`
            )
          )
          controller.close()
        } catch (error) {
          console.error("assistant stream failed", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Conversation-Id": conversation.id,
      },
    })
  } catch (error) {
    console.error("assistant chat", error)
    return Response.json({ error: "Could not chat." }, { status: 500 })
  }
}
