"use client"

import { useEffect, useEffectEvent, useRef } from "react"

import { SNAPSHOT_INTERVAL_MS } from "@/lib/coding/constants"

type UseCodeSnapshotsOptions = {
  enabled?: boolean
  mode: "lesson" | "free"
  lessonId?: string | null
  conceptId?: string | null
  code: string
  stdout?: string
  stderr?: string | null
  hintCount?: number
  learningObjective?: string | null
}

/**
 * Starts/reuses a coding session and posts a snapshot every 15s
 * only when the editor code changed since the last successful snapshot.
 */
export const useCodeSnapshots = ({
  enabled = true,
  mode,
  lessonId = null,
  conceptId = null,
  code,
  stdout = "",
  stderr = null,
  hintCount = 0,
  learningObjective = null,
}: UseCodeSnapshotsOptions) => {
  const sessionIdRef = useRef<string | null>(null)
  const lastSavedCodeRef = useRef<string | null>(null)
  const startedAtRef = useRef<number>(Date.now())
  const codeRef = useRef(code)
  const stdoutRef = useRef(stdout)
  const stderrRef = useRef(stderr)
  const hintCountRef = useRef(hintCount)
  const objectiveRef = useRef(learningObjective)

  codeRef.current = code
  stdoutRef.current = stdout
  stderrRef.current = stderr
  hintCountRef.current = hintCount
  objectiveRef.current = learningObjective

  const ensureSession = useEffectEvent(async () => {
    if (sessionIdRef.current) return sessionIdRef.current
    const response = await fetch("/api/coding/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, lessonId, conceptId }),
    })
    if (!response.ok) return null
    const data = (await response.json()) as { sessionId: string }
    sessionIdRef.current = data.sessionId
    startedAtRef.current = Date.now()
    return data.sessionId
  })

  const tick = useEffectEvent(async () => {
    const current = codeRef.current
    if (lastSavedCodeRef.current === current) return
    const sessionId = await ensureSession()
    if (!sessionId) return

    const prevCode = lastSavedCodeRef.current
    const response = await fetch("/api/coding/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        mode,
        lessonId,
        code: current,
        prevCode,
        elapsedMs: Date.now() - startedAtRef.current,
        stdout: stdoutRef.current || null,
        stderr: stderrRef.current || null,
        hintCount: hintCountRef.current,
        learningObjective: objectiveRef.current,
      }),
    })
    if (!response.ok) return
    const data = (await response.json()) as { created?: boolean }
    if (data.created !== false) {
      lastSavedCodeRef.current = current
    }
  })

  useEffect(() => {
    if (!enabled) return
    void ensureSession()
    const id = window.setInterval(() => {
      void tick()
    }, SNAPSHOT_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [enabled, mode, lessonId, conceptId])
}
