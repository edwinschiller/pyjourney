"use client"

import { Loader2, Play, Square } from "lucide-react"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"

import { PythonEditor } from "@/components/editor/python-editor"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_RUN_TIMEOUT_MS,
  getPyodideClient,
  type PythonRunResult,
} from "@/lib/pyodide"
import { cn } from "@/lib/utils"

const DEFAULT_CODE = `# Try Python in the browser
name = "PyJourney"
print(f"Hello from {name}!")

total = sum(range(1, 6))
print("1+2+3+4+5 =", total)
`

type PythonWorkspaceProps = {
  initialCode?: string
  className?: string
  title?: string
  description?: string
}

export const PythonWorkspace = ({
  initialCode = DEFAULT_CODE,
  className,
  title = "Python workspace",
  description = "Write code, press Run, and see output from the Pyodide worker.",
}: PythonWorkspaceProps) => {
  const [code, setCode] = useState(initialCode)
  const [stdout, setStdout] = useState("")
  const [stderr, setStderr] = useState("")
  const [status, setStatus] = useState<
    "idle" | "loading" | "running" | "ready"
  >("loading")
  const [lastResult, setLastResult] = useState<PythonRunResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const clientRef = useRef(getPyodideClient())

  useEffect(() => {
    let cancelled = false
    void clientRef.current
      .ensureReady()
      .then(() => {
        if (!cancelled) {
          setStatus("ready")
          setError(null)
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setStatus("idle")
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the Python runtime."
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const isBusy = status === "loading" || status === "running"
  const outputEmpty = !stdout && !stderr

  const statusLabel = useMemo(() => {
    if (status === "loading") return "Loading Python runtime…"
    if (status === "running") return "Running…"
    if (status === "ready") return "Ready"
    return "Idle"
  }, [status])

  const handleRun = async () => {
    setError(null)
    setStdout("")
    setStderr("")
    setLastResult(null)
    setStatus("running")

    try {
      const result = await clientRef.current.run(code, {
        timeoutMs: DEFAULT_RUN_TIMEOUT_MS,
        onStdout: (text) => setStdout((current) => current + text),
        onStderr: (text) => setStderr((current) => current + text),
      })
      setLastResult(result)
      if (result.stdout) {
        setStdout(result.stdout)
      }
      if (result.stderr) {
        setStderr(result.stderr)
      }
      if (!result.ok && result.error && !result.stderr) {
        setStderr(`${result.error}\n`)
      }
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "Python execution failed."
      )
    } finally {
      setStatus("ready")
    }
  }

  const handleStop = () => {
    clientRef.current.stop()
    setStatus("ready")
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      if (!isBusy) {
        void handleRun()
      }
    }
  }

  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col gap-4", className)}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[var(--app-muted)]">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[var(--app-muted)]">
            {statusLabel}
            {lastResult ? ` · ${lastResult.runtimeMs}ms` : ""}
          </span>
          {status === "running" ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleStop}
              aria-label="Stop Python execution"
            >
              <Square />
              Stop
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handleRun()}
              disabled={status === "loading"}
              aria-label="Run Python code"
            >
              {status === "loading" ? <Loader2 className="animate-spin" /> : <Play />}
              Run
            </Button>
          )}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <PythonEditor
          value={code}
          onChange={setCode}
          className="min-h-[360px] lg:min-h-0 lg:h-full"
        />

        <div className="app-surface flex min-h-[220px] flex-col overflow-hidden rounded-xl lg:min-h-0">
          <div className="border-b border-[var(--app-border)] px-4 py-2 text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            Output
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4 font-mono text-sm">
            {error ? (
              <p className="whitespace-pre-wrap text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {outputEmpty && !error ? (
              <p className="text-[var(--app-muted)]">
                Output appears here after you run your code. Shortcut: Ctrl/Cmd
                + Enter.
              </p>
            ) : null}
            {stdout ? (
              <pre className="whitespace-pre-wrap text-[var(--app-fg)]">{stdout}</pre>
            ) : null}
            {stderr ? (
              <pre
                className="mt-3 whitespace-pre-wrap text-destructive"
                role="alert"
              >
                {stderr}
              </pre>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
