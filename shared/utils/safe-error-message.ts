/** Avoid leaking stack traces or internal paths to API clients in production. */
export function safeApiErrorMessage(error: unknown, fallback: string): string {
  if (import.meta.dev) {
    return error instanceof Error ? error.message : String(error)
  }
  return fallback
}
