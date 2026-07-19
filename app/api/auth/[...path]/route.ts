import { getAuth, isNeonAuthConfigured } from "@/lib/auth/server"
import { adaptAuthResponseCookies } from "@/lib/auth/local-cookies"

type RouteContext = { params: Promise<{ path: string[] }> }

const notConfigured = () =>
  Response.json({ error: "Neon Auth is not configured" }, { status: 503 })

const handle = async (
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  request: Request,
  context: RouteContext
) => {
  if (!isNeonAuthConfigured()) {
    return notConfigured()
  }

  const handlers = getAuth().handler()
  const response = await handlers[method](request, context)
  return adaptAuthResponseCookies(response)
}

export const GET = (request: Request, context: RouteContext) =>
  handle("GET", request, context)

export const POST = (request: Request, context: RouteContext) =>
  handle("POST", request, context)

export const PUT = (request: Request, context: RouteContext) =>
  handle("PUT", request, context)

export const DELETE = (request: Request, context: RouteContext) =>
  handle("DELETE", request, context)

export const PATCH = (request: Request, context: RouteContext) =>
  handle("PATCH", request, context)
