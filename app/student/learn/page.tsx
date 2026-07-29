import { LearningPath } from "@/components/lessons/path/learning-path"
import { requireRole } from "@/lib/auth/session"
import { resolveNextConceptForStudent } from "@/lib/curriculum"
import { buildLearningPath } from "@/lib/lessons/path"
import {
  listActiveLessonsByConcept,
  listCompletedConceptIds,
} from "@/lib/lessons/queries"
import { getMasteryScoreMapForStudent } from "@/lib/mastery"

export const dynamic = "force-dynamic"

const StudentLearnPage = async () => {
  const user = await requireRole(["student"])
  const masteryMap = await getMasteryScoreMapForStudent(user.id)
  const [activeLessons, completedIds] = await Promise.all([
    listActiveLessonsByConcept(user.id),
    listCompletedConceptIds(user.id),
  ])
  const next = await resolveNextConceptForStudent(user.id, masteryMap, {
    completedConceptIds: completedIds,
  })

  const path = await buildLearningPath({
    masteryByConceptId: masteryMap,
    activeLessonByConceptId: activeLessons.byConceptId,
    topicProgressByConceptId: activeLessons.topicProgressByConcept,
    completedConceptIds: completedIds,
    nextConceptId: next?.concept.id ?? null,
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <LearningPath
        nodes={path.nodes}
        completedCount={path.completedCount}
        totalCount={path.totalCount}
      />
    </div>
  )
}

export default StudentLearnPage
