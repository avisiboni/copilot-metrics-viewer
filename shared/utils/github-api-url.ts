const GITHUB_API_ORIGIN = 'https://api.github.com'

/** Restrict server-side pagination follows to the GitHub REST API host (SSRF mitigation). */
export function assertGitHubApiUrl(url: string): void {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Invalid GitHub API pagination URL')
  }
  if (parsed.protocol !== 'https:' || parsed.origin !== GITHUB_API_ORIGIN) {
    throw new Error('Pagination URL must target https://api.github.com')
  }
}
