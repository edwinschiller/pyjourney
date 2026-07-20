import type { LessonBlock } from "@/lib/ai/schemas/lesson-blocks"

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ")

export type LessonStepState = {
  selectedChoiceId: string | null
  choiceSubmitted: boolean
  fillValue: string
  fillSubmitted: boolean
  miniEditCode: string
  miniEditChecked: boolean
  codingTestsPassed: boolean
  startedAt: number
  attempts: number
}

export const createInitialStepState = (step: LessonBlock): LessonStepState => ({
  selectedChoiceId: null,
  choiceSubmitted: false,
  fillValue: "",
  fillSubmitted: false,
  miniEditCode: step.kind === "miniEdit" ? step.starterCode : "",
  miniEditChecked: false,
  codingTestsPassed: false,
  startedAt: Date.now(),
  attempts: 0,
})

export const isStepComplete = (
  step: LessonBlock,
  state: LessonStepState
): boolean => {
  switch (step.kind) {
    case "intro":
    case "complete":
      return true
    case "multipleChoice":
    case "prediction":
    case "debug":
      return state.choiceSubmitted && state.selectedChoiceId === step.correctId
    case "fillBlank":
      if (!state.fillSubmitted) return false
      if (step.answers.length === 0) return state.fillValue.trim().length > 0
      return step.answers.some(
        (answer) => normalize(state.fillValue) === normalize(answer)
      )
    case "miniEdit":
      return (
        state.miniEditChecked &&
        step.mustContain.every((part) =>
          normalize(state.miniEditCode).includes(normalize(part))
        )
      )
    case "coding":
      return state.codingTestsPassed
    default:
      return false
  }
}

export const canAdvance = (step: LessonBlock, state: LessonStepState) =>
  isStepComplete(step, state)
