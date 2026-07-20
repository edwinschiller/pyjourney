import {
  isConceptUnlocked,
  loadCurriculumGraph,
  type MasteryScoreMap,
} from "@/lib/curriculum"
import { hasTemplateLessonForSlug } from "@/lib/lessons/templates/variables"
import { NEXT_CONCEPT_DONE_SCORE } from "@/lib/curriculum/next-concept"

export type PathNodeStatus = "locked" | "available" | "active" | "completed" | "soon"

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

export type LearningPathModel = {
  nodes: LearningPathNode[]
  completedCount: number
  totalCount: number
  activeConceptId: string | null
}

type BuildPathInput = {
  masteryByConceptId: MasteryScoreMap
  /** conceptId -> latest active lesson id */
  activeLessonByConceptId: Map<string, string>
  /** conceptIds with at least one completed lesson */
  completedConceptIds: Set<string>
  nextConceptId: string | null
}

export const buildLearningPath = async (
  input: BuildPathInput
): Promise<LearningPathModel> => {
  const graph = await loadCurriculumGraph()
  const nodes: LearningPathNode[] = graph.concepts.map((concept) => {
    const masteryScore = input.masteryByConceptId.get(concept.id) ?? 0
    const unlocked = isConceptUnlocked(
      graph,
      concept.id,
      input.masteryByConceptId
    )
    const hasTemplate = hasTemplateLessonForSlug(concept.slug)
    const completed =
      input.completedConceptIds.has(concept.id) ||
      masteryScore >= NEXT_CONCEPT_DONE_SCORE
    const isNext = input.nextConceptId === concept.id

    let status: PathNodeStatus
    if (!unlocked) {
      status = "locked"
    } else if (!hasTemplate) {
      status = "soon"
    } else if (completed && !isNext) {
      status = "completed"
    } else if (isNext) {
      status = "active"
    } else {
      status = "available"
    }

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

  const completedCount = nodes.filter(
    (node) => node.status === "completed"
  ).length

  return {
    nodes,
    completedCount,
    totalCount: nodes.length,
    activeConceptId: input.nextConceptId,
  }
}
