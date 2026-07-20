import type { ComponentType } from "react"
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Code2,
  FolderOpen,
  LayoutDashboard,
  School,
  Users,
} from "lucide-react"

import type { UserRole } from "@/lib/auth/session"

export type NavLink = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export const STUDENT_NAV: NavLink[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/learn", label: "Learn", icon: BookOpen },
  { href: "/student/code", label: "IDE", icon: Code2 },
  { href: "/student/programs", label: "Programs", icon: FolderOpen },
  { href: "/student/insights", label: "Insights", icon: BarChart3 },
]

export const TEACHER_NAV: NavLink[] = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/classes", label: "Classes", icon: Users },
  { href: "/teacher/assignments", label: "Assignments", icon: ClipboardList },
]

export const ADMIN_NAV: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/classes", label: "Classes", icon: School },
  { href: "/admin/curriculum", label: "Curriculum", icon: BookOpen },
]

export const getNavForRole = (role: UserRole): NavLink[] => {
  if (role === "teacher") return TEACHER_NAV
  if (role === "admin") return ADMIN_NAV
  return STUDENT_NAV
}

export const getHomePathForRole = (role: UserRole) => {
  if (role === "teacher") return "/teacher"
  if (role === "admin") return "/admin"
  return "/student"
}
