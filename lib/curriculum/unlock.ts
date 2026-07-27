import type { CurriculumGraph } from "./types"

/** Score at/above this means a prerequisite concept is considered met without a completed lesson. */
export const PREREQUISITE_MET_SCORE = 85

export type MasteryScoreMap = Map<string, number>

export const getMasteryScore = (
  masteryByConceptId: MasteryScoreMap,
  conceptId: string
) => masteryByConceptId.get(conceptId) ?? 0

/**
 * A prerequisite is met when the learner finished that concept's lesson,
 * or when mastery reaches the unlock threshold (same bar as "done" for next).
 */
export const isPrerequisiteMet = (
  masteryByConceptId: MasteryScoreMap,
  prerequisiteId: string,
  completedConceptIds?: Set<string>
) =>
  Boolean(completedConceptIds?.has(prerequisiteId)) ||
  getMasteryScore(masteryByConceptId, prerequisiteId) >= PREREQUISITE_MET_SCORE

export const getUnmetPrerequisites = (
  graph: CurriculumGraph,
  conceptId: string,
  masteryByConceptId: MasteryScoreMap,
  completedConceptIds?: Set<string>
) => {
  const prereqIds = graph.prerequisitesByConceptId.get(conceptId) ?? []
  return prereqIds.filter(
    (prereqId) =>
      !isPrerequisiteMet(masteryByConceptId, prereqId, completedConceptIds)
  )
}

export const isConceptUnlocked = (
  graph: CurriculumGraph,
  conceptId: string,
  masteryByConceptId: MasteryScoreMap,
  completedConceptIds?: Set<string>
) =>
  getUnmetPrerequisites(
    graph,
    conceptId,
    masteryByConceptId,
    completedConceptIds
  ).length === 0

export const listUnlockedConcepts = (
  graph: CurriculumGraph,
  masteryByConceptId: MasteryScoreMap,
  completedConceptIds?: Set<string>
) =>
  graph.concepts.filter((concept) =>
    isConceptUnlocked(
      graph,
      concept.id,
      masteryByConceptId,
      completedConceptIds
    )
  )

