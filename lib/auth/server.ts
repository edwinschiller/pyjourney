import { createNeonAuth, type NeonAuth } from "@neondatabase/auth/next/server"

export const isNeonAuthConfigured = () => {
  const baseUrl = process.env.NEON_AUTH_BASE_URL?.trim()
  const secret = process.env.NEON_AUTH_COOKIE_SECRET?.trim()
  return Boolean(baseUrl && secret && secret.length >= 32)
}

let authInstance: NeonAuth | null = null

export const getAuth = (): NeonAuth => {
  if (!isNeonAuthConfigured()) {
    throw new Error("Neon Auth is not configured")
  }

  if (!authInstance) {
    authInstance = createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL!,
      cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET!,
        sameSite: "lax",
      },
    })
  }

  return authInstance
}
