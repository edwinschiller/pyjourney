import { NextResponse } from "next/server"

import { adaptAuthResponseCookies } from "@/lib/auth/local-cookies"
import { getAuth, isNeonAuthConfigured } from "@/lib/auth/server"

export const dynamic = "force-dynamic"

export const POST = async () => {
  if (!isNeonAuthConfigured()) {
    return NextResponse.json(
      { error: "Neon Auth is not configured" },
      { status: 503 }
    )
  }

  const result = await getAuth().signOut()
  if (result.error) {
    return NextResponse.json(
      { error: result.error.message ?? "Sign out failed" },
      { status: 400 }
    )
  }

  const response = NextResponse.json({ ok: true })
  return adaptAuthResponseCookies(response)
}
