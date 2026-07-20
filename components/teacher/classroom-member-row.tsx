"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  removeClassroomMemberAction,
  type ClassroomActionState,
} from "@/lib/classrooms/actions"

type MemberRowProps = {
  classroomId: string
  studentId: string
  displayName: string | null
  email: string
  joinedLabel: string
}

const initialState: ClassroomActionState = null

export const ClassroomMemberRow = ({
  classroomId,
  studentId,
  displayName,
  email,
  joinedLabel,
}: MemberRowProps) => {
  const [state, formAction, pending] = useActionState(
    removeClassroomMemberAction,
    initialState
  )

  const label = displayName?.trim() || email

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          {label}
        </p>
        <p className="truncate text-sm text-[var(--app-muted)]">{email}</p>
        <p className="mt-0.5 text-xs text-[var(--app-muted)]">
          Joined {joinedLabel}
        </p>
        {state?.error ? (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
      <form action={formAction}>
        <input type="hidden" name="classroomId" value={classroomId} />
        <input type="hidden" name="studentId" value={studentId} />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          disabled={pending}
          aria-label={`Remove ${label} from class`}
        >
          {pending ? "Removing…" : "Remove"}
        </Button>
      </form>
    </li>
  )
}
