import type { PriorExperience } from "@/lib/mastery"

import {
  GOAL_OPTIONS,
  INTEREST_TAG_OPTIONS,
  MAX_GOAL_LENGTH,
  MAX_INTEREST_TAGS,
  type LearningPace,
  type StudentOnboarding,
} from "./types"

const EXPERIENCE_IDS = new Set<string>(["none", "little", "some", "confident"])
const PACE_IDS = new Set<string>(["slow", "normal", "fast"])
const INTEREST_IDS = new Set<string>(
  INTEREST_TAG_OPTIONS.map((item) => item.id)
)

export const isOnboardingComplete = (
  value: unknown
): value is StudentOnboarding => {
  if (!value || typeof value !== "object") {
    return false
  }
  const row = value as Record<string, unknown>
  if (typeof row.completedAt !== "string" || !row.completedAt) {
    return false
  }
  if (!EXPERIENCE_IDS.has(String(row.priorExperience))) {
    return false
  }
  if (typeof row.goal !== "string" || row.goal.trim().length === 0) {
    return false
  }
  if (!Array.isArray(row.interestTags)) {
    return false
  }
  if (!PACE_IDS.has(String(row.pace))) {
    return false
  }
  return true
}

export const parseOnboardingFormData = (
  formData: FormData
): { ok: true; data: Omit<StudentOnboarding, "completedAt"> } | { ok: false; error: string } => {
  const priorExperience = String(formData.get("priorExperience") ?? "")
  if (!EXPERIENCE_IDS.has(priorExperience)) {
    return { ok: false, error: "Choose your experience level." }
  }

  const goalId = String(formData.get("goal") ?? "")
  const goalOption = GOAL_OPTIONS.find((item) => item.id === goalId)
  if (!goalOption) {
    return { ok: false, error: "Choose a learning goal." }
  }
  const goal = goalOption.label
  if (goal.length > MAX_GOAL_LENGTH) {
    return { ok: false, error: "Goal is too long." }
  }

  const interestTags = formData
    .getAll("interestTags")
    .map((value) => String(value))
    .filter((value) => INTEREST_IDS.has(value))

  if (interestTags.length === 0) {
    return { ok: false, error: "Pick at least one interest." }
  }
  if (interestTags.length > MAX_INTEREST_TAGS) {
    return {
      ok: false,
      error: `Pick at most ${MAX_INTEREST_TAGS} interests.`,
    }
  }

  const pace = String(formData.get("pace") ?? "")
  if (!PACE_IDS.has(pace)) {
    return { ok: false, error: "Choose a learning pace." }
  }

  return {
    ok: true,
    data: {
      priorExperience: priorExperience as PriorExperience,
      goal,
      interestTags,
      pace: pace as LearningPace,
    },
  }
}
