"use client"

import { Code2, Download, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  deleteProgramAction,
  downloadTextFile,
  slugifyFilename,
  type ProgramActionState,
  type SavedProgramRecord,
} from "@/lib/programs"

type ProgramsListProps = {
  programs: Array<{
    id: string
    title: string
    code: string
    updatedLabel: string
  }>
}

const initialState: ProgramActionState = null

const ProgramRow = ({
  program,
}: {
  program: ProgramsListProps["programs"][number]
}) => {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const deleteWithRefresh = async (
    prev: ProgramActionState,
    formData: FormData
  ): Promise<ProgramActionState> => {
    const result = await deleteProgramAction(prev, formData)
    if (result?.ok) {
      startTransition(() => {
        router.refresh()
      })
    }
    return result
  }

  const [state, formAction, pending] = useActionState(
    deleteWithRefresh,
    initialState
  )

  const handleDownload = () => {
    downloadTextFile(program.code, `${slugifyFilename(program.title)}.py`)
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] px-5 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          {program.title}
        </p>
        <p className="mt-0.5 text-sm text-[var(--app-muted)]">
          Updated {program.updatedLabel}
        </p>
        {state?.error ? (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link
            href={`/student/code?program=${program.id}`}
            aria-label={`Open ${program.title}`}
          >
            Open
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={handleDownload}
          aria-label={`Download ${program.title}`}
        >
          <Download />
          Download
        </Button>
        <form action={formAction}>
          <input type="hidden" name="programId" value={program.id} />
          <Button
            size="sm"
            variant="ghost"
            type="submit"
            disabled={pending}
            aria-label={`Delete ${program.title}`}
          >
            <Trash2 />
            {pending ? "…" : "Delete"}
          </Button>
        </form>
      </div>
    </li>
  )
}

export const ProgramsList = ({ programs }: ProgramsListProps) => {
  if (programs.length === 0) {
    return (
      <div className="app-surface flex flex-col items-start gap-4 rounded-xl p-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--app-accent-soft)]">
          <Code2 className="size-5 text-[var(--brand-blue)]" />
        </div>
        <div>
          <h2 className="font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            No saved programs yet
          </h2>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Open the IDE, write some Python, and click Save.
          </p>
        </div>
        <Button asChild>
          <Link href="/student/code" aria-label="Open Python IDE">
            Open IDE
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <ul className="app-surface overflow-hidden rounded-xl">
      {programs.map((program) => (
        <ProgramRow key={program.id} program={program} />
      ))}
    </ul>
  )
}

export const toProgramListItem = (program: SavedProgramRecord) => ({
  id: program.id,
  title: program.title,
  code: program.code,
  updatedLabel: new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(program.updatedAt),
})
