import type {
  LearnerState,
  LessonEvent,
} from "@/lib/ai/schemas/lesson-blocks"

const FAST_MS = 8_000
const SLOW_MS = 25_000

export type PyjoIntent =
  | "explain"
  | "quiz_easy"
  | "quiz_hard"
  | "scaffold"
  | "coding"
  | "complete"
  | "remediate"

/** Fold a new event into learner state (pure). */
export const updateLearnerState = (
  previous: LearnerState,
  event: LessonEvent
): LearnerState => {
  const latency = event.latencyMs ?? 15_000
  const correctStreak = event.passed ? previous.correctStreak + 1 : 0
  const failStreak = event.passed ? 0 : previous.failStreak + 1
  const stepsCompleted = previous.stepsCompleted + 1

  let confidence = previous.confidence
  if (event.passed) {
    confidence += latency < FAST_MS ? 0.08 : 0.04
  } else {
    confidence -= latency > SLOW_MS ? 0.1 : 0.06
  }
  confidence = Math.max(0, Math.min(1, confidence))

  const recentPaceHint =
    latency < FAST_MS ? "fast" : latency > SLOW_MS ? "slow" : "steady"

  // Blend toward recent pace
  const pace =
    recentPaceHint === previous.pace
      ? previous.pace
      : confidence > 0.65 && recentPaceHint === "fast"
        ? "fast"
        : confidence < 0.4 || recentPaceHint === "slow"
          ? "slow"
          : "steady"

  const struggleTopics = [...previous.struggleTopics]
  if (!event.passed && event.kind) {
    const topic = String(event.detail ?? event.kind)
    if (!struggleTopics.includes(topic) && struggleTopics.length < 6) {
      struggleTopics.push(topic)
    }
  }

  return {
    pace,
    confidence,
    struggleTopics,
    correctStreak,
    failStreak,
    stepsCompleted,
  }
}

/**
 * Policy: what should PyJo do next?
 * Fast + confident → harder; slow/failing → explain/remediate.
 */
export const choosePyjoIntent = (input: {
  learner: LearnerState
  lastEvent?: LessonEvent | null
  hasCodingPassed: boolean
  hasComplete: boolean
  pyjoTurns: number
  revealedKinds: string[]
}): PyjoIntent => {
  const { learner, lastEvent, hasCodingPassed, hasComplete, pyjoTurns, revealedKinds } =
    input

  if (hasCodingPassed && !hasComplete) return "complete"
  if (hasComplete) return "complete"

  if (lastEvent && !lastEvent.passed) {
    if (lastEvent.kind === "coding" || learner.failStreak >= 2) {
      return "scaffold"
    }
    return "remediate"
  }

  if (pyjoTurns === 0 || !revealedKinds.includes("intro")) {
    return "explain"
  }

  if (
    learner.pace === "fast" &&
    learner.confidence >= 0.6 &&
    learner.correctStreak >= 2
  ) {
    if (!revealedKinds.includes("coding") && pyjoTurns >= 3) return "coding"
    return "quiz_hard"
  }

  if (learner.pace === "slow" || learner.confidence < 0.4) {
    if (learner.failStreak > 0) return "remediate"
    return pyjoTurns % 2 === 0 ? "explain" : "quiz_easy"
  }

  if (!revealedKinds.includes("coding") && pyjoTurns >= 4) {
    return "coding"
  }

  return "quiz_easy"
}
