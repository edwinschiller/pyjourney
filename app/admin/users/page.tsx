import { AdminUserControls } from "@/components/admin/admin-user-controls"
import { requireRole } from "@/lib/auth/session"
import { listAdminUsers } from "@/lib/admin"

export const dynamic = "force-dynamic"

const formatWhen = (date: Date) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)

const roleBadgeClass = (role: string) => {
  if (role === "admin") return "bg-[var(--app-highlight-soft)] text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
  if (role === "teacher") return "bg-[var(--app-accent-soft)] text-[var(--brand-blue)]"
  return "bg-[var(--app-bg)] text-[var(--app-muted)]"
}

const AdminUsersPage = async () => {
  const admin = await requireRole(["admin"])
  const users = await listAdminUsers()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Users
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Change roles and account status. Login cannot escalate a student to
          teacher — only this page (or registration) sets roles.
        </p>
      </header>

      {users.length === 0 ? (
        <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
          No profiles yet.
        </div>
      ) : (
        <ul className="app-surface divide-y divide-[var(--app-border)] overflow-hidden rounded-2xl">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {user.displayName?.trim() || user.email}
                  </p>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${roleBadgeClass(user.role)}`}
                  >
                    {user.role}
                  </span>
                  {user.status === "disabled" ? (
                    <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-red-700 uppercase dark:text-red-300">
                      Disabled
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-sm text-[var(--app-muted)]">
                  {user.email}
                </p>
                <p className="text-xs text-[var(--app-muted)]">
                  Joined {formatWhen(user.createdAt)}
                </p>
              </div>
              <AdminUserControls
                userId={user.id}
                role={user.role}
                status={user.status}
                isSelf={user.id === admin.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminUsersPage
