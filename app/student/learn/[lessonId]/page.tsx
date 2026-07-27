import Link from "next/link"
import { redirect } from "next/navigation"
import { and, eq } from "drizzle-orm"

import { LessonPlayer } from "@/components/lessons/player/lesson-player"
import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth/session"
import { getDb } from "@/lib/db"
import { lessons } from "@/lib/db/schema"
import { startLessonForConceptAction } from "@/lib/lessons/actions"
import { getLessonForStudent } from "@/lib/lessons/queries"

export const dynamic = "force-dynamic"

type LessonPageProps = {
  params: Promise<{ lessonId: string }>
}

const StudentLessonPage = async ({ params }: LessonPageProps) => {
  const user = await requireRole(["student"])
  const { lessonId } = await params
  const lesson = await getLessonForStudent(lessonId, user.id)

  if (lesson) {
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

  const db = getDb()
  const orphan = await db
    .select({ conceptId: lessons.conceptId })
    .from(lessons)
    .where(and(eq(lessons.id, lessonId), eq(lessons.studentId, user.id)))
    .limit(1)

  if (orphan[0]?.conceptId) {
    const started = await startLessonForConceptAction(orphan[0].conceptId)
    if (started?.ok && started.redirectTo) {
      redirect(started.redirectTo)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
        Lesson not found
      </h1>
      <p className="text-sm text-[var(--app-muted)]">
        Open Variables again from your path — a fresh session will start.
      </p>
      <Button asChild>
        <Link href="/student/learn">Back to path</Link>
      </Button>
    </div>
  )
}

export default StudentLessonPage
