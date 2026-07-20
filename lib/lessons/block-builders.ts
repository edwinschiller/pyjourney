import type {
  LessonBlock,
  StepFeedback,
} from "@/lib/ai/schemas/lesson-blocks"

let blockSeq = 0

const nextId = (prefix: string) => {
  blockSeq += 1
  return `${prefix}-${blockSeq}`
}

/** Reset id counter (useful in tests / template rebuilds). */
export const resetBlockIdCounter = (start = 0) => {
  blockSeq = start
}

export const fb = (correct: string, wrong: string): StepFeedback => ({
  correct,
  wrong,
})

export const block = {
  intro: (lines: string[], title?: string, id?: string): LessonBlock => ({
    id: id ?? nextId("intro"),
    kind: "intro",
    title,
    lines,
  }),

  mc: (
    prompt: string,
    choices: { id: string; label: string }[],
    correctId: string,
    feedback: StepFeedback,
    code?: string,
    id?: string
  ): LessonBlock => ({
    id: id ?? nextId("mc"),
    kind: "multipleChoice",
    prompt,
    code,
    choices,
    correctId,
    feedback,
  }),

  predict: (
    prompt: string,
    code: string,
    choices: { id: string; label: string }[],
    correctId: string,
    feedback: StepFeedback,
    id?: string
  ): LessonBlock => ({
    id: id ?? nextId("predict"),
    kind: "prediction",
    prompt,
    code,
    choices,
    correctId,
    feedback,
  }),

  drag: (
    prompt: string,
    blocks: string[],
    correctOrder: number[],
    feedback: StepFeedback,
    id?: string
  ): LessonBlock => ({
    id: id ?? nextId("drag"),
    kind: "dragOrder",
    prompt,
    blocks,
    correctOrder,
    feedback,
  }),

  fill: (
    prompt: string,
    template: string,
    answers: string[],
    feedback: StepFeedback,
    placeholder = "…",
    id?: string
  ): LessonBlock => ({
    id: id ?? nextId("fill"),
    kind: "fillBlank",
    prompt,
    template,
    answers,
    feedback,
    placeholder,
  }),

  debug: (
    prompt: string,
    code: string,
    choices: { id: string; label: string }[],
    correctId: string,
    feedback: StepFeedback,
    id?: string
  ): LessonBlock => ({
    id: id ?? nextId("debug"),
    kind: "debug",
    prompt,
    code,
    choices,
    correctId,
    feedback,
  }),

  match: (
    prompt: string,
    pairs: { left: string; right: string }[],
    feedback: StepFeedback,
    id?: string
  ): LessonBlock => ({
    id: id ?? nextId("match"),
    kind: "match",
    prompt,
    pairs,
    feedback,
  }),

  miniEdit: (
    prompt: string,
    lines: string[],
    starterCode: string,
    mustContain: string[],
    feedback: StepFeedback,
    id?: string
  ): LessonBlock => ({
    id: id ?? nextId("mini"),
    kind: "miniEdit",
    prompt,
    lines,
    starterCode,
    mustContain,
    feedback,
  }),

  coding: (input: {
    title: string
    lines: string[]
    starterCode?: string
    tests: import("@/lib/ai/schemas/lesson-blocks").LessonTest[]
    successCriteria?: string
    id?: string
  }): LessonBlock => ({
    id: input.id ?? nextId("coding"),
    kind: "coding",
    title: input.title,
    lines: input.lines,
    starterCode: input.starterCode ?? "",
    tests: input.tests,
    successCriteria: input.successCriteria,
  }),

  complete: (
    title: string,
    lines: string[],
    id?: string
  ): LessonBlock => ({
    id: id ?? nextId("complete"),
    kind: "complete",
    title,
    lines,
  }),
}
