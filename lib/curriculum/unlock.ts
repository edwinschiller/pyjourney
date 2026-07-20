import type { CurriculumGraph } from "./types"

/** Score at/above this means a prerequisite concept is considered met. */
export const PREREQUISITE_MET_SCORE = 40

export type MasteryScoreMap = Map<string, number>

export const getMasteryScore = (
  masteryByConceptId: MasteryScoreMap,
  conceptId: string
) => masteryByConceptId.get(conceptId) ?? 0

export const isPrerequisiteMet = (
  masteryByConceptId: MasteryScoreMap,
  prerequisiteId: string
) => getMasteryScore(masteryByConceptId, prerequisiteId) >= PREREQUISITE_MET_SCORE

export const getUnmetPrerequisites = (
  graph: CurriculumGraph,
  conceptId: string,
  masteryByConceptId: MasteryScoreMap
) => {
  const prereqIds = graph.prerequisitesByConceptId.get(conceptId) ?? []
  return prereqIds.filter(
    (prereqId) => !isPrerequisiteMet(masteryByConceptId, prereqId)
  )
}

export const isConceptUnlocked = (
  graph: CurriculumGraph,
  conceptId: string,
  masteryByConceptId: MasteryScoreMap
) => getUnmetPrerequisites(graph, conceptId, masteryByConceptId).length === 0

export const listUnlockedConcepts = (
  graph: CurriculumGraph,
  masteryByConceptId: MasteryScoreMap
) =>
  graph.concepts.filter((concept) =>
    isConceptUnlocked(graph, concept.id, masteryByConceptId)
  )
