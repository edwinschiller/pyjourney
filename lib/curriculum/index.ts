import { and, asc, eq } from "drizzle-orm"

import { getDb } from "@/lib/db"
import {
  assignmentRecipients,
  assignments,
} from "@/lib/db/schema"

import { loadCurriculumGraph } from "./graph"
import { selectNextConcept, type NextConceptResult } from "./next-concept"
import type { MasteryScoreMap } from "./unlock"
import { listUnlockedConcepts } from "./unlock"

export {
  buildCurriculumGraph,
  findPrerequisiteCycles,
  loadCurriculumGraph,
} from "./graph"
export {
  NEXT_CONCEPT_DONE_SCORE,
  selectNextConcept,
  type NextConceptResult,
  type SelectNextConceptInput,
} from "./next-concept"
export type { ConceptNode, CurriculumGraph, PrerequisiteEdge } from "./types"
export {
  getMasteryScore,
  getUnmetPrerequisites,
  isConceptUnlocked,
  isPrerequisiteMet,
  listUnlockedConcepts,
  PREREQUISITE_MET_SCORE,
  type MasteryScoreMap,
} from "./unlock"

/** Open assignment with a concept, oldest first (simple MVP priority). */
export const findActiveAssignmentConceptId = async (
  studentId: string
): Promise<string | null> => {
  const db = getDb()

  const rows = await db
    .select({
      conceptId: assignments.conceptId,
      status: assignmentRecipients.status,
      createdAt: assignments.createdAt,
    })
    .from(assignmentRecipients)
    .innerJoin(
      assignments,
      eq(assignments.id, assignmentRecipients.assignmentId)
    )
    .where(
      and(
        eq(assignmentRecipients.studentId, studentId),
        eq(assignmentRecipients.status, "assigned")
      )
    )
    .orderBy(asc(assignments.createdAt))
    .limit(20)

  for (const row of rows) {
    if (row.conceptId) {
      return row.conceptId
    }
  }

  return null
}

export const resolveNextConceptForStudent = async (
  studentId: string,
  masteryByConceptId: MasteryScoreMap,
  options?: { honorAssignments?: boolean }
): Promise<NextConceptResult | null> => {
  const graph = await loadCurriculumGraph()
  const honorAssignments = options?.honorAssignments ?? true
  const assignmentConceptId = honorAssignments
    ? await findActiveAssignmentConceptId(studentId)
    : null

  return selectNextConcept({
    graph,
    masteryByConceptId,
    assignmentConceptId,
  })
}

export const getUnlockedConceptsForStudent = async (
  masteryByConceptId: MasteryScoreMap
) => {
  const graph = await loadCurriculumGraph()
  return listUnlockedConcepts(graph, masteryByConceptId)
}
