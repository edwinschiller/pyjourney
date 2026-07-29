"use client"

import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/components/theme/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme()
  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "size-8 border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg)] hover:bg-[var(--app-surface-hover)]",
        className
      )}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? (
        <Sun className="size-4 text-[var(--python-yellow)]" aria-hidden />
      ) : (
        <Moon className="size-4 text-[var(--app-accent)]" aria-hidden />
      )}
    </Button>
  )
}
