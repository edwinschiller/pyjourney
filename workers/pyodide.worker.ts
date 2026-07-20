/// <reference lib="webworker" />

import {
  MAX_OUTPUT_CHARS,
  PYODIDE_CDN,
  PYODIDE_MAX_EXECUTION_STEPS,
  type PyodideWorkerInboundMessage,
  type PyodideWorkerOutboundMessage,
} from "@/lib/pyodide/protocol"
import { wrapPythonWithExecutionGuard } from "@/lib/pyodide/run-guard"

declare const loadPyodide: (config?: {
  indexURL?: string
}) => Promise<{
  setStdout: (opts: { batched: (text: string) => void }) => void
  setStderr: (opts: { batched: (text: string) => void }) => void
  setInterruptBuffer?: (buffer: Uint8Array) => void
  runPythonAsync: (code: string) => Promise<unknown>
}>

type PyodideRuntime = Awaited<ReturnType<typeof loadPyodide>>

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope

let pyodidePromise: Promise<PyodideRuntime> | null = null
let interruptBuffer: Uint8Array | null = null
let activeRequestId: string | null = null

const post = (message: PyodideWorkerOutboundMessage) => {
  ctx.postMessage(message)
}

const appendCapped = (current: string, next: string) => {
  const combined = current + next
  if (combined.length <= MAX_OUTPUT_CHARS) {
    return combined
  }
  return combined.slice(combined.length - MAX_OUTPUT_CHARS)
}

const createInterruptBuffer = () => {
  try {
    return new Uint8Array(new SharedArrayBuffer(1))
  } catch {
    return new Uint8Array(1)
  }
}

const ensurePyodide = () => {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      importScripts(`${PYODIDE_CDN}pyodide.js`)
      if (typeof loadPyodide !== "function") {
        throw new Error("loadPyodide is unavailable after script load.")
      }
      const runtime = await loadPyodide({ indexURL: PYODIDE_CDN })
      interruptBuffer = createInterruptBuffer()
      runtime.setInterruptBuffer?.(interruptBuffer)
      return runtime
    })()
  }
  return pyodidePromise
}

const runCode = async (
  requestId: string,
  code: string,
  maxSteps = PYODIDE_MAX_EXECUTION_STEPS
) => {
  activeRequestId = requestId
  if (interruptBuffer) {
    interruptBuffer[0] = 0
  }

  let stdout = ""
  let stderr = ""
  const started = performance.now()

  try {
    const pyodide = await ensurePyodide()

    pyodide.setStdout({
      batched: (text) => {
        stdout = appendCapped(stdout, text)
        post({ type: "stdout", requestId, text })
      },
    })
    pyodide.setStderr({
      batched: (text) => {
        stderr = appendCapped(stderr, text)
        post({ type: "stderr", requestId, text })
      },
    })

    const guarded = wrapPythonWithExecutionGuard(code, maxSteps)
    await pyodide.runPythonAsync(guarded)

    post({
      type: "result",
      requestId,
      ok: true,
      stdout,
      stderr,
      runtimeMs: Math.round(performance.now() - started),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Python execution failed."
    const interrupted =
      /KeyboardInterrupt/i.test(message) || interruptBuffer?.[0] === 2

    if (!stderr.includes(message)) {
      stderr = appendCapped(stderr, `${message}\n`)
    }

    post({
      type: "result",
      requestId,
      ok: false,
      stdout,
      stderr,
      runtimeMs: Math.round(performance.now() - started),
      error: interrupted ? "Execution interrupted." : message,
    })
  } finally {
    if (interruptBuffer) {
      interruptBuffer[0] = 0
    }
    if (activeRequestId === requestId) {
      activeRequestId = null
    }
  }
}

ctx.onmessage = (event: MessageEvent<PyodideWorkerInboundMessage>) => {
  const message = event.data

  if (message.type === "ping") {
    void ensurePyodide()
      .then(() => post({ type: "ready" }))
      .catch((error) => {
        post({
          type: "fatal",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load Pyodide runtime.",
        })
      })
    return
  }

  if (message.type === "interrupt") {
    if (interruptBuffer) {
      interruptBuffer[0] = 2
    }
    return
  }

  if (message.type === "run") {
    void runCode(message.requestId, message.code, message.maxSteps)
  }
}
