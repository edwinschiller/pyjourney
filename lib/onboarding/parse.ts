import type { PriorExperience } from "@/lib/mastery"

import {
  CUSTOM_GOAL_VALUE,
  GOAL_OPTIONS,
  INTEREST_TAG_OPTIONS,
  MAX_GOAL_LENGTH,
  MAX_INTEREST_LENGTH,
  MAX_INTEREST_TAGS,
  type LearningPace,
  type StudentOnboarding,
} from "./types"

const EXPERIENCE_IDS = new Set<string>(["none", "little", "some", "confident"])
const PACE_IDS = new Set<string>(["slow", "normal", "fast"])
const INTEREST_BY_ID = new Map<string, string>(
  INTEREST_TAG_OPTIONS.map((item) => [item.id, item.label])
)

const normalizeTag = (raw: string) => raw.trim().replace(/\s+/g, " ")

const isValidCustomText = (value: string, maxLength: number) => {
  if (value.length < 2 || value.length > maxLength) {
    return false
  }
  return /^[\p{L}\p{N}\s&+\-.,'!?]+$/u.test(value)
}

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
  if (!Array.isArray(row.interestTags) || row.interestTags.length === 0) {
    return false
  }
  if (!PACE_IDS.has(String(row.pace))) {
    return false
  }
  return true
}

export const parseOnboardingFormData = (
  formData: FormData
):
  | { ok: true; data: Omit<StudentOnboarding, "completedAt"> }
  | { ok: false; error: string } => {
  const priorExperience = String(formData.get("priorExperience") ?? "")
  if (!EXPERIENCE_IDS.has(priorExperience)) {
    return { ok: false, error: "Choose your experience level." }
  }

  const goalChoice = String(formData.get("goal") ?? "")
  let goal = ""
  if (goalChoice === CUSTOM_GOAL_VALUE) {
    goal = normalizeTag(String(formData.get("customGoal") ?? ""))
    if (!isValidCustomText(goal, MAX_GOAL_LENGTH)) {
      return {
        ok: false,
        error: `Enter a custom goal (${2}–${MAX_GOAL_LENGTH} characters).`,
      }
    }
  } else {
    const goalOption = GOAL_OPTIONS.find((item) => item.id === goalChoice)
    if (!goalOption) {
      return { ok: false, error: "Choose a learning goal." }
    }
    goal = goalOption.label
  }

  const rawTags = formData
    .getAll("interestTags")
    .map((value) => String(value))
    .map(normalizeTag)
    .filter(Boolean)

  const interestTags: string[] = []
  for (const tag of rawTags) {
    const presetLabel = INTEREST_BY_ID.get(tag)
    const resolved = presetLabel ?? tag
    if (!presetLabel && !isValidCustomText(resolved, MAX_INTEREST_LENGTH)) {
      return {
        ok: false,
        error: `Interest “${resolved}” is invalid (${2}–${MAX_INTEREST_LENGTH} characters).`,
      }
    }
    const key = resolved.toLowerCase()
    if (interestTags.some((item) => item.toLowerCase() === key)) {
      continue
    }
    interestTags.push(resolved)
  }

  if (interestTags.length === 0) {
    return { ok: false, error: "Add at least one interest." }
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
