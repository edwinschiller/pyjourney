import type { PriorExperience } from "./bands"

/** Mastery always starts at 0 — onboarding no longer seeds scores. */
export const EXPERIENCE_START_SCORE: Record<PriorExperience, number> = {
  none: 0,
  little: 0,
  some: 0,
  confident: 0,
}

/** No concepts are pre-seeded from experience. */
export const EXPERIENCE_SEED_SLUGS: Record<PriorExperience, string[]> = {
  none: [],
  little: [],
  some: [],
  confident: [],
}

export const getStartScoreForExperience = (experience: PriorExperience) =>
  EXPERIENCE_START_SCORE[experience]

export const getSeedConceptSlugsForExperience = (
  experience: PriorExperience
) => EXPERIENCE_SEED_SLUGS[experience]
