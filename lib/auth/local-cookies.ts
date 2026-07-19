const SECURE_COOKIE_PREFIX = "__Secure-neon-auth"
const LOCAL_COOKIE_PREFIX = "neon-auth"

export const isLocalAuthCookieRewriteEnabled = () =>
  process.env.NODE_ENV !== "production"

const rewriteSetCookieValue = (value: string) => {
  let next = value.replaceAll(SECURE_COOKIE_PREFIX, LOCAL_COOKIE_PREFIX)
  next = next.replace(/;\s*Secure/gi, "")
  if (!/;\s*SameSite=/i.test(next)) {
    next = `${next}; SameSite=Lax`
  } else {
    next = next.replace(/;\s*SameSite=[^;]*/i, "; SameSite=Lax")
  }
  return next
}

/** Response: __Secure-neon-auth → neon-auth, strip Secure (localhost only) */
export const adaptAuthResponseCookies = (response: Response): Response => {
  if (!isLocalAuthCookieRewriteEnabled()) {
    return response
  }

  const headers = new Headers(response.headers)
  const setCookies =
    typeof headers.getSetCookie === "function" ? headers.getSetCookie() : []

  if (setCookies.length === 0) {
    return response
  }

  headers.delete("set-cookie")
  for (const cookie of setCookies) {
    headers.append("set-cookie", rewriteSetCookieValue(cookie))
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/** Request: neon-auth. → __Secure-neon-auth. so getSession finds cookies */
export const rewriteIncomingAuthCookieHeader = (
  cookieHeader: string | null
): string | null => {
  if (!cookieHeader || !isLocalAuthCookieRewriteEnabled()) {
    return cookieHeader
  }

  if (!cookieHeader.includes(`${LOCAL_COOKIE_PREFIX}.`)) {
    return cookieHeader
  }

  return cookieHeader.replaceAll(
    `${LOCAL_COOKIE_PREFIX}.`,
    `${SECURE_COOKIE_PREFIX}.`
  )
}

export const withRewrittenAuthCookies = (request: Request): Headers => {
  const headers = new Headers(request.headers)
  const rewritten = rewriteIncomingAuthCookieHeader(headers.get("cookie"))
  if (rewritten) {
    headers.set("cookie", rewritten)
  }
  return headers
}
