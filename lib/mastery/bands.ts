export type MasteryBand =
  | "learning"
  | "developing"
  | "proficient"
  | "mastered"

export type PriorExperience = "none" | "little" | "some" | "confident"

export type MasteryRecord = {
  id: string
  studentId: string
  conceptId: string
  score: number
  band: MasteryBand
  evidenceCount: number
  updatedAt: Date
}

export const scoreToBand = (score: number): MasteryBand => {
  if (score >= 85) return "mastered"
  if (score >= 70) return "proficient"
  if (score >= 40) return "developing"
  return "learning"
}

export const clampScore = (score: number) =>
  Math.max(0, Math.min(100, Math.round(score)))
