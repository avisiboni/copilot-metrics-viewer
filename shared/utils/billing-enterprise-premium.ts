import type { PremiumRequestUsageItem } from '../types/billing-usage'
import { normalizePremiumRequestUsageItem } from './billing-normalize'
import { normalizePremiumMonthlyQuota } from './premium-credits'

type FetchJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string }

async function fetchJson<T>(url: string, headers: HeadersInit): Promise<FetchJsonResult<T>> {
  try {
    const response = await $fetch.raw<T>(url, { headers })
    return { ok: true, data: response._data as T }
  } catch (error: unknown) {
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode)
        : 500
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, status: statusCode, message }
  }
}

export type EnterprisePremiumUserRow = {
  used: number
  quota?: number
  exceedsQuota?: boolean
}

interface PremiumResponse {
  usageItems?: Record<string, unknown>[]
  user?: string
}

const ENTERPRISE_PREMIUM_QUERY = `
query ViewerEnterprises {
  viewer {
    enterprises(first: 10) {
      nodes {
        slug
      }
    }
  }
}
`

type ViewerEnterprisesGraphqlResponse = {
  data?: {
    viewer?: {
      enterprises?: {
        nodes?: Array<{ slug?: string } | null> | null
      }
    }
  }
}

/** Resolve enterprise slug (env override, then GraphQL viewer.enterprises). */
export async function resolveEnterpriseSlug(
  headers: HeadersInit,
  configuredEnterprise?: string,
  logger: Console = console
): Promise<string | undefined> {
  const configured = configuredEnterprise?.trim()
  if (configured) return configured

  try {
    const response = await $fetch.raw<ViewerEnterprisesGraphqlResponse>(
      'https://api.github.com/graphql',
      {
        method: 'POST',
        headers: {
          ...Object.fromEntries(new Headers(headers).entries()),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: ENTERPRISE_PREMIUM_QUERY })
      }
    )
    const slug = response._data?.data?.viewer?.enterprises?.nodes?.find(
      (n) => n && typeof n.slug === 'string' && n.slug.trim()
    )?.slug
    if (slug) return slug.trim()
  } catch (error) {
    logger.warn('Could not resolve enterprise slug via GraphQL:', error)
  }

  return undefined
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

function mergeUserRow(
  map: Map<string, EnterprisePremiumUserRow>,
  login: string,
  quantity: number,
  quota?: number,
  exceedsQuota?: boolean
) {
  const key = login.toLowerCase()
  const existing = map.get(key) || { used: 0 }
  existing.used += quantity
  const normalizedQuota = normalizePremiumMonthlyQuota(quota)
  if (normalizedQuota > 0 && (!existing.quota || normalizedQuota > existing.quota)) {
    existing.quota = normalizedQuota
  }
  if (exceedsQuota) existing.exceedsQuota = true
  map.set(key, existing)
}

function ingestPremiumItems(
  map: Map<string, EnterprisePremiumUserRow>,
  items: PremiumRequestUsageItem[],
  fallbackUser?: string
) {
  for (const item of items) {
    const login = item.username || fallbackUser
    if (!login) continue
    const qty =
      item.netQuantity && item.netQuantity > 0
        ? item.netQuantity
        : item.grossQuantity ?? 0
    if (qty <= 0 && !item.totalMonthlyQuota) continue
    mergeUserRow(map, login, qty, item.totalMonthlyQuota, item.exceedsQuota)
  }
}

/**
 * Enterprise-owned orgs block `?user=` on the org billing API.
 * Per-user PRU requires the enterprise billing API (classic PAT + admin:enterprise).
 */
export async function fetchEnterprisePremiumCreditsByUser(
  enterprise: string,
  org: string,
  logins: string[],
  since: string,
  until: string,
  headers: HeadersInit,
  logger: Console = console
): Promise<Map<string, EnterprisePremiumUserRow>> {
  const map = new Map<string, EnterprisePremiumUserRow>()
  const base = `https://api.github.com/enterprises/${encodeURIComponent(enterprise)}/settings/billing/premium_request/usage`
  const months = monthsInRange(since, until)
  const uniqueLogins = [...new Set(logins.map((l) => l.trim()).filter(Boolean))]

  for (const { year, month } of months) {
    const orgUrl =
      `${base}?year=${year}&month=${month}` +
      `&organization=${encodeURIComponent(org)}`
    const orgResult = await fetchJson<PremiumResponse>(orgUrl, headers)
    if (orgResult.ok) {
      const items = (orgResult.data.usageItems || []).map((raw) =>
        normalizePremiumRequestUsageItem(raw)
      )
      ingestPremiumItems(map, items)
      if (map.size > 0) {
        logger.info(
          `Enterprise premium usage for ${org} ${year}-${month}: ${map.size} users (organization filter)`
        )
        continue
      }
    } else if (orgResult.status !== 403 && orgResult.status !== 404) {
      logger.warn(
        `Enterprise premium org filter failed (${year}-${month}): HTTP ${orgResult.status} ${orgResult.message}`
      )
    }

    const batchSize = 10
    for (let i = 0; i < uniqueLogins.length; i += batchSize) {
      const batch = uniqueLogins.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (login) => {
          const userUrl =
            `${base}?year=${year}&month=${month}` +
            `&organization=${encodeURIComponent(org)}` +
            `&user=${encodeURIComponent(login)}`
          const userResult = await fetchJson<PremiumResponse>(userUrl, headers)
          if (!userResult.ok) {
            if (userResult.status !== 403) {
              logger.warn(
                `Enterprise premium for ${login} (${year}-${month}): HTTP ${userResult.status}`
              )
            }
            return
          }
          const items = (userResult.data.usageItems || []).map((raw) =>
            normalizePremiumRequestUsageItem(raw)
          )
          ingestPremiumItems(map, items, login)
        })
      )
    }
  }

  if (map.size > 0) {
    logger.info(`Enterprise premium credits loaded for ${map.size} users`)
  }

  return map
}
