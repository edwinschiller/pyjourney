import { notFound } from "next/navigation"

import { LessonPlayer } from "@/components/lessons/player/lesson-player"
import { requireStudentWithOnboarding } from "@/lib/auth/session"
import { getLessonForStudent } from "@/lib/lessons/queries"

export const dynamic = "force-dynamic"

type LessonPageProps = {
  params: Promise<{ lessonId: string }>
}

const StudentLessonPage = async ({ params }: LessonPageProps) => {
  const user = await requireStudentWithOnboarding()
  const { lessonId } = await params
  const lesson = await getLessonForStudent(lessonId, user.id)

  if (!lesson) {
    notFound()
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col p-4 md:p-6">
      <LessonPlayer
        lessonId={lesson.id}
        conceptTitle={lesson.conceptTitle}
        initialSession={lesson.content}
        status={lesson.status}
      />
    </div>
  )
}

export default StudentLessonPage
