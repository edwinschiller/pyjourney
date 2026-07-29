import {
  ASSISTANT_MAX_CODE_CHARS,
  ASSISTANT_MAX_TERMINAL_CHARS,
  IDE_ASSISTANT_SCOPE,
} from "@/lib/assistant/constants"

export type AssistantScope = "lesson" | "ide"

export type AssistantLessonContext = {
  scope: "lesson"
  conceptSlug: string
  conceptTitle: string
  lessonId: string
  topicId?: string | null
  topicTitle?: string | null
  teachingGoal?: string | null
  slideKind?: string | null
  slidePrompt?: string | null
  slideBody?: string | null
  objective?: string | null
}

export type AssistantIdeContext = {
  scope: "ide"
  programTitle?: string | null
  programId?: string | null
  lineCount?: number
  terminalOutput?: string
  terminalError?: string | null
}

export type AssistantChatContext = AssistantLessonContext | AssistantIdeContext

const trim = (value: string, max: number) =>
  value.length <= max ? value : `${value.slice(0, max)}\n…(truncated)`

export const isIdeScopeKey = (scopeKey: string) =>
  scopeKey === IDE_ASSISTANT_SCOPE

export const buildIdeCodeContext = (input: {
  code: string
  programTitle?: string | null
  programId?: string | null
  lineCount?: number
  terminalOutput?: string
  terminalError?: string | null
}) => {
  const lines = [
    `Program: ${input.programTitle?.trim() || "Untitled"}`,
    input.programId ? `Program ID: ${input.programId}` : null,
    `Lines in editor: ${input.lineCount ?? input.code.split("\n").length}`,
    "--- Editor code ---",
    trim(input.code || "(empty)", ASSISTANT_MAX_CODE_CHARS),
    "--- Last error ---",
    trim(input.terminalError?.trim() || "(none)", ASSISTANT_MAX_TERMINAL_CHARS),
    "--- Terminal output ---",
    trim(input.terminalOutput?.trim() || "(empty)", ASSISTANT_MAX_TERMINAL_CHARS),
  ]
  return lines.filter(Boolean).join("\n")
}

export const buildLessonSystemPrompt = (input: {
  context: AssistantLessonContext
  studentCode: string
}) => {
  const { context } = input
  const slideBits = [
    context.slideKind ? `Slide type: ${context.slideKind}` : null,
    context.slidePrompt ? `Slide title/prompt: ${context.slidePrompt}` : null,
    context.slideBody
      ? `WHAT IS ON THE CURRENT SLIDE (answer questions about this):\n${trim(context.slideBody, 4500)}`
      : null,
  ]
    .filter(Boolean)
    .join("\n")

  return `You are PyJourney Assistant, a patient Python tutor for school learners.
Rules:
- You can see the CURRENT lesson slide below. Answer questions about that slide first.
- Help step by step. Never paste a full finished solution.
- Prefer at most 3 concrete next steps.
- Ask a short clarifying question when stuck.
- Use English. Keep answers concise.
- If the learner shares code with an error, explain the cause before suggesting a fix.
- Put Python examples in multi-line \`\`\`python fences (never one long single-line fence).

Lesson: ${context.conceptTitle} (${context.conceptSlug})
Objective: ${context.objective ?? "(not set)"}
Current topic: ${context.topicTitle ?? "(none)"} ${
    context.teachingGoal ? `— ${context.teachingGoal}` : ""
  }
${slideBits || "Current slide: (unknown — ask the learner what they see)"}

Student code currently in the editor (may be empty on non-coding slides):
${trim(input.studentCode || "(none / not a coding step)", ASSISTANT_MAX_CODE_CHARS)}`
}

export const buildIdeSystemPrompt = (input: {
  codeContext: string
}) => `You are PyJourney Assistant for free Python practice in the IDE.
Rules:
- Use the editor code AND terminal output/errors when relevant.
- Never dump a complete rewrite unless the learner explicitly asks for one after trying.
- Prefer small, testable next steps. English, concise.
- If the terminal is empty, suggest a quick test they can run.
- Put Python examples in multi-line \`\`\`python fences (never one long single-line fence).

Live workspace context:
${input.codeContext}`
