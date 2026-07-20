import type { CurriculumGraph, ConceptNode } from "./types"
import {
  getMasteryScore,
  getUnmetPrerequisites,
  isConceptUnlocked,
  type MasteryScoreMap,
} from "./unlock"

/** Concepts at/above this score are treated as done for "next" selection. */
export const NEXT_CONCEPT_DONE_SCORE = 85

export type NextConceptResult = {
  concept: ConceptNode
  reason: "adaptive" | "assignment_override"
  unmetPrerequisiteIds: string[]
}

export type SelectNextConceptInput = {
  graph: CurriculumGraph
  masteryByConceptId: MasteryScoreMap
  /** Teacher assignment concept id — wins over adaptive selection when set */
  assignmentConceptId?: string | null
}

/**
 * Pick the next concept:
 * 1. If assignmentConceptId is set and exists → override (even if locked)
 * 2. Else lowest orderIndex among unlocked concepts not yet mastered
 */
export const selectNextConcept = (
  input: SelectNextConceptInput
): NextConceptResult | null => {
  const { graph, masteryByConceptId, assignmentConceptId } = input

  if (assignmentConceptId) {
    const assigned = graph.conceptById.get(assignmentConceptId)
    if (assigned) {
      const unmet = getUnmetPrerequisites(
        graph,
        assigned.id,
        masteryByConceptId
      )
      return {
        concept: assigned,
        reason: "assignment_override",
        unmetPrerequisiteIds: unmet,
      }
    }
  }

  const candidates = graph.concepts.filter((concept) => {
    if (!isConceptUnlocked(graph, concept.id, masteryByConceptId)) {
      return false
    }
    return getMasteryScore(masteryByConceptId, concept.id) < NEXT_CONCEPT_DONE_SCORE
  })

  const next = candidates[0]
  if (!next) {
    return null
  }

  return {
    concept: next,
    reason: "adaptive",
    unmetPrerequisiteIds: [],
  }
}
