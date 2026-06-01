import type {
  BillingFetchResult,
  BillingSummaryResponse,
  BillingUsageReportResponse,
  PremiumRequestUsageResponse
} from '../types/billing-usage'
import {
  normalizeBillingUsageLineItem,
  normalizePremiumRequestUsageItem
} from './billing-normalize'

type BillingAccount = { kind: 'org'; slug: string } | { kind: 'enterprise'; slug: string }

function billingBase(account: BillingAccount): string {
  if (account.kind === 'enterprise') {
    return `https://api.github.com/enterprises/${encodeURIComponent(account.slug)}/settings/billing`
  }
  return `https://api.github.com/organizations/${encodeURIComponent(account.slug)}/settings/billing`
}

type FetchBillingJsonResult<T> =
  | { ok: true; data: T; scopes?: string }
  | { ok: false; status: number; message: string; scopes?: string }

function readOAuthScopes(headers: Headers | undefined): string | undefined {
  if (!headers) return undefined
  return headers.get('x-oauth-scopes') || headers.get('X-OAuth-Scopes') || undefined
}

async function fetchBillingJson<T>(
  url: string,
  headers: HeadersInit
): Promise<FetchBillingJsonResult<T>> {
  try {
    const response = await $fetch.raw<T>(url, { headers })
    return {
      ok: true,
      data: response._data as T,
      scopes: readOAuthScopes(response.headers)
    }
  } catch (error: unknown) {
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode)
        : 500
    const message = error instanceof Error ? error.message : String(error)
    const scopes =
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response?: { headers?: Headers } }).response?.headers
        ? readOAuthScopes((error as { response: { headers: Headers } }).response.headers)
        : undefined
    return { ok: false, status: statusCode, message, scopes }
  }
}

function monthsInRange(since: string, until: string): Array<{ year: number; month: number }> {
  const start = new Date(`${since}T00:00:00.000Z`)
  const end = new Date(`${until}T00:00:00.000Z`)
  const months: Array<{ year: number; month: number }> = []
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))

  while (cursor <= end) {
    months.push({ year: cursor.getUTCFullYear(), month: cursor.getUTCMonth() + 1 })
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  return months
}

function missingCopilotBillingScope(scopes?: string): boolean {
  if (!scopes) return false
  const parts = scopes.split(',').map((s) => s.trim().toLowerCase())
  return !parts.includes('manage_billing:copilot')
}

/** One-line summary for collapsed billing alerts in the UI. */
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

function buildUnavailableReason(params: {
  accountLabel: string
  firstError: { status: number; message: string } | null
  endpointErrors: string[]
  tokenScopes?: string
}): string {
  const lines: string[] = []
  const { firstError, endpointErrors, tokenScopes, accountLabel } = params

  if (firstError?.status === 404) {
    lines.push(
      `GitHub Billing Usage API returned HTTP 404 for ${accountLabel}.`
    )
    lines.push(
      'This usually means the token lacks billing permission, you are not an org/enterprise admin, or the org is not on the enhanced billing platform (for the /usage endpoint).'
    )
  } else if (firstError?.status === 403) {
    lines.push(`GitHub Billing API returned HTTP 403 for ${accountLabel} (forbidden).`)
    lines.push('Sign in as an organization or enterprise owner with billing access.')
  } else if (firstError) {
    lines.push(`Billing API error (${firstError.status}): ${firstError.message}`)
  } else {
    lines.push('Billing usage data could not be loaded.')
  }

  if (endpointErrors.length) {
    lines.push(`Endpoints: ${endpointErrors.join('; ')}`)
  }

  if (tokenScopes) {
    lines.push(`Token scopes: ${tokenScopes}`)
    if (missingCopilotBillingScope(tokenScopes)) {
      lines.push(
        'Missing manage_billing:copilot — add it to your GitHub App / PAT / OAuth scopes, then sign out and sign in again.'
      )
    }
  } else {
    lines.push(
      'Ensure the token includes manage_billing:copilot (and org admin access), then re-authenticate.'
    )
  }

  return lines.join(' ')
}

async function fetchBillingForAccount(
  account: BillingAccount,
  headers: HeadersInit,
  since: string,
  until: string
): Promise<{
  detailedUsage: BillingFetchResult['detailedUsage']
  summaryUsage: BillingFetchResult['summaryUsage']
  premiumRequestUsage: BillingFetchResult['premiumRequestUsage']
  premiumApiOk: boolean
  summaryApiOk: boolean
  firstError: { status: number; message: string } | null
  endpointErrors: string[]
  tokenScopes?: string
}> {
  const months = monthsInRange(since, until)
  const base = billingBase(account)
  const label = account.kind === 'enterprise' ? `enterprise ${account.slug}` : `org ${account.slug}`

  const detailedUsage: BillingFetchResult['detailedUsage'] = []
  const summaryUsage: BillingFetchResult['summaryUsage'] = []
  const premiumRequestUsage: BillingFetchResult['premiumRequestUsage'] = []

  let premiumApiOk = false
  let summaryApiOk = false
  let firstError: { status: number; message: string } | null = null
  const endpointErrors: string[] = []
  let tokenScopes: string | undefined

  for (const { year, month } of months) {
    const premiumUrl = `${base}/premium_request/usage?year=${year}&month=${month}`
    const premiumResult = await fetchBillingJson<PremiumRequestUsageResponse>(premiumUrl, headers)
    if (premiumResult.scopes) tokenScopes = premiumResult.scopes
    if (premiumResult.ok) {
      premiumApiOk = true
      for (const raw of premiumResult.data.usageItems || []) {
        premiumRequestUsage.push(
          normalizePremiumRequestUsageItem(raw as Record<string, unknown>)
        )
      }
    } else {
      endpointErrors.push(`${label} premium_request/usage ${year}-${month}: HTTP ${premiumResult.status}`)
      if (!firstError) {
        firstError = { status: premiumResult.status, message: premiumResult.message }
      }
    }

    const summaryUrl = `${base}/usage/summary?year=${year}&month=${month}`
    const summaryResult = await fetchBillingJson<BillingSummaryResponse>(summaryUrl, headers)
    if (summaryResult.scopes) tokenScopes = summaryResult.scopes
    if (summaryResult.ok) {
      summaryApiOk = true
      summaryUsage.push(...(summaryResult.data.usageItems || []))
    } else {
      endpointErrors.push(`${label} usage/summary ${year}-${month}: HTTP ${summaryResult.status}`)
      if (!firstError) {
        firstError = { status: summaryResult.status, message: summaryResult.message }
      }
    }

    const usageUrl = `${base}/usage?year=${year}&month=${month}`
    const usageResult = await fetchBillingJson<BillingUsageReportResponse>(usageUrl, headers)
    if (usageResult.scopes) tokenScopes = usageResult.scopes
    if (usageResult.ok) {
      for (const raw of usageResult.data.usageItems || []) {
        detailedUsage.push(
          normalizeBillingUsageLineItem(raw as Record<string, unknown>)
        )
      }
    } else {
      endpointErrors.push(`${label} usage ${year}-${month}: HTTP ${usageResult.status}`)
      if (!firstError) {
        firstError = { status: usageResult.status, message: usageResult.message }
      }
    }
  }

  return {
    detailedUsage,
    summaryUsage,
    premiumRequestUsage,
    premiumApiOk,
    summaryApiOk,
    firstError,
    endpointErrors,
    tokenScopes
  }
}

export async function fetchOrganizationBilling(
  org: string,
  headers: HeadersInit,
  since: string,
  until: string,
  logger: Console,
  options?: { enterprise?: string }
): Promise<BillingFetchResult> {
  let result = await fetchBillingForAccount(
    { kind: 'org', slug: org },
    headers,
    since,
    until
  )

  const hasLineItems =
    result.detailedUsage.length > 0 ||
    result.summaryUsage.length > 0 ||
    result.premiumRequestUsage.length > 0

  const orgApiWorks = result.premiumApiOk || result.summaryApiOk || hasLineItems

  if (!orgApiWorks && options?.enterprise?.trim()) {
    logger.warn(
      `Billing API unavailable for org ${org}; trying enterprise ${options.enterprise}`
    )
    const entResult = await fetchBillingForAccount(
      { kind: 'enterprise', slug: options.enterprise.trim() },
      headers,
      since,
      until
    )
    const entHasLineItems =
      entResult.detailedUsage.length > 0 ||
      entResult.summaryUsage.length > 0 ||
      entResult.premiumRequestUsage.length > 0
    const entApiWorks =
      entResult.premiumApiOk || entResult.summaryApiOk || entHasLineItems

    if (entApiWorks) {
      result = entResult
    } else {
      result.endpointErrors.push(...entResult.endpointErrors)
      if (!result.firstError && entResult.firstError) {
        result.firstError = entResult.firstError
      }
      if (entResult.tokenScopes) {
        result.tokenScopes = entResult.tokenScopes
      }
    }
  }

  const hasData =
    result.detailedUsage.length > 0 ||
    result.summaryUsage.length > 0 ||
    result.premiumRequestUsage.length > 0

  const apiWorks = result.premiumApiOk || result.summaryApiOk || hasData

  if (apiWorks) {
    return {
      available: true,
      detailedUsage: result.detailedUsage,
      summaryUsage: result.summaryUsage,
      premiumRequestUsage: result.premiumRequestUsage,
      tokenScopes: result.tokenScopes,
      httpStatus: undefined,
      endpointErrors: result.endpointErrors.length ? result.endpointErrors : undefined
    }
  }

  const reason = buildUnavailableReason({
    accountLabel: `org ${org}`,
    firstError: result.firstError,
    endpointErrors: result.endpointErrors,
    tokenScopes: result.tokenScopes
  })

  logger.warn('Billing API unavailable:', reason)
  return {
    available: false,
    reason,
    detailedUsage: [],
    summaryUsage: [],
    premiumRequestUsage: [],
    tokenScopes: result.tokenScopes,
    httpStatus: result.firstError?.status,
    endpointErrors: result.endpointErrors
  }
}
