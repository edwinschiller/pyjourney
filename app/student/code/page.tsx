import { PythonWorkspace } from "@/components/editor/python-workspace"
import { requireStudentWithOnboarding } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

const StudentCodePage = async () => {
  await requireStudentWithOnboarding()

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col p-4 md:p-6">
      <PythonWorkspace
        title="Free coding"
        description="Practice Python in the browser. Runtime runs in a Web Worker so the UI stays responsive."
      />
    </div>
  )
}

export default StudentCodePage
