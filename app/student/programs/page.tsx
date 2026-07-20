import Link from "next/link"

import { ProgramsList } from "@/components/programs/programs-list"
import { Button } from "@/components/ui/button"
import { requireStudentWithOnboarding } from "@/lib/auth/session"
import { listIdeProgramsForStudent } from "@/lib/programs"

export const dynamic = "force-dynamic"

const StudentProgramsPage = async () => {
  const user = await requireStudentWithOnboarding()
  const programs = await listIdeProgramsForStudent(user.id)

  const programItems = programs.map((program) => ({
    id: program.id,
    title: program.title,
    code: program.code,
    updatedLabel: new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(program.updatedAt),
  }))

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            Programs
          </h1>
          <p className="mt-2 text-base text-[var(--app-muted)]">
            Saved IDE programs you can open, download, or delete.
          </p>
        </div>
        <Button asChild>
          <Link href="/student/code" aria-label="Create a new program in the IDE">
            New program
          </Link>
        </Button>
      </header>

      <ProgramsList programs={programItems} />
    </div>
  )
}

export default StudentProgramsPage
