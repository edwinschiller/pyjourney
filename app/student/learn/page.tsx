import { LearningPath } from "@/components/lessons/path/learning-path"
import { requireStudentWithOnboarding } from "@/lib/auth/session"
import {
  loadCurriculumGraph,
  resolveNextConceptForStudent,
} from "@/lib/curriculum"
import { buildLearningPath } from "@/lib/lessons/path"
import {
  listActiveLessonsByConcept,
  listCompletedConceptIds,
} from "@/lib/lessons/queries"
import { getMasteryScoreMapForStudent } from "@/lib/mastery"

export const dynamic = "force-dynamic"

const StudentLearnPage = async () => {
  const user = await requireStudentWithOnboarding()
  const masteryMap = await getMasteryScoreMapForStudent(user.id)
  await loadCurriculumGraph()
  const next = await resolveNextConceptForStudent(user.id, masteryMap)
  const [activeByConcept, completedIds] = await Promise.all([
    listActiveLessonsByConcept(user.id),
    listCompletedConceptIds(user.id),
  ])

  const path = await buildLearningPath({
    masteryByConceptId: masteryMap,
    activeLessonByConceptId: activeByConcept,
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
