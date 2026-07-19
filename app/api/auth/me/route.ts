import { NextResponse } from "next/server"

import { getSessionUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export const GET = async () => {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      onboarding: user.onboarding,
    },
  })
}
