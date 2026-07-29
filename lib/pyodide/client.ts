import {
  DEFAULT_RUN_TIMEOUT_MS,
  type LessonTestSpec,
  type PyodideWorkerInboundMessage,
  type PyodideWorkerOutboundMessage,
  type PythonRunResult,
  type PythonTestsResult,
} from "./protocol"

type RunHandlers = {
  onStdout?: (text: string) => void
  onStderr?: (text: string) => void
}

type PendingRequest =
  | {
      kind: "run"
      resolve: (result: PythonRunResult) => void
      reject: (error: Error) => void
      onStdout?: (text: string) => void
      onStderr?: (text: string) => void
      timeoutId: number
    }
  | {
      kind: "tests"
      resolve: (result: PythonTestsResult) => void
      reject: (error: Error) => void
      onStdout?: (text: string) => void
      onStderr?: (text: string) => void
      timeoutId: number
    }

const createRequestId = () =>
  `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

export class PyodideClient {
  private worker: Worker | null = null
  private readyPromise: Promise<void> | null = null
  private pending = new Map<string, PendingRequest>()
  private generation = 0

  private createWorker() {
    return new Worker(new URL("../../workers/pyodide.worker.ts", import.meta.url))
  }

  private post(message: PyodideWorkerInboundMessage) {
    if (!this.worker) {
      throw new Error("Pyodide worker is not available.")
    }
    this.worker.postMessage(message)
  }

  private handleMessage = (event: MessageEvent<PyodideWorkerOutboundMessage>) => {
    const message = event.data

    if (message.type === "fatal") {
      for (const [, pending] of this.pending) {
        window.clearTimeout(pending.timeoutId)
        pending.reject(new Error(message.message))
      }
      this.pending.clear()
      return
    }

    if (message.type === "stdout") {
      this.pending.get(message.requestId)?.onStdout?.(message.text)
      return
    }

    if (message.type === "stderr") {
      this.pending.get(message.requestId)?.onStderr?.(message.text)
      return
    }

    if (message.type === "result") {
      const pending = this.pending.get(message.requestId)
      if (!pending || pending.kind !== "run") {
        return
      }
      window.clearTimeout(pending.timeoutId)
      this.pending.delete(message.requestId)
      pending.resolve({
        ok: message.ok,
        stdout: message.stdout,
        stderr: message.stderr,
        runtimeMs: message.runtimeMs,
        error: message.error,
        interrupted: message.error === "Execution interrupted.",
      })
      return
    }

    if (message.type === "testsResult") {
      const pending = this.pending.get(message.requestId)
      if (!pending || pending.kind !== "tests") {
        return
      }
      window.clearTimeout(pending.timeoutId)
      this.pending.delete(message.requestId)
      pending.resolve({
        ok: message.ok,
        stdout: message.stdout,
        stderr: message.stderr,
        runtimeMs: message.runtimeMs,
        error: message.error,
        interrupted: message.error === "Execution interrupted.",
        results: message.results,
      })
    }
  }

  ensureReady = async () => {
    if (this.readyPromise) {
      return this.readyPromise
    }

    this.readyPromise = new Promise<void>((resolve, reject) => {
      try {
        this.worker = this.createWorker()
      } catch (error) {
        this.readyPromise = null
        reject(
          error instanceof Error
            ? error
            : new Error("Could not start the Python worker.")
        )
        return
      }

      const onReady = (event: MessageEvent<PyodideWorkerOutboundMessage>) => {
        if (event.data.type === "ready") {
          this.worker?.removeEventListener("message", onReady)
          resolve()
        }
        if (event.data.type === "fatal") {
          this.worker?.removeEventListener("message", onReady)
          this.readyPromise = null
          reject(new Error(event.data.message))
        }
      }

      this.worker.addEventListener("message", onReady)
      this.worker.addEventListener("message", this.handleMessage)
      this.worker.addEventListener("error", (event) => {
        this.readyPromise = null
        reject(new Error(event.message || "Python worker crashed."))
      })

      this.post({ type: "ping" })
    })

    return this.readyPromise
  }

  private armTimeout = (
    requestId: string,
    timeoutMs: number,
    generationAtStart: number
  ) =>
    window.setTimeout(() => {
      const pending = this.pending.get(requestId)
      if (!pending) {
        return
      }
      this.pending.delete(requestId)
      this.interrupt()
      window.setTimeout(() => {
        if (this.generation === generationAtStart) {
          this.recycleWorker()
        }
      }, 400)

      const timedOut = {
        ok: false as const,
        stdout: "",
        stderr: `Execution timed out after ${timeoutMs}ms.\n`,
        runtimeMs: timeoutMs,
        error: `Execution timed out after ${timeoutMs}ms.`,
        timedOut: true as const,
      }

      if (pending.kind === "run") {
        pending.resolve(timedOut)
        return
      }

      pending.resolve({
        ...timedOut,
        results: [],
      })
    }, timeoutMs)

  run = async (
    code: string,
    options?: {
      timeoutMs?: number
      maxSteps?: number
      inputs?: string[]
    } & RunHandlers
  ): Promise<PythonRunResult> => {
    await this.ensureReady()
    const requestId = createRequestId()
    const timeoutMs = options?.timeoutMs ?? DEFAULT_RUN_TIMEOUT_MS
    const generationAtStart = this.generation

    return new Promise<PythonRunResult>((resolve, reject) => {
      const timeoutId = this.armTimeout(
        requestId,
        timeoutMs,
        generationAtStart
      )

      this.pending.set(requestId, {
        kind: "run",
        resolve,
        reject,
        onStdout: options?.onStdout,
        onStderr: options?.onStderr,
        timeoutId,
      })

      try {
        this.post({
          type: "run",
          requestId,
          code,
          maxSteps: options?.maxSteps,
          inputs: options?.inputs,
        })
      } catch (error) {
        window.clearTimeout(timeoutId)
        this.pending.delete(requestId)
        reject(
          error instanceof Error ? error : new Error("Failed to start Python run.")
        )
      }
    })
  }

  runTests = async (
    code: string,
    tests: LessonTestSpec[],
    options?: {
      timeoutMs?: number
      maxSteps?: number
      inputs?: string[]
    } & RunHandlers
  ): Promise<PythonTestsResult> => {
    await this.ensureReady()
    const requestId = createRequestId()
    const timeoutMs = options?.timeoutMs ?? DEFAULT_RUN_TIMEOUT_MS
    const generationAtStart = this.generation

    return new Promise<PythonTestsResult>((resolve, reject) => {
      const timeoutId = this.armTimeout(
        requestId,
        timeoutMs,
        generationAtStart
      )

      this.pending.set(requestId, {
        kind: "tests",
        resolve,
        reject,
        onStdout: options?.onStdout,
        onStderr: options?.onStderr,
        timeoutId,
      })

      try {
        this.post({
          type: "runTests",
          requestId,
          code,
          tests,
          maxSteps: options?.maxSteps,
          inputs: options?.inputs,
        })
      } catch (error) {
        window.clearTimeout(timeoutId)
        this.pending.delete(requestId)
        reject(
          error instanceof Error
            ? error
            : new Error("Failed to start Python tests.")
        )
      }
    })
  }

  interrupt = () => {
    try {
      this.post({ type: "interrupt" })
    } catch {
      this.recycleWorker()
    }
  }

  stop = () => {
    for (const [, pending] of this.pending) {
      window.clearTimeout(pending.timeoutId)
      if (pending.kind === "run") {
        pending.resolve({
          ok: false,
          stdout: "",
          stderr: "Execution stopped.\n",
          runtimeMs: 0,
          error: "Execution stopped.",
          interrupted: true,
        })
      } else {
        pending.resolve({
          ok: false,
          stdout: "",
          stderr: "Execution stopped.\n",
          runtimeMs: 0,
          error: "Execution stopped.",
          interrupted: true,
          results: [],
        })
      }
    }
    this.pending.clear()
    this.interrupt()
    this.recycleWorker()
  }

  private recycleWorker = () => {
    this.generation += 1
    if (this.worker) {
      this.worker.removeEventListener("message", this.handleMessage)
      this.worker.terminate()
      this.worker = null
    }
    this.readyPromise = null
  }

  dispose = () => {
    this.stop()
  }
}

let sharedClient: PyodideClient | null = null

export const getPyodideClient = () => {
  if (!sharedClient) {
    sharedClient = new PyodideClient()
  }
  return sharedClient
}
