"use client"

import { Download, FolderOpen, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useState, useTransition } from "react"

import { PythonRunner } from "@/components/editor/python-runner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  downloadTextFile,
  saveProgramAction,
  slugifyFilename,
  type ProgramActionState,
} from "@/lib/programs"

const DEFAULT_CODE = `# Free practice in PyJourney
name = "PyJourney"
print(f"Hello from {name}!")

total = sum(range(1, 6))
print("1+2+3+4+5 =", total)
`

type FreeCodingWorkspaceProps = {
  initialProgramId?: string | null
  initialTitle?: string
  initialCode?: string
}

const initialSaveState: ProgramActionState = null

export const FreeCodingWorkspace = ({
  initialProgramId = null,
  initialTitle = "Untitled program",
  initialCode = DEFAULT_CODE,
}: FreeCodingWorkspaceProps) => {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [programId, setProgramId] = useState<string | null>(initialProgramId)
  const [title, setTitle] = useState(initialTitle)
  const [code, setCode] = useState(initialCode)
  const [baseline, setBaseline] = useState({
    title: initialTitle,
    code: initialCode,
  })
  const [feedback, setFeedback] = useState<string | null>(null)

  const saveWithClientSide = async (
    prev: ProgramActionState,
    formData: FormData
  ): Promise<ProgramActionState> => {
    const result = await saveProgramAction(prev, formData)
    if (result?.ok && result.programId) {
      const nextTitle = String(formData.get("title") ?? "").trim() || "Untitled program"
      const nextCode = String(formData.get("code") ?? "")
      setProgramId(result.programId)
      setBaseline({ title: nextTitle, code: nextCode })
      setFeedback(result.message ?? "Program saved.")
      if (result.programId !== initialProgramId) {
        startTransition(() => {
          router.replace(`/student/code?program=${result.programId}`)
        })
      }
    } else if (result?.error) {
      setFeedback(null)
    }
    return result
  }

  const [saveState, saveAction, savePending] = useActionState(
    saveWithClientSide,
    initialSaveState
  )

  const isDirty =
    title.trim() !== baseline.title.trim() || code !== baseline.code

  const handleDownload = () => {
    downloadTextFile(code, `${slugifyFilename(title)}.py`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="shrink-0">
        <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
          Free practice
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Python IDE
        </h1>
        <p className="mt-1 text-sm text-[var(--app-muted)]">
          Write, run, save, and download programs. Runtime runs in a Web Worker.
        </p>
      </header>

      <PythonRunner
        fillHeight
        code={code}
        onCodeChange={setCode}
        toolbarLeading={
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            aria-label="Program title"
            className="max-w-xs border-transparent bg-transparent px-1 text-sm font-semibold shadow-none focus-visible:border-[var(--app-border)]"
            placeholder="Program title"
          />
        }
        toolbarExtra={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/student/programs" aria-label="Open programs list">
                <FolderOpen />
                Programs
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={handleDownload}
              aria-label="Download program as Python file"
            >
              <Download />
              Download
            </Button>
            <form action={saveAction}>
              <input type="hidden" name="programId" value={programId ?? ""} />
              <input type="hidden" name="title" value={title} />
              <input type="hidden" name="code" value={code} />
              <Button
                size="sm"
                type="submit"
                disabled={savePending || (!isDirty && Boolean(programId))}
                aria-label="Save program"
              >
                {savePending ? <Loader2 className="animate-spin" /> : <Save />}
                Save
              </Button>
            </form>
          </>
        }
      />

      {saveState?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {saveState.error}
        </p>
      ) : null}
      {feedback && !saveState?.error ? (
        <p className="text-sm text-[var(--brand-blue)]" role="status">
          {feedback}
          {!isDirty ? " · up to date" : ""}
        </p>
      ) : null}
    </div>
  )
}
