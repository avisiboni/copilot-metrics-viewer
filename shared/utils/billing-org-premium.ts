import type { PremiumRequestUsageItem } from '../types/billing-usage'
import { normalizePremiumRequestUsageItem } from './billing-normalize'
import type { EnterprisePremiumUserRow } from './billing-enterprise-premium'
import { normalizePremiumMonthlyQuota } from './premium-credits'

type FetchJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string }

interface PremiumResponse {
  usageItems?: Record<string, unknown>[]
  user?: string
}

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

function isEnterpriseOwnedOrgUserFilterBlock(status: number, message: string): boolean {
  if (status !== 403) return false
  const lower = message.toLowerCase()
  return (
    lower.includes('cannot filter usage by user') ||
    lower.includes('enterprise owned organizations')
  )
}

/**
 * Per-user PRU via org billing API: `GET .../orgs/{org}/settings/billing/premium_request/usage?user=`.
 * The bulk org call (no `user`) only returns model-level rows without `username` — same data shape
 * without `username` on each line — per-user data requires `?user=` on this endpoint.
 */
export async function fetchOrgPremiumCreditsByUser(
  org: string,
  logins: string[],
  since: string,
  until: string,
  headers: HeadersInit,
  logger: Console = console
): Promise<{
  rows: Map<string, EnterprisePremiumUserRow>
  userFilterBlocked: boolean
}> {
  const map = new Map<string, EnterprisePremiumUserRow>()
  const base = `https://api.github.com/organizations/${encodeURIComponent(org)}/settings/billing/premium_request/usage`
  const months = monthsInRange(since, until)
  const uniqueLogins = [...new Set(logins.map((l) => l.trim()).filter(Boolean))]
  let userFilterBlocked = false

  for (const { year, month } of months) {
    const batchSize = 10
    for (let i = 0; i < uniqueLogins.length; i += batchSize) {
      if (userFilterBlocked) break
      const batch = uniqueLogins.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (login) => {
          const userUrl =
            `${base}?year=${year}&month=${month}` +
            `&user=${encodeURIComponent(login)}`
          const userResult = await fetchJson<PremiumResponse>(userUrl, headers)
          if (!userResult.ok) {
            if (isEnterpriseOwnedOrgUserFilterBlock(userResult.status, userResult.message)) {
              userFilterBlocked = true
              logger.warn(
                `Org billing API blocks ?user= for ${org} (enterprise-owned org). Use enterprise billing API or NUXT_PUBLIC_GITHUB_ENT.`
              )
              return
            }
            if (userResult.status !== 404) {
              logger.warn(
                `Org premium for ${login} (${year}-${month}): HTTP ${userResult.status} ${userResult.message}`
              )
            }
            return
          }
          const responseUser = userResult.data.user?.trim() || login
          const items = (userResult.data.usageItems || []).map((raw) =>
            normalizePremiumRequestUsageItem({
              ...(raw as Record<string, unknown>),
              username:
                (raw as Record<string, unknown>).username ?? responseUser
            })
          )
          ingestPremiumItems(map, items, responseUser)
        })
      )
    }
    if (userFilterBlocked) break
  }

  if (map.size > 0) {
    logger.info(`Org premium credits loaded via ?user= for ${map.size} users`)
  }

  return { rows: map, userFilterBlocked }
}
