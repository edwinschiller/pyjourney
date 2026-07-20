"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  joinClassroomAction,
  type ClassroomActionState,
} from "@/lib/classrooms/actions"

const initialState: ClassroomActionState = null

export const JoinClassroomForm = () => {
  const [state, formAction, pending] = useActionState(
    joinClassroomAction,
    initialState
  )

  return (
    <form
      action={formAction}
      className="app-surface flex flex-col gap-4 rounded-xl p-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Join a class
        </h2>
        <p className="mt-1 text-sm text-[var(--app-muted)]">
          Enter the join code from your teacher. You stay in PyJourney Academy
          as well.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="join-code">Join code</Label>
        <Input
          id="join-code"
          name="joinCode"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. PY-AK-472"
          aria-label="Classroom join code"
          className="font-mono uppercase"
          disabled={pending}
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok && state.message ? (
        <p className="text-sm text-[var(--brand-blue)]" role="status">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} aria-label="Join class">
        {pending ? "Joining…" : "Join class"}
      </Button>
    </form>
  )
}
