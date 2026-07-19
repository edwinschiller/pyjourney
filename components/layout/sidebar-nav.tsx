"use client"

import Link from "next/link"

import type { NavLink } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export const SidebarNav = ({
  pathname,
  links,
}: {
  pathname: string
  links: NavLink[]
}) => {
  return (
    <nav className="space-y-0.5" aria-label="Main">
      {links.map((link) => {
        const Icon = link.icon
        const isRoleHome =
          link.href === "/student" ||
          link.href === "/teacher" ||
          link.href === "/admin"
        const active = isRoleHome
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                : "text-[var(--app-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-fg)]"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              className={cn("h-5 w-5 shrink-0", active && "text-[var(--app-accent)]")}
              aria-hidden
            />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
