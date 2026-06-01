/** GitHub username rules (simplified): 1–39 chars, alphanumeric or hyphen, no leading/trailing hyphen. */
const GITHUB_LOGIN_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/

export function isValidGitHubLogin(login: string): boolean {
  const trimmed = login.trim()
  return trimmed.length > 0 && trimmed.length <= 39 && GITHUB_LOGIN_RE.test(trimmed)
}

export function filterValidGitHubLogins(logins: string[]): string[] {
  return logins.map((l) => l.trim()).filter((l) => isValidGitHubLogin(l))
}
