import type { PriorExperience, MasteryRecord } from "./bands"

export type BootstrapMasteryResult = {
  experience: PriorExperience
  startScore: number
  seeded: MasteryRecord[]
}

/**
 * No-op: mastery starts at 0 for every learner.
 * Kept for call-site compatibility after onboarding removal.
 */
export const bootstrapMasteryFromExperience = async (
  _studentId: string,
  experience: PriorExperience
): Promise<BootstrapMasteryResult> => ({
  experience,
  startScore: 0,
  seeded: [],
})
