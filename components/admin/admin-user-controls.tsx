"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  updateUserRoleAction,
  updateUserStatusAction,
  type AdminActionState,
} from "@/lib/admin/actions"
import { SYSTEM_ACADEMY_TEACHER_ID } from "@/lib/db/constants"
import type { UserRole } from "@/lib/auth/session"

type AdminUserControlsProps = {
  userId: string
  role: UserRole
  status: "active" | "disabled"
  isSelf: boolean
}

const initialState: AdminActionState = null

export const AdminUserControls = ({
  userId,
  role,
  status,
  isSelf,
}: AdminUserControlsProps) => {
  const router = useRouter()
  const locked = userId === SYSTEM_ACADEMY_TEACHER_ID
  const [roleState, roleAction, rolePending] = useActionState(
    updateUserRoleAction,
    initialState
  )
  const [statusState, statusAction, statusPending] = useActionState(
    updateUserStatusAction,
    initialState
  )

  useEffect(() => {
    if (roleState?.ok || statusState?.ok) router.refresh()
  }, [roleState, statusState, router])

  if (locked) {
    return (
      <p className="text-xs text-[var(--app-muted)]">System account</p>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={roleAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="userId" value={userId} />
        <label className="sr-only" htmlFor={`role-${userId}`}>
          Role
        </label>
        <select
          id={`role-${userId}`}
          name="role"
          defaultValue={role}
          disabled={rolePending || isSelf}
          className="h-8 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2 text-xs text-[var(--app-fg)]"
          aria-label="Change role"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit" size="xs" disabled={rolePending || isSelf}>
          {rolePending ? "Saving…" : "Save role"}
        </Button>
      </form>

      <form action={statusAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="userId" value={userId} />
        <input
          type="hidden"
          name="status"
          value={status === "active" ? "disabled" : "active"}
        />
        <Button
          type="submit"
          size="xs"
          variant="outline"
          disabled={statusPending || isSelf}
          aria-label={
            status === "active" ? "Disable user" : "Re-enable user"
          }
        >
          {statusPending
            ? "Saving…"
            : status === "active"
              ? "Disable"
              : "Enable"}
        </Button>
      </form>

      {roleState?.error || statusState?.error ? (
        <p className="max-w-[14rem] text-right text-xs text-destructive" role="alert">
          {roleState?.error ?? statusState?.error}
        </p>
      ) : null}
      {isSelf ? (
        <p className="text-[10px] text-[var(--app-muted)]">
          Your own account is protected here
        </p>
      ) : null}
    </div>
  )
}
