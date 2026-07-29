import { asc, eq } from "drizzle-orm"
import { cache } from "react"

import { getDb } from "@/lib/db"
import { conceptPrerequisites, concepts } from "@/lib/db/schema"

import type { ConceptNode, CurriculumGraph, PrerequisiteEdge } from "./types"

const loadCurriculumGraphUncached = async (): Promise<CurriculumGraph> => {
  const db = getDb()

  const [conceptRows, edgeRows] = await Promise.all([
    db
      .select({
        id: concepts.id,
        slug: concepts.slug,
        title: concepts.title,
        description: concepts.description,
        orderIndex: concepts.orderIndex,
        isActive: concepts.isActive,
      })
      .from(concepts)
      .where(eq(concepts.isActive, true))
      .orderBy(asc(concepts.orderIndex), asc(concepts.title)),
    db
      .select({
        conceptId: conceptPrerequisites.conceptId,
        prerequisiteId: conceptPrerequisites.prerequisiteId,
      })
      .from(conceptPrerequisites),
  ])

  return buildCurriculumGraph(conceptRows, edgeRows)
}

/** Request-scoped cache — avoids duplicate graph loads in one render. */
export const loadCurriculumGraph = cache(loadCurriculumGraphUncached)

export const buildCurriculumGraph = (
  conceptRows: ConceptNode[],
  edgeRows: PrerequisiteEdge[]
): CurriculumGraph => {
  const conceptById = new Map(conceptRows.map((row) => [row.id, row]))
  const conceptBySlug = new Map(conceptRows.map((row) => [row.slug, row]))
  const prerequisitesByConceptId = new Map<string, string[]>()

  for (const edge of edgeRows) {
    if (!conceptById.has(edge.conceptId) || !conceptById.has(edge.prerequisiteId)) {
      continue
    }
    const list = prerequisitesByConceptId.get(edge.conceptId) ?? []
    list.push(edge.prerequisiteId)
    prerequisitesByConceptId.set(edge.conceptId, list)
  }

  return {
    concepts: conceptRows,
    prerequisitesByConceptId,
    conceptById,
    conceptBySlug,
  }
}

/** Detect cycles in the prerequisite graph (should be empty for a valid seed). */
export const findPrerequisiteCycles = (graph: CurriculumGraph): string[][] => {
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const cycles: string[][] = []

  const visit = (conceptId: string, path: string[]) => {
    if (visiting.has(conceptId)) {
      const start = path.indexOf(conceptId)
      cycles.push(path.slice(start).concat(conceptId))
      return
    }
    if (visited.has(conceptId)) {
      return
    }

    visiting.add(conceptId)
    const prereqs = graph.prerequisitesByConceptId.get(conceptId) ?? []
    for (const prereqId of prereqs) {
      visit(prereqId, path.concat(conceptId))
    }
    visiting.delete(conceptId)
    visited.add(conceptId)
  }

  for (const concept of graph.concepts) {
    visit(concept.id, [])
  }

  return cycles
}
