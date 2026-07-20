export type ConceptNode = {
  id: string
  slug: string
  title: string
  description: string
  orderIndex: number
  isActive: boolean
}

export type PrerequisiteEdge = {
  conceptId: string
  prerequisiteId: string
}

export type CurriculumGraph = {
  concepts: ConceptNode[]
  /** conceptId → prerequisite concept ids */
  prerequisitesByConceptId: Map<string, string[]>
  conceptById: Map<string, ConceptNode>
  conceptBySlug: Map<string, ConceptNode>
}
