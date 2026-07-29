import Link from "next/link"

import { requireRole } from "@/lib/auth/session"
import { getAdminDashboardStats } from "@/lib/admin"

export const dynamic = "force-dynamic"

const AdminDashboardPage = async () => {
  const user = await requireRole(["admin"])
  const stats = await getAdminDashboardStats()

  const cards = [
    {
      label: "Users",
      value: stats.userCount,
      detail: `${stats.studentCount} students · ${stats.teacherCount} teachers · ${stats.adminCount} admins`,
      href: "/admin/users",
    },
    {
      label: "Active classes",
      value: stats.activeClassCount,
      detail: `${stats.archivedClassCount} archived`,
      href: "/admin/classes",
    },
    {
      label: "Concepts",
      value: stats.conceptCount,
      detail: "Active curriculum nodes",
      href: "/admin/curriculum",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Admin dashboard
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Signed in as {user.email}. Review users, classrooms, and the
          competency graph.
        </p>
      </header>

      <section
        className="grid gap-3 sm:grid-cols-3"
        aria-label="Platform overview"
      >
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="app-surface rounded-2xl p-5 transition-colors hover:bg-[var(--app-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
            aria-label={`Open ${card.label}`}
          >
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
              {card.value}
            </p>
            <p className="mt-2 text-xs text-[var(--app-muted)]">{card.detail}</p>
          </Link>
        ))}
      </section>

      <section className="app-surface rounded-2xl p-5 text-sm text-[var(--app-muted)]">
        Role changes take effect on the user’s next navigation. Teachers keep
        ownership of their classes; students keep their learning evidence.
      </section>
    </div>
  )
}

export default AdminDashboardPage
