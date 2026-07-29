const VAGUE_QUIZ_PROMPT =
  /^(choose|select|pick)\s+(the\s+)?(correct|right)\s+answer\.?:?$/i

const QUESTION_LEAD =
  /^(what|which|why|when|how|where|who|does|do|is|are|can|will|should)\b/i

/** Bare prompts like "Choose the correct answer:" with no real question. */
export const isVagueQuizPrompt = (prompt: string) => {
  const trimmed = prompt.trim()
  if (!trimmed) return true
  if (VAGUE_QUIZ_PROMPT.test(trimmed)) return true

  const withoutCode = trimmed
    .replace(/`[^`]+`/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  const words = withoutCode.split(" ").filter(Boolean)
  if (words.length < 4 && !trimmed.includes("?")) return true

  const asksSomething =
    trimmed.includes("?") ||
    QUESTION_LEAD.test(withoutCode) ||
    /complete|fill|fix|true or false|output|print|operator|keyword|means|happen/i.test(
      withoutCode
    )

  return !asksSomething
}

export const assertUsableQuizBlock = (block: {
  prompt: string
  choices: { id: string; label: string }[]
  correctId: string
  code?: string
}) => {
  const prompt = block.prompt.trim()
  if (!prompt) throw new Error("Quiz missing prompt")
  if (isVagueQuizPrompt(prompt)) {
    throw new Error(
      'Quiz prompt is too vague — ask a concrete question (not just "Choose the correct answer")'
    )
  }
  if (block.choices.length < 2) {
    throw new Error("Quiz needs at least 2 choices")
  }
  if (block.choices.some((choice) => !choice.label.trim())) {
    throw new Error("Quiz has empty choice labels")
  }
  if (!block.choices.some((choice) => choice.id === block.correctId)) {
    throw new Error("Quiz correctId must match a choice")
  }
  const labels = block.choices.map((choice) =>
    choice.label.trim().toLowerCase()
  )
  if (new Set(labels).size !== labels.length) {
    throw new Error("Quiz choices must be unique")
  }
}

export const isUsableQuizBlock = (block: {
  prompt: string
  choices: { id: string; label: string }[]
  correctId: string
  code?: string
}) => {
  try {
    assertUsableQuizBlock(block)
    return true
  } catch {
    return false
  }
}

const hashSeed = (text: string) => {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Deterministic shuffle so choice order is stable for a given seed. */
export const shuffleWithSeed = <T,>(items: T[], seed: string): T[] => {
  const arr = [...items]
  if (arr.length < 2) return arr
  let state = hashSeed(seed) || 1
  for (let i = arr.length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const j = state % (i + 1)
    const left = arr[i]!
    arr[i] = arr[j]!
    arr[j] = left
  }
  return arr
}

/** Shuffle quiz choices; correctId still points at the same choice id. */
export const withShuffledQuizChoices = <
  T extends {
    id: string
    choices: { id: string; label: string }[]
    correctId: string
  },
>(
  quiz: T
): T => ({
  ...quiz,
  choices: shuffleWithSeed(
    quiz.choices,
    `${quiz.id}:${quiz.correctId}:${quiz.choices.map((choice) => choice.id).join(",")}`
  ),
})

