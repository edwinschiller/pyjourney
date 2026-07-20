/// <reference lib="webworker" />

import {
  MAX_OUTPUT_CHARS,
  PYODIDE_CDN,
  PYODIDE_MAX_EXECUTION_STEPS,
  type LessonTestResult,
  type LessonTestSpec,
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

const beginRequest = (requestId: string) => {
  activeRequestId = requestId
  if (interruptBuffer) {
    interruptBuffer[0] = 0
  }
}

const endRequest = (requestId: string) => {
  if (interruptBuffer) {
    interruptBuffer[0] = 0
  }
  if (activeRequestId === requestId) {
    activeRequestId = null
  }
}

const attachIo = (
  pyodide: PyodideRuntime,
  requestId: string,
  state: { stdout: string; stderr: string }
) => {
  pyodide.setStdout({
    batched: (text) => {
      state.stdout = appendCapped(state.stdout, text)
      post({ type: "stdout", requestId, text })
    },
  })
  pyodide.setStderr({
    batched: (text) => {
      state.stderr = appendCapped(state.stderr, text)
      post({ type: "stderr", requestId, text })
    },
  })
}

const runCode = async (
  requestId: string,
  code: string,
  maxSteps = PYODIDE_MAX_EXECUTION_STEPS
) => {
  beginRequest(requestId)
  const io = { stdout: "", stderr: "" }
  const started = performance.now()

  try {
    const pyodide = await ensurePyodide()
    attachIo(pyodide, requestId, io)

    const guarded = wrapPythonWithExecutionGuard(code, maxSteps)
    await pyodide.runPythonAsync(guarded)

    post({
      type: "result",
      requestId,
      ok: true,
      stdout: io.stdout,
      stderr: io.stderr,
      runtimeMs: Math.round(performance.now() - started),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Python execution failed."
    const interrupted =
      /KeyboardInterrupt/i.test(message) || interruptBuffer?.[0] === 2

    if (!io.stderr.includes(message)) {
      io.stderr = appendCapped(io.stderr, `${message}\n`)
    }

    post({
      type: "result",
      requestId,
      ok: false,
      stdout: io.stdout,
      stderr: io.stderr,
      runtimeMs: Math.round(performance.now() - started),
      error: interrupted ? "Execution interrupted." : message,
    })
  } finally {
    endRequest(requestId)
  }
}

const evaluateTests = async (
  pyodide: PyodideRuntime,
  stdout: string,
  tests: LessonTestSpec[]
): Promise<LessonTestResult[]> => {
  const results: LessonTestResult[] = []

  for (const test of tests) {
    if (test.expectsStdoutIncludes) {
      const passed = stdout.includes(test.expectsStdoutIncludes)
      results.push({
        id: test.id,
        description: test.description,
        passed,
        error: passed
          ? undefined
          : `Expected stdout to include ${JSON.stringify(test.expectsStdoutIncludes)}.`,
      })
      continue
    }

    try {
      const pieces = [test.setup?.trim(), test.assertion?.trim()].filter(
        Boolean
      )
      await pyodide.runPythonAsync(pieces.join("\n"))
      results.push({
        id: test.id,
        description: test.description,
        passed: true,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Assertion failed."
      results.push({
        id: test.id,
        description: test.description,
        passed: false,
        error: message,
      })
    }
  }

  return results
}

const runTests = async (
  requestId: string,
  code: string,
  tests: LessonTestSpec[],
  maxSteps = PYODIDE_MAX_EXECUTION_STEPS
) => {
  beginRequest(requestId)
  const io = { stdout: "", stderr: "" }
  const started = performance.now()

  try {
    const pyodide = await ensurePyodide()
    attachIo(pyodide, requestId, io)

    try {
      const guarded = wrapPythonWithExecutionGuard(code, maxSteps)
      await pyodide.runPythonAsync(guarded)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Python execution failed."
      const interrupted =
        /KeyboardInterrupt/i.test(message) || interruptBuffer?.[0] === 2

      if (!io.stderr.includes(message)) {
        io.stderr = appendCapped(io.stderr, `${message}\n`)
      }

      const results = tests.map((test) => ({
        id: test.id,
        description: test.description,
        passed: false,
        error: "Student code did not run successfully.",
      }))

      post({
        type: "testsResult",
        requestId,
        ok: false,
        stdout: io.stdout,
        stderr: io.stderr,
        runtimeMs: Math.round(performance.now() - started),
        error: interrupted ? "Execution interrupted." : message,
        results,
      })
      return
    }

    const results = await evaluateTests(pyodide, io.stdout, tests)
    const ok = results.every((result) => result.passed)

    post({
      type: "testsResult",
      requestId,
      ok,
      stdout: io.stdout,
      stderr: io.stderr,
      runtimeMs: Math.round(performance.now() - started),
      results,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Test harness failed."
    post({
      type: "testsResult",
      requestId,
      ok: false,
      stdout: io.stdout,
      stderr: io.stderr,
      runtimeMs: Math.round(performance.now() - started),
      error: message,
      results: tests.map((test) => ({
        id: test.id,
        description: test.description,
        passed: false,
        error: message,
      })),
    })
  } finally {
    endRequest(requestId)
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
    return
  }

  if (message.type === "runTests") {
    void runTests(
      message.requestId,
      message.code,
      message.tests,
      message.maxSteps
    )
  }
}
