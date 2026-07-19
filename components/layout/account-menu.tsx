"use client"

import { ChevronsUpDown, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth/client"
import type { SessionUser } from "@/lib/auth/session"
import { cn } from "@/lib/utils"

const getInitials = (user: SessionUser) => {
  const source = user.displayName?.trim() || user.email
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

export const AccountMenu = ({ user }: { user: SessionUser }) => {
  const router = useRouter()
  const displayName = user.displayName || user.email.split("@")[0] || "User"
  const initials = getInitials(user)

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
    } catch {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    }
    router.push("/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-2 text-left shadow-[var(--app-shadow)] transition-colors",
            "hover:bg-[var(--app-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          )}
          aria-label="Open account menu"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-xs font-semibold text-[var(--app-accent)]">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold leading-tight text-[var(--app-fg)]">
              {displayName}
            </span>
            <span className="block truncate text-[11px] capitalize text-[var(--app-muted)]">
              {user.role}
            </span>
          </span>
          <ChevronsUpDown
            className="h-4 w-4 shrink-0 text-[var(--app-muted)]"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-64">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2.5 px-2 py-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-xs font-semibold text-[var(--app-accent)]">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-[var(--app-muted)]">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
