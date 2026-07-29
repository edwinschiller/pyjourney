import { NextResponse } from "next/server"

import { getSessionUser } from "@/lib/auth/session"
import { persistProgram } from "@/lib/programs/actions"

export const runtime = "nodejs"

export const POST = async (request: Request) => {
  const user = await getSessionUser()
  if (!user || user.role !== "student" || user.status !== "active") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    )
  }

  let body: {
    programId?: string | null
    title?: string
    code?: string
  }

  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    )
  }

  const result = await persistProgram(user.id, {
    programId: body.programId ?? null,
    title: typeof body.title === "string" ? body.title : "Untitled program",
    code: typeof body.code === "string" ? body.code : "",
  })

  if (!result?.ok) {
    return NextResponse.json(
      { ok: false, error: result?.error ?? "Could not save." },
      { status: 400 }
    )
  }

  return NextResponse.json({
    ok: true,
    programId: result.programId,
  })
}
