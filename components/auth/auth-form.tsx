"use client"

import { Check, GraduationCap, School } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, type ComponentType, type FormEvent } from "react"

import { PyJourneyLogo } from "@/components/brand/pyjourney-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth/client"
import {
  getAuthErrorMessage,
  isEmailNotVerifiedError,
} from "@/lib/auth/errors"
import { cn } from "@/lib/utils"

type AuthMode = "signin" | "register"
type AuthStep = "credentials" | "verify"
type AccountRole = "student" | "teacher"

type BootstrapResponse = {
  user: {
    id: string
    email: string
    role: "student" | "teacher" | "admin"
  } | null
}

const getDashboardPath = (role: "student" | "teacher" | "admin") => {
  if (role === "teacher") return "/teacher"
  if (role === "admin") return "/admin"
  return "/student"
}

const RoleSwitch = ({
  active,
  label,
  sublabel,
  icon: Icon,
  accent,
  onClick,
}: {
  active: boolean
  label: string
  sublabel: string
  icon: ComponentType<{ className?: string }>
  accent: "blue" | "yellow"
  onClick: () => void
}) => {
  const isBlue = accent === "blue"

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-all",
        active
          ? isBlue
            ? "border-[var(--brand-blue)] bg-[var(--app-accent-soft)]"
            : "border-[var(--python-yellow-dark)] bg-[var(--brand-yellow)]/10"
          : "border-transparent bg-transparent hover:bg-[var(--app-surface-hover)]"
      )}
    >
      {active && (
        <span
          className={cn(
            "absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-md text-white",
            isBlue
              ? "bg-[var(--brand-blue)]"
              : "bg-[var(--python-yellow-dark)]"
          )}
        >
          <Check className="h-3 w-3 stroke-[3]" aria-hidden />
        </span>
      )}
      <Icon
        className={cn(
          "h-5 w-5",
          active
            ? isBlue
              ? "text-[var(--brand-blue)]"
              : "text-[var(--python-yellow-dark)]"
            : "text-[var(--app-muted)]"
        )}
        aria-hidden
      />
      <span className="text-sm font-bold text-[var(--app-fg)]">{label}</span>
      <span className="text-[11px] leading-snug text-[var(--app-muted)]">
        {sublabel}
      </span>
    </button>
  )
}

export const AuthForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMode: AuthMode =
    searchParams.get("mode") === "register" ? "register" : "signin"
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [step, setStep] = useState<AuthStep>("credentials")
  const [accountRole, setAccountRole] = useState<AccountRole>("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleModeSwitch = (nextMode: AuthMode) => {
    setMode(nextMode)
    setStep("credentials")
    setError(null)
    setInfo(null)
    setOtp("")
  }

  const handleCompleteLogin = async () => {
    const response = await fetch("/api/auth/bootstrap", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: accountRole,
        // Registration (and role switch intent) may set/update student|teacher
        applyRole: mode === "register" || accountRole === "teacher",
      }),
    })

    if (!response.ok) {
      let message = "Could not finish sign-in. Please try again."
      try {
        const payload = (await response.json()) as { error?: string }
        if (payload.error) {
          message = payload.error
        }
      } catch {
        // keep default message
      }
      if (response.status === 401) {
        message = "Verified, but session is missing. Try signing in again."
      }
      setError(message)
      return
    }

    const data = (await response.json()) as BootstrapResponse
    if (!data.user) {
      setError("Verified, but session is missing. Try signing in again.")
      return
    }

    router.push(getDashboardPath(data.user.role))
    router.refresh()
  }

  const handleResendOtp = async () => {
    setError(null)
    setInfo(null)
    setIsPending(true)
    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/login",
      })
      if (result.error) {
        const fallback = await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "email-verification",
        })
        if (fallback.error) {
          throw fallback.error
        }
      }
      setInfo("A new verification code was sent to your email.")
    } catch (err) {
      setError(getAuthErrorMessage(err, "Could not resend verification code."))
    } finally {
      setIsPending(false)
    }
  }

  const handleCredentialsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setIsPending(true)

    try {
      if (mode === "register") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "Learner",
        })
        if (result.error) {
          throw result.error
        }
        if (result.data?.user?.emailVerified === false) {
          setStep("verify")
          setInfo(
            accountRole === "student"
              ? "Enter the code from your email. You’ll join PyJourney Academy."
              : "Enter the code from your email to start teaching."
          )
          return
        }
        await handleCompleteLogin()
        return
      }

      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        if (isEmailNotVerifiedError(result.error)) {
          setStep("verify")
          setInfo("Please verify your email to continue.")
          await handleResendOtp()
          return
        }
        throw result.error
      }
      await handleCompleteLogin()
    } catch (err) {
      if (isEmailNotVerifiedError(err)) {
        setStep("verify")
        setInfo("Please verify your email to continue.")
        return
      }
      setError(getAuthErrorMessage(err, "Authentication failed."))
    } finally {
      setIsPending(false)
    }
  }

  const handleVerifySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setIsPending(true)

    try {
      const result = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      })
      if (result.error) {
        throw result.error
      }

      await authClient.signIn.email({ email, password })
      await handleCompleteLogin()
    } catch (err) {
      setError(getAuthErrorMessage(err, "Invalid verification code."))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="app-surface mx-auto w-full max-w-md rounded-2xl p-6 sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Link href="/" aria-label="PyJourney home">
          <PyJourneyLogo className="max-w-[180px]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {step === "verify"
              ? "Verify your email"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            {step === "verify"
              ? `We sent a code to ${email}`
              : accountRole === "student"
                ? "Learn in PyJourney Academy — or join a teacher’s class later"
                : "Create classes and invite students with a join code"}
          </p>
        </div>
      </div>

      {step === "credentials" && (
        <>
          <div className="mb-4">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[var(--app-muted)]">
              I am a…
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-1.5">
              <RoleSwitch
                active={accountRole === "student"}
                label="Student"
                sublabel="Join Academy"
                icon={GraduationCap}
                accent="blue"
                onClick={() => setAccountRole("student")}
              />
              <RoleSwitch
                active={accountRole === "teacher"}
                label="Teacher"
                sublabel="Create classes"
                icon={School}
                accent="yellow"
                onClick={() => setAccountRole("teacher")}
              />
            </div>
          </div>

          <div
            className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-1"
            role="tablist"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                mode === "signin"
                  ? "bg-[var(--app-surface)] text-[var(--brand-blue)] shadow-sm"
                  : "text-[var(--app-muted)] hover:text-[var(--app-fg)]"
              }`}
              onClick={() => handleModeSwitch("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                mode === "register"
                  ? "bg-[var(--app-surface)] text-[var(--brand-blue)] shadow-sm"
                  : "text-[var(--app-muted)] hover:text-[var(--app-fg)]"
              }`}
              onClick={() => handleModeSwitch("register")}
            >
              Register
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleCredentialsSubmit}>
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-[var(--app-muted)]" role="status">
                {info}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : accountRole === "teacher"
                    ? "Register as teacher"
                    : "Register as student"}
            </Button>
          </form>
        </>
      )}

      {step === "verify" && (
        <form className="space-y-4" onSubmit={handleVerifySubmit}>
          <div className="space-y-2">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="6-digit code"
              aria-label="Email verification code"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm text-[var(--app-muted)]" role="status">
              {info}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Verifying…" : "Verify and continue"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={handleResendOtp}
          >
            Resend code
          </Button>
          <button
            type="button"
            className="w-full text-sm text-[var(--app-muted)] underline-offset-4 hover:underline"
            onClick={() => {
              setStep("credentials")
              setOtp("")
              setError(null)
              setInfo(null)
            }}
          >
            Back to {mode === "signin" ? "sign in" : "registration"}
          </button>
        </form>
      )}

      <p className="mt-2 text-center">
        <Link
          href="/"
          className="text-sm text-[var(--app-muted)] underline-offset-4 hover:text-[var(--app-fg)] hover:underline"
        >
          ← Back to home
        </Link>
      </p>
    </div>
  )
}
