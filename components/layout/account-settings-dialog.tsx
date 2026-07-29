"use client"

import { Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { useTheme } from "@/components/theme/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth/client"
import { getAuthErrorMessage } from "@/lib/auth/errors"
import type { SessionUser } from "@/lib/auth/session"
import { updateDisplayNameAction } from "@/lib/profile/actions"
import { cn } from "@/lib/utils"

type AccountSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: SessionUser
}

export const AccountSettingsDialog = ({
  open,
  onOpenChange,
  user,
}: AccountSettingsDialogProps) => {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [displayName, setDisplayName] = useState(
    user.displayName?.trim() || ""
  )
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  useEffect(() => {
    if (!open) return
    setDisplayName(user.displayName?.trim() || "")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setProfileMessage(null)
    setProfileError(null)
    setPasswordMessage(null)
    setPasswordError(null)
  }, [open, user.displayName])

  const handleSaveDisplayName = async () => {
    setIsSavingProfile(true)
    setProfileMessage(null)
    setProfileError(null)
    try {
      const result = await updateDisplayNameAction(displayName)
      if (!result.ok) {
        setProfileError(result.error)
        return
      }

      try {
        await authClient.updateUser({ name: result.displayName })
      } catch {
        // Profile row is source of truth for the shell; auth name sync is best-effort.
      }

      setDisplayName(result.displayName)
      setProfileMessage("Display name updated.")
      router.refresh()
    } catch (error) {
      setProfileError(
        getAuthErrorMessage(error, "Could not update display name.")
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordMessage(null)
    setPasswordError(null)

    if (currentPassword.length < 1) {
      setPasswordError("Enter your current password.")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("New password needs at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }

    setIsSavingPassword(true)
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      })

      if (result.error) {
        setPasswordError(
          getAuthErrorMessage(
            result.error,
            "Could not change password. Check your current password."
          )
        )
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordMessage("Password updated.")
    } catch (error) {
      setPasswordError(
        getAuthErrorMessage(error, "Could not change password.")
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-md flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-[var(--app-border)] px-5 py-4">
          <DialogTitle>Account settings</DialogTitle>
          <DialogDescription>
            Update your profile, appearance, and password.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Display name</h3>
              <p className="mt-0.5 text-xs text-[var(--app-muted)]">
                Shown in the sidebar and to teachers in your class.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-display-name">Display name</Label>
              <Input
                id="account-display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="name"
                maxLength={80}
                className="border-[var(--app-border)] bg-[var(--app-bg)]"
              />
            </div>
            <p className="truncate text-xs text-[var(--app-muted)]">
              Signed in as {user.email}
            </p>
            {profileError ? (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                {profileError}
              </p>
            ) : null}
            {profileMessage ? (
              <p
                className="text-xs text-emerald-700 dark:text-emerald-400"
                role="status"
              >
                {profileMessage}
              </p>
            ) : null}
            <Button
              type="button"
              onClick={() => void handleSaveDisplayName()}
              disabled={isSavingProfile || displayName.trim().length < 2}
            >
              {isSavingProfile ? "Saving…" : "Save display name"}
            </Button>
          </section>

          <div className="h-px bg-[var(--app-border)]" aria-hidden />

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Appearance</h3>
              <p className="mt-0.5 text-xs text-[var(--app-muted)]">
                Choose how PyJourney looks on this device.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                  theme === "light"
                    ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
                    : "border-[var(--app-border)] bg-[var(--app-bg)] hover:bg-[var(--app-surface-hover)]"
                )}
                aria-pressed={theme === "light"}
                aria-label="Use light mode"
              >
                <Sun
                  className="size-6 text-[var(--python-yellow)]"
                  aria-hidden
                />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                  theme === "dark"
                    ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
                    : "border-[var(--app-border)] bg-[var(--app-bg)] hover:bg-[var(--app-surface-hover)]"
                )}
                aria-pressed={theme === "dark"}
                aria-label="Use dark mode"
              >
                <Moon className="size-6 text-[var(--app-accent)]" aria-hidden />
                <span className="text-sm font-medium">Dark</span>
              </button>
            </div>
          </section>

          <div className="h-px bg-[var(--app-border)]" aria-hidden />

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Password</h3>
              <p className="mt-0.5 text-xs text-[var(--app-muted)]">
                Choose a new password for this account.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-current-password">Current password</Label>
              <Input
                id="account-current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                className="border-[var(--app-border)] bg-[var(--app-bg)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-new-password">New password</Label>
              <Input
                id="account-new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                className="border-[var(--app-border)] bg-[var(--app-bg)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-confirm-password">Confirm password</Label>
              <Input
                id="account-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="border-[var(--app-border)] bg-[var(--app-bg)]"
              />
            </div>
            {passwordError ? (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                {passwordError}
              </p>
            ) : null}
            {passwordMessage ? (
              <p
                className="text-xs text-emerald-700 dark:text-emerald-400"
                role="status"
              >
                {passwordMessage}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleChangePassword()}
              disabled={
                isSavingPassword ||
                currentPassword.length < 1 ||
                newPassword.length < 8
              }
            >
              {isSavingPassword ? "Updating…" : "Update password"}
            </Button>
          </section>
        </div>

        <DialogFooter className="shrink-0 border-t border-[var(--app-border)] px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
