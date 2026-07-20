"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createClassroomAction,
  type ClassroomActionState,
} from "@/lib/classrooms/actions"

const initialState: ClassroomActionState = null

export const CreateClassroomForm = () => {
  const [state, formAction, pending] = useActionState(
    createClassroomAction,
    initialState
  )

  return (
    <form
      action={formAction}
      className="app-surface flex flex-col gap-4 rounded-xl p-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Create a class
        </h2>
        <p className="mt-1 text-sm text-[var(--app-muted)]">
          Students join with a unique code you can share.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="classroom-name">Class name</Label>
        <Input
          id="classroom-name"
          name="name"
          required
          minLength={3}
          maxLength={80}
          placeholder="e.g. Period 3 Python"
          aria-label="Class name"
          disabled={pending}
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} aria-label="Create class">
        {pending ? "Creating…" : "Create class"}
      </Button>
    </form>
  )
}
