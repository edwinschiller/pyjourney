export const PYODIDE_VERSION = "0.29.4"
export const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
export const PYODIDE_MAX_EXECUTION_STEPS = 50_000
export const DEFAULT_RUN_TIMEOUT_MS = 8_000
export const MAX_OUTPUT_CHARS = 80_000

export type PyodideWorkerInboundMessage =
  | { type: "ping" }
  | {
      type: "run"
      requestId: string
      code: string
      maxSteps?: number
    }
  | { type: "interrupt" }

export type PyodideWorkerOutboundMessage =
  | { type: "ready" }
  | { type: "pong" }
  | {
      type: "stdout"
      requestId: string
      text: string
    }
  | {
      type: "stderr"
      requestId: string
      text: string
    }
  | {
      type: "result"
      requestId: string
      ok: boolean
      stdout: string
      stderr: string
      runtimeMs: number
      error?: string
    }
  | {
      type: "fatal"
      message: string
    }

export type PythonRunResult = {
  ok: boolean
  stdout: string
  stderr: string
  runtimeMs: number
  error?: string
  timedOut?: boolean
  interrupted?: boolean
}
