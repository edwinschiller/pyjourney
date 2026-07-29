"use client"

import { Download, FolderOpen, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"

import { AssistantShell } from "@/components/assistant/assistant-shell"
import { PythonRunner } from "@/components/editor/python-runner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCodeSnapshots } from "@/hooks/use-code-snapshots"
import {
  autosaveProgramAction,
  downloadTextFile,
  saveProgramAction,
  slugifyFilename,
  type ProgramActionState,
} from "@/lib/programs"

const DEFAULT_CODE = ""
const AUTOSAVE_INTERVAL_MS = 8_000

type FreeCodingWorkspaceProps = {
  initialProgramId?: string | null
  initialTitle?: string
  initialCode?: string
  aiConfigured?: boolean
}

const initialSaveState: ProgramActionState = null

export const FreeCodingWorkspace = ({
  initialProgramId = null,
  initialTitle = "Untitled program",
  initialCode = DEFAULT_CODE,
  aiConfigured = true,
}: FreeCodingWorkspaceProps) => {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [programId, setProgramId] = useState<string | null>(initialProgramId)
  const [title, setTitle] = useState(initialTitle)
  const [code, setCode] = useState(initialCode)
  const [terminal, setTerminal] = useState({ stdout: "", stderr: "" })
  const [baseline, setBaseline] = useState({
    title: initialTitle,
    code: initialCode,
  })
  const [feedback, setFeedback] = useState<string | null>(null)

  const programIdRef = useRef(programId)
  const titleRef = useRef(title)
  const codeRef = useRef(code)
  const baselineRef = useRef(baseline)
  const savingRef = useRef(false)

  useEffect(() => {
    programIdRef.current = programId
  }, [programId])
  useEffect(() => {
    titleRef.current = title
  }, [title])
  useEffect(() => {
    codeRef.current = code
  }, [code])
  useEffect(() => {
    baselineRef.current = baseline
  }, [baseline])

  useCodeSnapshots({
    mode: "free",
    code,
    stdout: terminal.stdout,
    stderr: terminal.stderr || null,
    learningObjective: "Free practice in the Python IDE",
  })

  const isDirty =
    title.trim() !== baseline.title.trim() || code !== baseline.code

  const applySaveResult = (
    result: ProgramActionState,
    savedTitle: string,
    savedCode: string,
    options?: { silent?: boolean; replaceUrl?: boolean }
  ) => {
    if (!result?.ok || !result.programId) {
      return false
    }

    const previousId = programIdRef.current
    setProgramId(result.programId)
    setBaseline({ title: savedTitle, code: savedCode })
    if (!options?.silent) {
      setFeedback(result.message ?? "Program saved.")
    }
    if (
      options?.replaceUrl !== false &&
      result.programId !== previousId &&
      result.programId !== initialProgramId
    ) {
      startTransition(() => {
        router.replace(`/student/code?program=${result.programId}`)
      })
    }
    return true
  }

  const flushAutosave = async (options?: {
    keepalive?: boolean
    silent?: boolean
    replaceUrl?: boolean
  }) => {
    const currentTitle = titleRef.current
    const currentCode = codeRef.current
    const currentBaseline = baselineRef.current
    const currentProgramId = programIdRef.current
    const dirty =
      currentTitle.trim() !== currentBaseline.title.trim() ||
      currentCode !== currentBaseline.code

    if (!dirty || savingRef.current) {
      return false
    }

    // Skip brand-new empty scratch pads with default title.
    if (
      !currentProgramId &&
      !currentCode.trim() &&
      currentTitle.trim() === "Untitled program"
    ) {
      return false
    }

    savingRef.current = true
    const payload = {
      programId: currentProgramId,
      title: currentTitle.trim() || "Untitled program",
      code: currentCode,
    }

    try {
      if (options?.keepalive) {
        const body = JSON.stringify(payload)
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([body], { type: "application/json" })
          return navigator.sendBeacon("/api/programs/autosave", blob)
        }
        void fetch("/api/programs/autosave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
          credentials: "same-origin",
        })
        return true
      }

      const result = await autosaveProgramAction(payload)
      return applySaveResult(result, payload.title, payload.code, {
        silent: options?.silent ?? true,
        replaceUrl: options?.replaceUrl,
      })
    } catch {
      return false
    } finally {
      savingRef.current = false
    }
  }

  useEffect(() => {
    const handleHidden = () => {
      if (document.visibilityState === "hidden") {
        void flushAutosave({ silent: true, replaceUrl: false })
      }
    }
    const handlePageHide = () => {
      void flushAutosave({ keepalive: true, silent: true, replaceUrl: false })
    }

    document.addEventListener("visibilitychange", handleHidden)
    window.addEventListener("pagehide", handlePageHide)
    return () => {
      document.removeEventListener("visibilitychange", handleHidden)
      window.removeEventListener("pagehide", handlePageHide)
      void flushAutosave({ silent: true, replaceUrl: false })
    }
    // Intentionally once — flushAutosave reads latest via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isDirty) return
    const timer = window.setInterval(() => {
      void flushAutosave({ silent: true, replaceUrl: true })
    }, AUTOSAVE_INTERVAL_MS)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])

  const saveWithClientSide = async (
    prev: ProgramActionState,
    formData: FormData
  ): Promise<ProgramActionState> => {
    const result = await saveProgramAction(prev, formData)
    if (result?.ok && result.programId) {
      const nextTitle =
        String(formData.get("title") ?? "").trim() || "Untitled program"
      const nextCode = String(formData.get("code") ?? "")
      applySaveResult(result, nextTitle, nextCode)
    } else if (result?.error) {
      setFeedback(null)
    }
    return result
  }

  const [saveState, saveAction, savePending] = useActionState(
    saveWithClientSide,
    initialSaveState
  )

  const handleDownload = () => {
    downloadTextFile(code, `${slugifyFilename(title)}.py`)
  }

  return (
    <AssistantShell
      contentLayout="full"
      contextLabel={title.trim() || "Python IDE"}
      studentCode={code}
      aiConfigured={aiConfigured}
      context={{
        scope: "ide",
        programTitle: title,
        programId,
        lineCount: code.split("\n").length,
        terminalOutput: terminal.stdout,
        terminalError: terminal.stderr || null,
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6">
        <header className="shrink-0">
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Free practice
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            Python IDE
          </h1>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Write, run, and download programs. Changes autosave when you leave
            or pause — you can still save manually anytime.
          </p>
        </header>

        <PythonRunner
          fillHeight
          code={code}
          onCodeChange={setCode}
          onTerminalChange={setTerminal}
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
                  {savePending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save />
                  )}
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
    </AssistantShell>
  )
}
