import { FreeCodingWorkspace } from "@/components/editor/free-coding-workspace"
import { requireRole } from "@/lib/auth/session"
import { getProgramForStudent } from "@/lib/programs"

export const dynamic = "force-dynamic"

type StudentCodePageProps = {
  searchParams: Promise<{ program?: string }>
}

const StudentCodePage = async ({ searchParams }: StudentCodePageProps) => {
  const user = await requireRole(["student"])
  const params = await searchParams
  const programId = params.program?.trim() || null

  const program = programId
    ? await getProgramForStudent(user.id, programId)
    : null

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col p-4 md:p-6">
      <FreeCodingWorkspace
        initialProgramId={program?.id ?? null}
        initialTitle={program?.title}
        initialCode={program?.code}
      />
    </div>
  )
}

export default StudentCodePage
