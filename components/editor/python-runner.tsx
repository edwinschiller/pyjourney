"use client"

import { Loader2, Play, RotateCcw, Square, TerminalSquare } from "lucide-react"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"

import { PythonEditor } from "@/components/editor/python-editor"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_RUN_TIMEOUT_MS,
  getPyodideClient,
  type PythonRunResult,
} from "@/lib/pyodide"
import { cn } from "@/lib/utils"

type PythonRunnerProps = {
  code: string
  onCodeChange: (code: string) => void
  toolbarLeading?: ReactNode
  toolbarExtra?: ReactNode
  fillHeight?: boolean
  className?: string
}

export const PythonRunner = ({
  code,
  onCodeChange,
  toolbarLeading,
  toolbarExtra,
  fillHeight = true,
  className,
}: PythonRunnerProps) => {
  const [stdout, setStdout] = useState("")
  const [stderr, setStderr] = useState("")
  const [status, setStatus] = useState<
    "idle" | "loading" | "running" | "ready"
  >("loading")
  const [lastResult, setLastResult] = useState<PythonRunResult | null>(null)
  const [engineError, setEngineError] = useState<string | null>(null)
  const clientRef = useRef(getPyodideClient())
  const terminalRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    let cancelled = false
    void clientRef.current
      .ensureReady()
      .then(() => {
        if (!cancelled) {
          setStatus("ready")
          setEngineError(null)
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setStatus("idle")
          setEngineError(
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

  useEffect(() => {
    terminalRef.current?.scrollTo({
      top: terminalRef.current.scrollHeight,
    })
  }, [stdout, stderr, engineError])

  const isBusy = status === "loading" || status === "running"

  const statusLabel = useMemo(() => {
    if (status === "loading") return "Loading runtime…"
    if (status === "running") return "Running…"
    if (lastResult) return `${lastResult.runtimeMs}ms`
    if (status === "ready") return "Ready"
    return "Idle"
  }, [status, lastResult])

  const handleRun = async () => {
    setEngineError(null)
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
      setEngineError(
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

  const handleClear = () => {
    onCodeChange("")
    setStdout("")
    setStderr("")
    setLastResult(null)
    setEngineError(null)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      if (!isBusy) {
        void handleRun()
      }
    }
  }

  const terminalContent = (() => {
    if (engineError) {
      return <span className="text-destructive">{engineError}</span>
    }
    if (stderr) {
      return (
        <>
          {stdout ? (
            <span className="text-[var(--app-fg)]">{stdout}</span>
          ) : null}
          <span className="text-destructive">{stderr}</span>
        </>
      )
    }
    if (stdout) {
      return <span className="text-[var(--app-fg)]">{stdout}</span>
    }
    return (
      <span className="text-[var(--app-muted)]">
        Ready — write code and click Run. Shortcut: Ctrl/Cmd + Enter.
      </span>
    )
  })()

  return (
    <div
      className={cn(
        fillHeight
          ? "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]"
          : "app-surface overflow-hidden rounded-2xl",
        className
      )}
      onKeyDown={handleKeyDown}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--app-border)] px-4 py-3">
        <div className="min-w-0 flex-1">
          {toolbarLeading ?? (
            <span className="text-sm font-semibold text-[var(--app-fg)]">
              Editor
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="hidden text-xs text-[var(--app-muted)] sm:inline">
            {statusLabel}
          </span>
          {toolbarExtra}
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={handleClear}
            aria-label="Clear editor"
          >
            <RotateCcw />
            Clear
          </Button>
          {status === "running" ? (
            <Button
              size="sm"
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
              size="sm"
              type="button"
              onClick={() => void handleRun()}
              disabled={status === "loading"}
              aria-label="Run Python code"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Play />
              )}
              Run
            </Button>
          )}
        </div>
      </div>

      <div
        className={
          fillHeight
            ? "flex min-h-0 flex-1 flex-col p-3 pt-0"
            : "p-3 pt-0"
        }
      >
        <div
          className={
            fillHeight
              ? "grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-xl border border-[var(--app-border)]"
              : "overflow-hidden rounded-xl border border-[var(--app-border)]"
          }
        >
          <PythonEditor
            value={code}
            onChange={onCodeChange}
            className={
              fillHeight
                ? "min-h-0 rounded-none border-0"
                : "min-h-[280px] rounded-none border-0"
            }
          />
          <div className="shrink-0 border-t border-[var(--app-border)] bg-[var(--app-bg)]/80">
            <div className="flex items-center gap-2 border-b border-[var(--app-border)] px-3 py-1.5">
              <TerminalSquare className="size-3.5 text-[var(--app-muted)]" />
              <span className="text-[10px] font-semibold tracking-wider text-[var(--app-muted)] uppercase">
                Terminal
              </span>
            </div>
            <pre
              ref={terminalRef}
              className={
                fillHeight
                  ? "max-h-[min(32vh,280px)] min-h-[120px] overflow-auto px-3 py-2 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap"
                  : "max-h-[160px] min-h-[88px] overflow-auto px-3 py-2 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap"
              }
            >
              {terminalContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
