/** One-line summary for collapsed billing alerts in the UI (client-safe). */

function missingCopilotBillingScope(scopes?: string): boolean {
  if (!scopes) return false
  const parts = scopes.split(',').map((s) => s.trim().toLowerCase())
  return !parts.includes('manage_billing:copilot')
}

export function billingAlertSummary(billing: {
  httpStatus?: number
  tokenScopes?: string
}): string {
  const parts: string[] = []
  if (billing.httpStatus) {
    parts.push(`HTTP ${billing.httpStatus}`)
  }
  if (missingCopilotBillingScope(billing.tokenScopes)) {
    parts.push('missing manage_billing:copilot')
  }
  return parts.length ? parts.join(' · ') : 'Click to expand details'
}
