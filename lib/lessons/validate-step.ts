import type { LessonBlock } from "@/lib/ai/schemas/lesson-blocks"

const expandTabs = (value: string) => value.replace(/\t/g, "    ")

const normalizeLoose = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ")

/**
 * Needles that start with whitespace are indentation-sensitive.
 * We must NOT collapse leading spaces (that made "    print" match "print").
 */
const isIndentSensitive = (needle: string) => /^\s+\S/.test(needle)

/** Escape a literal, then treat ' and " as interchangeable. */
const toQuoteFlexiblePattern = (snippet: string) =>
  snippet
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/['"]/g, `['"]`)

/**
 * Python string quotes are equivalent for practice checks:
 * print('Fail') matches print("Fail").
 */
const matchesSnippet = (haystack: string, needle: string) => {
  const trimmed = needle.trim()
  if (!trimmed) return true
  if (haystack.includes(needle) || haystack.includes(trimmed)) return true

  try {
    return new RegExp(toQuoteFlexiblePattern(trimmed), "i").test(haystack)
  } catch {
    return normalizeLoose(haystack).includes(normalizeLoose(trimmed))
  }
}

/** Prefer token-ish match so "score" does not match inside "2score". */
const containsRequirement = (haystack: string, needle: string) => {
  if (!needle.trim()) return true

  if (isIndentSensitive(needle)) {
    const expandedHay = expandTabs(haystack)
    const expandedNeedle = expandTabs(needle)
    if (expandedHay.includes(expandedNeedle)) return true

    const body = needle.trim()
    try {
      return new RegExp(
        `^[ \\t]+${toQuoteFlexiblePattern(body)}\\s*(?:#.*)?$`,
        "im"
      ).test(haystack)
    } catch {
      return false
    }
  }

  if (matchesSnippet(haystack, needle)) return true

  const hay = normalizeLoose(haystack)
  const need = normalizeLoose(needle)
  if (!need) return true

  // Quote-flexible includes on normalized text.
  if (matchesSnippet(hay, need)) return true

  const escaped = need.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  // Pure identifier: require non-identifier borders on both sides.
  if (/^[a-z_][\w.]*$/i.test(needle.trim())) {
    return new RegExp(`(^|[^a-z0-9_])${escaped}([^a-z0-9_]|$)`, "i").test(hay)
  }

  // Needle starts with an identifier (e.g. "score =", "print(score)"):
  // that identifier must not be glued to a leading digit/letter ("2score =").
  const leadingId = needle.trim().match(/^([a-z_][\w]*)/i)
  if (leadingId) {
    const id = leadingId[1]!.toLowerCase()
    const rest = toQuoteFlexiblePattern(needle.trim().slice(id.length))
    return new RegExp(`(^|[^a-z0-9_])${id}${rest}`, "i").test(haystack)
  }

  return hay.includes(need)
}

const containsForbidden = (haystack: string, needle: string) => {
  if (!needle.trim()) return false

  // Multiline / indent-sensitive forbidden patterns stay raw-ish,
  // but still allow quote flexibility.
  if (isIndentSensitive(needle) || needle.includes("\n")) {
    const expandedHay = expandTabs(haystack)
    const expandedNeedle = expandTabs(needle)
    if (expandedHay.includes(expandedNeedle)) return true
    return matchesSnippet(expandedHay, expandedNeedle)
  }

  if (matchesSnippet(haystack, needle)) return true
  return normalizeLoose(haystack).includes(normalizeLoose(needle))
}

const answersMatch = (value: string, answer: string) => {
  if (normalizeLoose(value) === normalizeLoose(answer)) return true
  return matchesSnippet(value, answer) && matchesSnippet(answer, value)
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
  state: LessonStepState,
  options?: { stderr?: string }
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
        return answers.some((answer) => answersMatch(state.fillValue, answer))
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
        containsForbidden(code, part)
      )
      const hasMatchAny =
        matchAny.length === 0 ||
        matchAny.some((pattern) => {
          try {
            return new RegExp(pattern, "i").test(code)
          } catch {
            return matchesSnippet(code, pattern)
          }
        })
      const stderr = options?.stderr?.trim() ?? ""
      const hasFatalSyntax =
        /IndentationError|SyntaxError|TabError/i.test(stderr)
      return (
        hasRequired && !hasForbidden && hasMatchAny && !hasFatalSyntax
      )
    case "apply":
      return state.applyPassed
    default:
      return false
  }
}

export const canAdvance = (
  step: LessonBlock,
  state: LessonStepState,
  options?: { stderr?: string }
) => isStepComplete(step, state, options)
