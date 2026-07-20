/** GitHub REST API version required for Copilot usage metrics endpoints. */
export const COPILOT_USAGE_METRICS_API_VERSION = '2026-03-10'

/** Apply the Copilot usage metrics API version to outgoing GitHub REST headers. */
export function withCopilotMetricsApiHeaders(headers: HeadersInit): Headers {
  const out = new Headers(headers)
  out.set('X-GitHub-Api-Version', COPILOT_USAGE_METRICS_API_VERSION)
  if (!out.has('Accept')) {
    out.set('Accept', 'application/vnd.github+json')
  }
  return out
}
