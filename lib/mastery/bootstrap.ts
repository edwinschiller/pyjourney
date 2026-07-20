import { loadCurriculumGraph } from "@/lib/curriculum"

import type { PriorExperience, MasteryRecord } from "./bands"
import {
  getSeedConceptSlugsForExperience,
  getStartScoreForExperience,
} from "./experience"
import { getMasteryForConcept, upsertMasteryScore } from "./queries"

export type BootstrapMasteryResult = {
  experience: PriorExperience
  startScore: number
  seeded: MasteryRecord[]
}

/**
 * Initialize mastery from onboarding experience.
 * Only seeds overlapping early concepts; others stay absent (score 0).
 * Does not overwrite higher existing scores.
 */
export const bootstrapMasteryFromExperience = async (
  studentId: string,
  experience: PriorExperience
): Promise<BootstrapMasteryResult> => {
  const graph = await loadCurriculumGraph()
  const startScore = getStartScoreForExperience(experience)
  const slugs = getSeedConceptSlugsForExperience(experience)
  const seeded: MasteryRecord[] = []

  for (const slug of slugs) {
    const concept = graph.conceptBySlug.get(slug)
    if (!concept) {
      continue
    }

    const existing = await getMasteryForConcept(studentId, concept.id)
    if (existing && existing.score >= startScore) {
      seeded.push(existing)
      continue
    }

    const record = await upsertMasteryScore({
      studentId,
      conceptId: concept.id,
      score: startScore,
      evidenceDelta: existing ? 0 : 1,
    })
    seeded.push(record)
  }

  return { experience, startScore, seeded }
}
