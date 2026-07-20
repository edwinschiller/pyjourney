import { clampScore } from "./bands"

export type MasteryEvent =
  | { type: "test_pass"; strength?: "weak" | "normal" | "strong" }
  | { type: "test_fail" }
  | { type: "transfer_pass" }
  | { type: "hint_used"; level: number }
  | {
      type: "ai_suggestion"
      delta: number
      confidence: number
      hasEvidence: boolean
    }

const TEST_PASS_DELTA = {
  weak: 5,
  normal: 8,
  strong: 12,
} as const

/**
 * Pure score delta from a learning event.
 * AI never writes scores directly — only clamped suggestions when confident.
 */
export const computeMasteryDelta = (event: MasteryEvent): number => {
  switch (event.type) {
    case "test_pass":
      return TEST_PASS_DELTA[event.strength ?? "normal"]
    case "test_fail":
      return -2
    case "transfer_pass":
      return 8
    case "hint_used":
      return event.level >= 4 ? -3 : 0
    case "ai_suggestion": {
      if (!event.hasEvidence || event.confidence < 0.6) {
        return 0
      }
      return Math.max(-5, Math.min(5, Math.round(event.delta)))
    }
    default:
      return 0
  }
}

export const applyDeltaToScore = (currentScore: number, delta: number) =>
  clampScore(currentScore + delta)
