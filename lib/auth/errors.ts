type AuthErrorLike = {
  message?: string
  code?: string
  status?: number
  error?: string
}

export const getAuthErrorMessage = (error: unknown, fallback: string) => {
  if (!error) {
    return fallback
  }

  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  const value = error as AuthErrorLike
  if (value.message) {
    return value.message
  }
  if (value.error) {
    return value.error
  }

  return fallback
}

export const isEmailNotVerifiedError = (error: unknown) => {
  const message = getAuthErrorMessage(error, "").toLowerCase()
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as AuthErrorLike).code ?? "").toUpperCase()
      : ""

  return (
    code === "EMAIL_NOT_VERIFIED" ||
    message.includes("email_not_verified") ||
    message.includes("not verified") ||
    message.includes("verif")
  )
}
