import { NextResponse } from "next/server"

import {
  bootstrapAppUser,
  type BootstrapRole,
} from "@/lib/auth/bootstrap"

export const dynamic = "force-dynamic"

type BootstrapBody = {
  role?: BootstrapRole
}

export const POST = async (request: Request) => {
  let body: BootstrapBody = {}
  try {
    body = (await request.json()) as BootstrapBody
  } catch {
    body = {}
  }

  try {
    const role: BootstrapRole | undefined =
      body.role === "teacher"
        ? "teacher"
        : body.role === "student"
          ? "student"
          : undefined
    const user = await bootstrapAppUser({
      role,
    })

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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not finish sign-in"
    console.error("bootstrap failed", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
