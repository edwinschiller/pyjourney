import type { PriorExperience } from "./bands"

/** Start score applied to the first / overlapping concepts from onboarding. */
export const EXPERIENCE_START_SCORE: Record<PriorExperience, number> = {
  none: 5,
  little: 20,
  some: 40,
  confident: 55,
}

/**
 * Concepts that receive the onboarding start score for a given experience.
 * Later concepts stay at 0 until unlocked through learning.
 */
export const EXPERIENCE_SEED_SLUGS: Record<PriorExperience, string[]> = {
  none: ["variables"],
  little: ["variables"],
  some: ["variables", "data_types"],
  confident: ["variables", "data_types", "conditions"],
}

export const getStartScoreForExperience = (experience: PriorExperience) =>
  EXPERIENCE_START_SCORE[experience]

export const getSeedConceptSlugsForExperience = (
  experience: PriorExperience
) => EXPERIENCE_SEED_SLUGS[experience]
