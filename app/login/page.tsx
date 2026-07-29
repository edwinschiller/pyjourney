import { Suspense } from "react"

import { AuthForm } from "@/components/auth/auth-form"
import { ThemeToggle } from "@/components/theme/theme-toggle"

const LoginPage = () => {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute -left-24 top-0 h-[360px] w-[360px] rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--brand-blue)" }}
        />
        <div
          className="absolute -right-16 bottom-0 h-[320px] w-[320px] rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--brand-yellow)" }}
        />
      </div>
      <div className="relative z-10 w-full">
        <Suspense
          fallback={
            <div className="app-surface mx-auto w-full max-w-md rounded-2xl p-8 text-center text-sm text-[var(--app-muted)]">
              Loading…
            </div>
          }
        >
          <AuthForm />
        </Suspense>
      </div>
    </div>
  )
}

export default LoginPage
