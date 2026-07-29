"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { PropsWithChildren } from "react"

import { PyJourneyLogo } from "@/components/brand/pyjourney-logo"
import { AccountMenu } from "@/components/layout/account-menu"
import { PanelResizeHandle } from "@/components/layout/panel-resize-handle"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useHorizontalPanelResize } from "@/hooks/use-horizontal-panel-resize"
import type { SessionUser } from "@/lib/auth/session"
import { getHomePathForRole, getNavForRole } from "@/lib/navigation"
import { cn } from "@/lib/utils"

type PlatformShellProps = PropsWithChildren<{
  user: SessionUser
}>

const SidebarContent = ({
  user,
  pathname,
}: {
  user: SessionUser
  pathname: string
}) => {
  const links = getNavForRole(user.role)
  const homeHref = getHomePathForRole(user.role)

  return (
    <div className="flex h-full flex-col gap-6">
      <Link href={homeHref} className="px-2" aria-label="PyJourney home">
        <PyJourneyLogo variant="compact" />
      </Link>
      <SidebarNav pathname={pathname} links={links} />
      <div className="mt-auto">
        <AccountMenu user={user} />
      </div>
    </div>
  )
}

export const PlatformShell = ({ user, children }: PlatformShellProps) => {
  const pathname = usePathname()
  const isFullHeight =
    pathname.startsWith("/student/code") ||
    pathname.startsWith("/student/learn/")

  const { width: sidebarWidth, resizeHandleProps } = useHorizontalPanelResize({
    storageKey: "platform-sidebar-width",
    defaultWidth: 220,
    minWidth: 180,
    maxWidth: 360,
    direction: "ltr",
  })

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)]">
      <div className="flex min-h-screen w-full">
        <aside
          style={{ width: sidebarWidth }}
          className="relative sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--app-border)] bg-[var(--app-sidebar)] px-3 py-5 lg:flex"
        >
          <SidebarContent user={user} pathname={pathname} />
          <PanelResizeHandle edge="right" {...resizeHandleProps} />
        </aside>

        <div
          className={cn(
            "relative flex min-h-0 min-w-0 flex-1 flex-col",
            isFullHeight && "h-[100dvh] max-h-[100dvh] overflow-hidden"
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" aria-label="Open menu">
                  <Menu className="h-4 w-4" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[260px] border-[var(--app-border)] bg-[var(--app-sidebar)] p-4 text-[var(--app-fg)]"
              >
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent user={user} pathname={pathname} />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-semibold">PyJourney</span>
            <ThemeToggle />
          </div>

          <div className="hidden items-center justify-end border-b border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2 lg:flex">
            <ThemeToggle />
          </div>

          <main
            className={cn(
              "flex flex-1 flex-col",
              isFullHeight
                ? "min-h-0 overflow-hidden"
                : "px-4 py-5 md:px-8 md:py-7"
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
