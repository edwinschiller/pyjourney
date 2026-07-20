import {
  isConceptUnlocked,
  loadCurriculumGraph,
  type MasteryScoreMap,
} from "@/lib/curriculum"
import { NEXT_CONCEPT_DONE_SCORE } from "@/lib/curriculum/next-concept"
import { hasPyjoLessonForSlug } from "@/lib/pyjo/director"

export type PathNodeStatus =
  | "locked"
  | "available"
  | "active"
  | "completed"
  | "soon"

export type LearningPathNode = {
  conceptId: string
  slug: string
  title: string
  description: string
  orderIndex: number
  status: PathNodeStatus
  masteryScore: number
  hasTemplate: boolean
  activeLessonId: string | null
}

export const buildLearningPath = async (input: {
  masteryByConceptId: MasteryScoreMap
  activeLessonByConceptId: Map<string, string>
  completedConceptIds: Set<string>
  nextConceptId: string | null
}) => {
  const graph = await loadCurriculumGraph()
  const nodes: LearningPathNode[] = graph.concepts.map((concept) => {
    const masteryScore = input.masteryByConceptId.get(concept.id) ?? 0
    const unlocked = isConceptUnlocked(
      graph,
      concept.id,
      input.masteryByConceptId
    )
    const hasTemplate = hasPyjoLessonForSlug(concept.slug)
    const completed =
      input.completedConceptIds.has(concept.id) ||
      masteryScore >= NEXT_CONCEPT_DONE_SCORE
    const isNext = input.nextConceptId === concept.id

    let status: PathNodeStatus
    if (!unlocked) status = "locked"
    else if (!hasTemplate) status = "soon"
    else if (completed && !isNext) status = "completed"
    else if (isNext) status = "active"
    else status = "available"

    return {
      conceptId: concept.id,
      slug: concept.slug,
      title: concept.title,
      description: concept.description,
      orderIndex: concept.orderIndex,
      status,
      masteryScore,
      hasTemplate,
      activeLessonId: input.activeLessonByConceptId.get(concept.id) ?? null,
    }
  })

  return {
    nodes,
    completedCount: nodes.filter((node) => node.status === "completed").length,
    totalCount: nodes.length,
  }
}
