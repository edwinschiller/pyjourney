import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"

import {
  ASSISTANT_CONTEXT_MESSAGES,
  ASSISTANT_MAX_MESSAGES,
} from "@/lib/assistant/constants"
import type { StoredAssistantMessage } from "@/lib/assistant/conversations"
import {
  buildIdeCodeContext,
  buildIdeSystemPrompt,
  buildLessonSystemPrompt,
  type AssistantChatContext,
} from "@/lib/assistant/prompts"

export const isAssistantAiConfigured = () =>
  Boolean(process.env.OPENAI_API_KEY?.trim())

export const streamAssistantReply = async (input: {
  context: AssistantChatContext
  studentCode: string
  history: StoredAssistantMessage[]
  question: string
}) => {
  if (!isAssistantAiConfigured()) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const system =
    input.context.scope === "lesson"
      ? buildLessonSystemPrompt({
          context: input.context,
          studentCode: input.studentCode,
        })
      : buildIdeSystemPrompt({
          codeContext: buildIdeCodeContext({
            code: input.studentCode,
            programTitle: input.context.programTitle,
            programId: input.context.programId,
            lineCount: input.context.lineCount,
            terminalOutput: input.context.terminalOutput,
            terminalError: input.context.terminalError,
          }),
        })

  const recent = input.history
    .filter((message) => message.id !== "welcome")
    .slice(-ASSISTANT_CONTEXT_MESSAGES)

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"

  return streamText({
    model: openai(modelId),
    system,
    messages: [
      ...recent.map((message) => ({
        role: message.role,
        content: message.text,
      })),
      { role: "user" as const, content: input.question },
    ],
    temperature: 0.4,
    maxOutputTokens: 500,
  })
}

export const canAcceptMoreMessages = (count: number) =>
  count < ASSISTANT_MAX_MESSAGES
