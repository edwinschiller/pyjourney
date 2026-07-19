import { eq } from "drizzle-orm"

import { getDb } from "./index"
import { conceptPrerequisites, concepts } from "./schema"

type ConceptSeed = {
  slug: string
  title: string
  description: string
  orderIndex: number
}

const CONCEPT_SEEDS: ConceptSeed[] = [
  {
    slug: "variables",
    title: "Variables",
    description: "Store and reuse values with names.",
    orderIndex: 1,
  },
  {
    slug: "data_types",
    title: "Data types",
    description: "Work with numbers, strings, booleans, and None.",
    orderIndex: 2,
  },
  {
    slug: "conditions",
    title: "Conditions",
    description: "Branch with if, elif, and else.",
    orderIndex: 3,
  },
  {
    slug: "loops",
    title: "Loops",
    description: "Repeat work with for and while.",
    orderIndex: 4,
  },
  {
    slug: "functions",
    title: "Functions",
    description: "Group logic into reusable callables.",
    orderIndex: 5,
  },
  {
    slug: "lists",
    title: "Lists",
    description: "Store ordered collections and iterate over them.",
    orderIndex: 6,
  },
  {
    slug: "debugging",
    title: "Debugging",
    description: "Read errors and fix broken programs systematically.",
    orderIndex: 7,
  },
]

/** prerequisiteSlug -> conceptSlug */
const PREREQUISITE_EDGES: Array<[string, string]> = [
  ["variables", "data_types"],
  ["data_types", "conditions"],
  ["conditions", "loops"],
  ["variables", "functions"],
  ["data_types", "lists"],
  ["conditions", "debugging"],
]

export const seedConcepts = async () => {
  const db = getDb()

  for (const seed of CONCEPT_SEEDS) {
    const existing = await db
      .select({ id: concepts.id })
      .from(concepts)
      .where(eq(concepts.slug, seed.slug))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(concepts)
        .set({
          title: seed.title,
          description: seed.description,
          orderIndex: seed.orderIndex,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(concepts.slug, seed.slug))
      continue
    }

    await db.insert(concepts).values({
      slug: seed.slug,
      title: seed.title,
      description: seed.description,
      orderIndex: seed.orderIndex,
      isActive: true,
    })
  }

  const rows = await db
    .select({ id: concepts.id, slug: concepts.slug })
    .from(concepts)
  const idBySlug = new Map(rows.map((row) => [row.slug, row.id]))

  for (const [prerequisiteSlug, conceptSlug] of PREREQUISITE_EDGES) {
    const prerequisiteId = idBySlug.get(prerequisiteSlug)
    const conceptId = idBySlug.get(conceptSlug)
    if (!prerequisiteId || !conceptId) {
      continue
    }

    await db
      .insert(conceptPrerequisites)
      .values({ conceptId, prerequisiteId })
      .onConflictDoNothing()
  }

  return {
    concepts: CONCEPT_SEEDS.length,
    prerequisites: PREREQUISITE_EDGES.length,
  }
}
