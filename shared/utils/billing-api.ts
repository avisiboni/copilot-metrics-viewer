import type {
  BillingFetchResult,
  BillingSummaryItem,
  BillingSummaryResponse,
  BillingUsageLineItem,
  BillingUsageReportResponse,
  PremiumRequestUsageItem,
  PremiumRequestUsageResponse
} from '../types/billing-usage'
import {
  billingAuthKey,
  billingCacheKey,
  getCachedBilling,
  setCachedBilling
} from './billing-cache'
import {
  isGithubEnterpriseLicenseSku,
  normalizeBillingUsageLineItem,
  normalizePremiumRequestUsageItem
} from './billing-normalize'

export { billingAlertSummary } from './billing-alert'

type BillingAccount = { kind: 'org'; slug: string } | { kind: 'enterprise'; slug: string }

export type FetchBillingOptions = {
  enterprise?: string
  /** Default true. Set false when premium-by-user credits are disabled. */
  includePremiumRequest?: boolean
  /** Default false — summary covers SKU costs; detailed lines are large for long ranges. */
  includeDetailedUsage?: boolean
  /** Skip cache read/write (tests). */
  bypassCache?: boolean
}

type AccountFetchOptions = {
  includePremiumRequest: boolean
  includeDetailedUsage: boolean
  /** Only fetch usage/summary (optionally filtered). */
  summaryOnly?: boolean
  summarySku?: string
  summaryProduct?: string
}

const MONTH_FETCH_CONCURRENCY = 4

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

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await worker(items[index]!)
    }
  })
  await Promise.all(runners)
  return results
}

type MonthFetchBundle = {
  detailedUsage: BillingUsageLineItem[]
  summaryUsage: BillingSummaryItem[]
  premiumRequestUsage: PremiumRequestUsageItem[]
  premiumApiOk: boolean
  summaryApiOk: boolean
  firstError: { status: number; message: string } | null
  endpointErrors: string[]
  tokenScopes?: string
}

async function fetchBillingMonth(
  account: BillingAccount,
  headers: HeadersInit,
  year: number,
  month: number,
  options: AccountFetchOptions
): Promise<MonthFetchBundle> {
  const base = billingBase(account)
  const label = account.kind === 'enterprise' ? `enterprise ${account.slug}` : `org ${account.slug}`
  const bundle: MonthFetchBundle = {
    detailedUsage: [],
    summaryUsage: [],
    premiumRequestUsage: [],
    premiumApiOk: false,
    summaryApiOk: false,
    firstError: null,
    endpointErrors: []
  }

  const summaryParams = new URLSearchParams({
    year: String(year),
    month: String(month)
  })
  if (options.summarySku) summaryParams.set('sku', options.summarySku)
  if (options.summaryProduct) summaryParams.set('product', options.summaryProduct)

  const summaryUrl = `${base}/usage/summary?${summaryParams.toString()}`
  const summaryResult = await fetchBillingJson<BillingSummaryResponse>(summaryUrl, headers)
  if (summaryResult.scopes) bundle.tokenScopes = summaryResult.scopes
  if (summaryResult.ok) {
    bundle.summaryApiOk = true
    bundle.summaryUsage.push(...(summaryResult.data.usageItems || []))
  } else {
    bundle.endpointErrors.push(
      `${label} usage/summary ${year}-${month}: HTTP ${summaryResult.status}`
    )
    bundle.firstError = { status: summaryResult.status, message: summaryResult.message }
  }

  if (options.summaryOnly) {
    return bundle
  }

  if (options.includePremiumRequest) {
    const premiumUrl = `${base}/premium_request/usage?year=${year}&month=${month}`
    const premiumResult = await fetchBillingJson<PremiumRequestUsageResponse>(premiumUrl, headers)
    if (premiumResult.scopes) bundle.tokenScopes = premiumResult.scopes
    if (premiumResult.ok) {
      bundle.premiumApiOk = true
      for (const raw of premiumResult.data.usageItems || []) {
        bundle.premiumRequestUsage.push(
          normalizePremiumRequestUsageItem(raw as Record<string, unknown>)
        )
      }
    } else {
      bundle.endpointErrors.push(
        `${label} premium_request/usage ${year}-${month}: HTTP ${premiumResult.status}`
      )
      if (!bundle.firstError) {
        bundle.firstError = { status: premiumResult.status, message: premiumResult.message }
      }
    }
  }

  if (options.includeDetailedUsage) {
    const usageUrl = `${base}/usage?year=${year}&month=${month}`
    const usageResult = await fetchBillingJson<BillingUsageReportResponse>(usageUrl, headers)
    if (usageResult.scopes) bundle.tokenScopes = usageResult.scopes
    if (usageResult.ok) {
      for (const raw of usageResult.data.usageItems || []) {
        bundle.detailedUsage.push(
          normalizeBillingUsageLineItem(raw as Record<string, unknown>)
        )
      }
    } else {
      bundle.endpointErrors.push(`${label} usage ${year}-${month}: HTTP ${usageResult.status}`)
      if (!bundle.firstError) {
        bundle.firstError = { status: usageResult.status, message: usageResult.message }
      }
    }
  }

  return bundle
}

async function fetchBillingForAccount(
  account: BillingAccount,
  headers: HeadersInit,
  since: string,
  until: string,
  options: AccountFetchOptions
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
  const monthBundles = await mapPool(months, MONTH_FETCH_CONCURRENCY, ({ year, month }) =>
    fetchBillingMonth(account, headers, year, month, options)
  )

  const detailedUsage: BillingFetchResult['detailedUsage'] = []
  const summaryUsage: BillingFetchResult['summaryUsage'] = []
  const premiumRequestUsage: BillingFetchResult['premiumRequestUsage'] = []
  let premiumApiOk = false
  let summaryApiOk = false
  let firstError: { status: number; message: string } | null = null
  const endpointErrors: string[] = []
  let tokenScopes: string | undefined

  for (const bundle of monthBundles) {
    detailedUsage.push(...bundle.detailedUsage)
    summaryUsage.push(...bundle.summaryUsage)
    premiumRequestUsage.push(...bundle.premiumRequestUsage)
    premiumApiOk = premiumApiOk || bundle.premiumApiOk
    summaryApiOk = summaryApiOk || bundle.summaryApiOk
    if (bundle.tokenScopes) tokenScopes = bundle.tokenScopes
    endpointErrors.push(...bundle.endpointErrors)
    if (!firstError && bundle.firstError) firstError = bundle.firstError
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

/** Lightweight enterprise fetch for GitHub Enterprise Cloud license SKUs only. */
async function fetchEnterpriseGhecLicenses(
  enterprise: string,
  headers: HeadersInit,
  since: string,
  until: string,
  logger: Console
): Promise<{
  summaryUsage: BillingSummaryItem[]
  detailedUsage: BillingUsageLineItem[]
  endpointErrors: string[]
  tokenScopes?: string
}> {
  const result = await fetchBillingForAccount(
    { kind: 'enterprise', slug: enterprise },
    headers,
    since,
    until,
    {
      includePremiumRequest: false,
      includeDetailedUsage: false,
      summaryOnly: true,
      summarySku: 'ghec_licenses',
      summaryProduct: 'ghec'
    }
  )

  const summaryUsage = result.summaryUsage.filter((item) =>
    isGithubEnterpriseLicenseSku(item.sku, item.product)
  )

  // Some tenants ignore sku/product filters — fall back to unfiltered summary once if empty.
  if (!summaryUsage.length && result.summaryApiOk) {
    logger.info(
      `No ghec_licenses via filtered summary for enterprise ${enterprise}; scanning unfiltered enterprise summary`
    )
    const full = await fetchBillingForAccount(
      { kind: 'enterprise', slug: enterprise },
      headers,
      since,
      until,
      {
        includePremiumRequest: false,
        includeDetailedUsage: false,
        summaryOnly: true
      }
    )
    return {
      summaryUsage: full.summaryUsage.filter((item) =>
        isGithubEnterpriseLicenseSku(item.sku, item.product)
      ),
      detailedUsage: [],
      endpointErrors: [...result.endpointErrors, ...full.endpointErrors],
      tokenScopes: full.tokenScopes || result.tokenScopes
    }
  }

  return {
    summaryUsage,
    detailedUsage: [],
    endpointErrors: result.endpointErrors,
    tokenScopes: result.tokenScopes
  }
}

function resolveFetchFlags(options?: FetchBillingOptions): {
  includePremiumRequest: boolean
  includeDetailedUsage: boolean
} {
  return {
    includePremiumRequest: options?.includePremiumRequest !== false,
    includeDetailedUsage: options?.includeDetailedUsage === true
  }
}

export async function fetchOrganizationBilling(
  org: string,
  headers: HeadersInit,
  since: string,
  until: string,
  logger: Console,
  options?: FetchBillingOptions
): Promise<BillingFetchResult> {
  const flags = resolveFetchFlags(options)
  const authKey = billingAuthKey(headers)
  const cacheKey = billingCacheKey({
    authKey,
    org,
    enterprise: options?.enterprise,
    since,
    until,
    includePremiumRequest: flags.includePremiumRequest,
    includeDetailedUsage: flags.includeDetailedUsage
  })

  if (!options?.bypassCache) {
    const cached = getCachedBilling(cacheKey)
    if (cached) {
      logger.info(`Returning cached billing usage for ${org} (${since}→${until})`)
      return cached
    }
  }

  let result = await fetchBillingForAccount(
    { kind: 'org', slug: org },
    headers,
    since,
    until,
    {
      includePremiumRequest: flags.includePremiumRequest,
      includeDetailedUsage: flags.includeDetailedUsage
    }
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
      until,
      {
        includePremiumRequest: flags.includePremiumRequest,
        includeDetailedUsage: flags.includeDetailedUsage
      }
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
  } else if (orgApiWorks && options?.enterprise?.trim()) {
    const ghec = await fetchEnterpriseGhecLicenses(
      options.enterprise.trim(),
      headers,
      since,
      until,
      logger
    )
    if (ghec.tokenScopes) {
      result.tokenScopes = result.tokenScopes || ghec.tokenScopes
    }
    if (ghec.summaryUsage.length) {
      result.summaryUsage.push(...ghec.summaryUsage)
      logger.info(
        `Merged ${ghec.summaryUsage.length} GitHub Enterprise license line(s) from enterprise ${options.enterprise}`
      )
    } else if (ghec.endpointErrors.length) {
      // Keep org billing usable; GHEC license lookup is best-effort.
      result.endpointErrors.push(...ghec.endpointErrors.slice(0, 3))
    }
  }

  const hasData =
    result.detailedUsage.length > 0 ||
    result.summaryUsage.length > 0 ||
    result.premiumRequestUsage.length > 0

  const apiWorks = result.premiumApiOk || result.summaryApiOk || hasData

  if (apiWorks) {
    const payload: BillingFetchResult = {
      available: true,
      detailedUsage: result.detailedUsage,
      summaryUsage: result.summaryUsage,
      premiumRequestUsage: result.premiumRequestUsage,
      tokenScopes: result.tokenScopes,
      httpStatus: undefined,
      endpointErrors: result.endpointErrors.length ? result.endpointErrors : undefined
    }
    if (!options?.bypassCache) {
      setCachedBilling(cacheKey, payload)
    }
    return payload
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
