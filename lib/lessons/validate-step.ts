import type { LessonBlock } from "@/lib/ai/schemas/lesson-blocks"

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ")

/** Prefer token-ish match so "score" does not match inside "2score". */
const containsRequirement = (haystack: string, needle: string) => {
  const hay = normalize(haystack)
  const need = normalize(needle)
  if (!need) return true

  const escaped = need.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  // Pure identifier: require non-identifier borders on both sides.
  if (/^[a-z_][\w.]*$/i.test(needle.trim())) {
    return new RegExp(`(^|[^a-z0-9_])${escaped}([^a-z0-9_]|$)`, "i").test(hay)
  }

  // Needle starts with an identifier (e.g. "score =", "print(score)"):
  // that identifier must not be glued to a leading digit/letter ("2score =").
  const leadingId = needle.trim().match(/^([a-z_][\w]*)/i)
  if (leadingId) {
    const id = leadingId[1].toLowerCase()
    const rest = escaped.slice(id.length)
    return new RegExp(`(^|[^a-z0-9_])${id}${rest}`, "i").test(hay)
  }

  return hay.includes(need)
}

export type LessonStepState = {
  selectedChoiceId: string | null
  choiceSubmitted: boolean
  fillValue: string
  fillSubmitted: boolean
  miniEditCode: string
  miniEditChecked: boolean
  applyPassed: boolean
  startedAt: number
  attempts: number
}

export const createInitialStepState = (step: LessonBlock): LessonStepState => ({
  selectedChoiceId: null,
  choiceSubmitted: false,
  fillValue: "",
  fillSubmitted: false,
  miniEditCode:
    step.kind === "practice" && step.mode === "miniEdit"
      ? (step.starterCode ?? "")
      : "",
  miniEditChecked: false,
  applyPassed: false,
  startedAt: Date.now(),
  attempts: 0,
})

export const isStepComplete = (
  step: LessonBlock,
  state: LessonStepState
): boolean => {
  switch (step.kind) {
    case "explain":
    case "complete":
      return true
    case "quiz":
      return state.choiceSubmitted && state.selectedChoiceId === step.correctId
    case "practice":
      if (step.mode === "fillBlank") {
        if (!state.fillSubmitted) return false
        const answers = step.answers ?? []
        if (answers.length === 0) return state.fillValue.trim().length > 0
        return answers.some(
          (answer) => normalize(state.fillValue) === normalize(answer)
        )
      }
      if (!state.miniEditChecked) return false
      const code = state.miniEditCode
      const required = step.mustContain ?? []
      const forbidden = step.mustNotContain ?? []
      const matchAny = step.mustMatchAny ?? []
      const hasRequired = required.every((part) =>
        containsRequirement(code, part)
      )
      const hasForbidden = forbidden.some((part) =>
        normalize(code).includes(normalize(part))
      )
      const hasMatchAny =
        matchAny.length === 0 ||
        matchAny.some((pattern) => {
          try {
            return new RegExp(pattern, "i").test(code)
          } catch {
            return false
          }
        })
      return hasRequired && !hasForbidden && hasMatchAny
    case "apply":
      return state.applyPassed
    default:
      return false
  }
}

export const canAdvance = (step: LessonBlock, state: LessonStepState) =>
  isStepComplete(step, state)
