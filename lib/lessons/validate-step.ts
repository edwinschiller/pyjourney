import type { LessonBlock } from "@/lib/ai/schemas/lesson-blocks"

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ")

export type LessonStepState = {
  introAcknowledged: boolean
  selectedChoiceId: string | null
  choiceSubmitted: boolean
  dragOrder: number[]
  dragChecked: boolean
  fillValue: string
  fillSubmitted: boolean
  matchedPairs: Map<string, string>
  selectedMatchLeft: string | null
  miniEditCode: string
  miniEditChecked: boolean
  codingTestsPassed: boolean
}

export const createInitialStepState = (step: LessonBlock): LessonStepState => {
  const shuffled =
    step.kind === "dragOrder"
      ? [...step.blocks.keys()].sort(() => Math.random() - 0.5)
      : []

  return {
    introAcknowledged: false,
    selectedChoiceId: null,
    choiceSubmitted: false,
    dragOrder: shuffled,
    dragChecked: false,
    fillValue: "",
    fillSubmitted: false,
    matchedPairs: new Map(),
    selectedMatchLeft: null,
    miniEditCode: step.kind === "miniEdit" ? step.starterCode : "",
    miniEditChecked: false,
    codingTestsPassed: false,
  }
}

export const isInteractiveStepComplete = (
  step: LessonBlock,
  state: LessonStepState
): boolean => {
  switch (step.kind) {
    case "intro":
      return true
    case "multipleChoice":
    case "prediction":
    case "debug":
      return (
        state.choiceSubmitted && state.selectedChoiceId === step.correctId
      )
    case "dragOrder":
      return (
        state.dragChecked &&
        state.dragOrder.length === step.blocks.length &&
        state.dragOrder.every(
          (index, position) => index === step.correctOrder[position]
        )
      )
    case "fillBlank":
      if (!state.fillSubmitted) return false
      if (step.answers.length === 0) {
        return state.fillValue.trim().length > 0
      }
      return step.answers.some(
        (answer) => normalize(state.fillValue) === normalize(answer)
      )
    case "match":
      return state.matchedPairs.size === step.pairs.length
    case "miniEdit":
      return (
        state.miniEditChecked &&
        step.mustContain.every((part) =>
          normalize(state.miniEditCode).includes(normalize(part))
        )
      )
    case "coding":
      return state.codingTestsPassed
    case "complete":
      return true
    default:
      return false
  }
}

export const canAdvanceFromStep = (
  step: LessonBlock,
  state: LessonStepState
): boolean => {
  switch (step.kind) {
    case "intro":
    case "complete":
      return true
    case "coding":
      return state.codingTestsPassed
    default:
      return isInteractiveStepComplete(step, state)
  }
}

export const checkChoiceAnswer = (
  step: LessonBlock,
  choiceId: string
): boolean => {
  if (
    step.kind !== "multipleChoice" &&
    step.kind !== "prediction" &&
    step.kind !== "debug"
  ) {
    return false
  }
  return choiceId === step.correctId
}
