"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createClassAssignmentAction,
  type AssignmentActionState,
} from "@/lib/assignments/actions"

type ClassroomOption = {
  id: string
  name: string
  memberCount: number
}

type ConceptOption = {
  id: string
  title: string
}

type CreateAssignmentFormProps = {
  classrooms: ClassroomOption[]
  concepts: ConceptOption[]
}

const initialState: AssignmentActionState = null

export const CreateAssignmentForm = ({
  classrooms,
  concepts,
}: CreateAssignmentFormProps) => {
  const router = useRouter()
  const [state, action, pending] = useActionState(
    createClassAssignmentAction,
    initialState
  )

  useEffect(() => {
    if (state?.ok) router.refresh()
  }, [state, router])

  if (classrooms.length === 0) {
    return (
      <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
        Create an active class with students before assigning a concept.
      </div>
    )
  }

  return (
    <form
      action={action}
      className="app-surface flex flex-col gap-4 rounded-xl p-5"
      aria-labelledby="create-assignment-heading"
    >
      <div>
        <h2
          id="create-assignment-heading"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Assign a concept
        </h2>
        <p className="mt-1 text-sm text-[var(--app-muted)]">
          Every student in the class gets this concept as their next focus on
          the learning path.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="classroomId">Class</Label>
          <select
            id="classroomId"
            name="classroomId"
            required
            defaultValue={classrooms[0]?.id}
            className="h-9 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 text-sm text-[var(--app-fg)]"
            aria-label="Choose class"
          >
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} ({classroom.memberCount})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="conceptId">Concept</Label>
          <select
            id="conceptId"
            name="conceptId"
            required
            defaultValue={concepts[0]?.id}
            className="h-9 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 text-sm text-[var(--app-fg)]"
            aria-label="Choose concept"
          >
            {concepts.map((concept) => (
              <option key={concept.id} value={concept.id}>
                {concept.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          name="title"
          placeholder="Practice: Variables"
          maxLength={120}
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-[var(--brand-blue)]" role="status">
          Assignment created for the class.
        </p>
      ) : null}

      <Button type="submit" disabled={pending || concepts.length === 0}>
        {pending ? "Assigning…" : "Assign to class"}
      </Button>
    </form>
  )
}
