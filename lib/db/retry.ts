const isTransientDbError = (error: unknown) => {
  const message =
    error instanceof Error
      ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ""}`
      : String(error)
  return /fetch failed|ECONNRESET|ETIMEDOUT|ECONNREFUSED|socket|network|NeonDbError|Error connecting to database/i.test(
    message
  )
}

/** Retry Neon HTTP queries that fail with transient network errors. */
export const withDbRetry = async <T>(
  operation: () => Promise<T>,
  options?: { attempts?: number; label?: string }
): Promise<T> => {
  const attempts = options?.attempts ?? 3
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isTransientDbError(error) || attempt === attempts) {
        throw error
      }
      const delayMs = 120 * attempt
      console.warn(
        `DB retry ${attempt}/${attempts}${options?.label ? ` (${options.label})` : ""} in ${delayMs}ms`,
        error instanceof Error ? error.message : error
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw lastError
}
