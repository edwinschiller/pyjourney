import Link from "next/link"
import { notFound } from "next/navigation"

import { LessonWorkspace } from "@/components/lessons/lesson-workspace"
import { Button } from "@/components/ui/button"
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
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-3 md:px-6">
      <div className="shrink-0">
        <Button asChild variant="ghost" size="sm">
          <Link href="/student/learn" aria-label="Back to Learn hub">
            ← Learn
          </Link>
        </Button>
      </div>
      <LessonWorkspace
        lessonId={lesson.id}
        conceptTitle={lesson.conceptTitle}
        status={lesson.status}
        content={lesson.content}
      />
    </div>
  )
}

export default StudentLessonPage
