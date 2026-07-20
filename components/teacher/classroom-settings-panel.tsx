"use client"

import { Check, Copy } from "lucide-react"
import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  archiveClassroomAction,
  regenerateJoinCodeAction,
  renameClassroomAction,
  type ClassroomActionState,
} from "@/lib/classrooms/actions"

type ClassroomSettingsProps = {
  classroomId: string
  name: string
  joinCode: string
  archived: boolean
}

const initialState: ClassroomActionState = null

const CopyJoinCodeButton = ({ joinCode }: { joinCode: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label={copied ? "Join code copied" : "Copy join code"}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}

export const ClassroomSettingsPanel = ({
  classroomId,
  name,
  joinCode,
  archived,
}: ClassroomSettingsProps) => {
  const [renameState, renameAction, renamePending] = useActionState(
    renameClassroomAction,
    initialState
  )
  const [archiveState, archiveAction, archivePending] = useActionState(
    archiveClassroomAction,
    initialState
  )
  const [regenState, regenAction, regenPending] = useActionState(
    regenerateJoinCodeAction,
    initialState
  )

  const error =
    renameState?.error ?? archiveState?.error ?? regenState?.error ?? null
  const feedback =
    renameState?.message ??
    archiveState?.message ??
    regenState?.message ??
    null

  return (
    <div className="flex flex-col gap-6">
      <div className="app-surface flex flex-col gap-3 rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
              Join code
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-wider text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
              {joinCode}
            </p>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Share this code so students can join your class.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyJoinCodeButton joinCode={joinCode} />
            <form action={regenAction}>
              <input type="hidden" name="classroomId" value={classroomId} />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={regenPending || archived}
                aria-label="Regenerate join code"
              >
                {regenPending ? "Updating…" : "New code"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <form
        action={renameAction}
        className="app-surface flex flex-col gap-3 rounded-xl p-5"
      >
        <input type="hidden" name="classroomId" value={classroomId} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="rename-classroom">Class name</Label>
          <Input
            id="rename-classroom"
            name="name"
            defaultValue={name}
            required
            minLength={3}
            maxLength={80}
            disabled={renamePending || archived}
            aria-label="Rename class"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={renamePending || archived}
          aria-label="Save class name"
        >
          {renamePending ? "Saving…" : "Save name"}
        </Button>
      </form>

      <div className="app-surface flex flex-col gap-3 rounded-xl p-5">
        <div>
          <h3 className="font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {archived ? "Archived class" : "Archive class"}
          </h3>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            {archived
              ? "Restoring makes the class available for new joins again."
              : "Archiving keeps members but blocks new join codes."}
          </p>
        </div>
        <form action={archiveAction}>
          <input type="hidden" name="classroomId" value={classroomId} />
          <input
            type="hidden"
            name="archive"
            value={archived ? "false" : "true"}
          />
          <Button
            type="submit"
            variant={archived ? "default" : "destructive"}
            disabled={archivePending}
            aria-label={archived ? "Restore class" : "Archive class"}
          >
            {archivePending
              ? "Updating…"
              : archived
                ? "Restore class"
                : "Archive class"}
          </Button>
        </form>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {feedback && !error ? (
        <p className="text-sm text-[var(--brand-blue)]" role="status">
          {feedback}
        </p>
      ) : null}
    </div>
  )
}
