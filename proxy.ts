import { NextResponse, type NextRequest } from "next/server"

import {
  isLocalAuthCookieRewriteEnabled,
  withRewrittenAuthCookies,
} from "@/lib/auth/local-cookies"
import { isNeonAuthConfigured } from "@/lib/auth/server"

const PROTECTED_PREFIXES = [
  "/student",
  "/teacher",
  "/admin",
  "/onboarding",
] as const

const hasAuthSessionCookie = (cookieHeader: string | null) => {
  if (!cookieHeader) {
    return false
  }
  return /(?:^|;\s*)(?:__Secure-)?neon-auth\./.test(cookieHeader)
}

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

export const proxy = (request: NextRequest) => {
  const headers = isLocalAuthCookieRewriteEnabled()
    ? withRewrittenAuthCookies(request)
    : new Headers(request.headers)

  const { pathname } = request.nextUrl

  if (isProtectedPath(pathname)) {
    if (!isNeonAuthConfigured()) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const cookie = headers.get("cookie")
    if (!hasAuthSessionCookie(cookie)) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next({
    request: {
      headers,
    },
  })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
