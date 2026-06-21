import type { PremiumRequestUsageItem } from '../types/billing-usage'
import { normalizePremiumRequestUsageItem } from './billing-normalize'
import type { AiCreditsUserRow } from './ai-credits'
import { usageNumber } from '../types/copilot-usage'
import { aiCreditQuantityFromPremiumItem } from './ai-credits'

type FetchJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string }

interface AiCreditResponse {
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
  map: Map<string, AiCreditsUserRow>,
  login: string,
  quantity: number,
  amount: number,
  exceedsQuota?: boolean
) {
  const key = login.toLowerCase()
  const existing = map.get(key) || { used: 0, netAmount: 0 }
  existing.used += quantity
  existing.netAmount += amount
  if (exceedsQuota) existing.exceedsQuota = true
  map.set(key, existing)
}

function ingestAiCreditItems(
  map: Map<string, AiCreditsUserRow>,
  items: PremiumRequestUsageItem[],
  fallbackUser?: string
) {
  for (const item of items) {
    const login = item.username || fallbackUser
    if (!login) continue
    const qty = aiCreditQuantityFromPremiumItem(item)
    const amount = usageNumber(item.netAmount ?? item.grossAmount)
    if (qty <= 0 && amount <= 0) continue
    mergeUserRow(map, login, qty, amount, item.exceedsQuota)
  }
}

/**
 * Enterprise-owned orgs block `?user=` on the org billing API.
 * Per-user AI credits require the enterprise billing API.
 */
export async function fetchEnterpriseAiCreditsByUser(
  enterprise: string,
  org: string,
  logins: string[],
  since: string,
  until: string,
  headers: HeadersInit,
  logger: Console = console
): Promise<Map<string, AiCreditsUserRow>> {
  const map = new Map<string, AiCreditsUserRow>()
  const base = `https://api.github.com/enterprises/${encodeURIComponent(enterprise)}/settings/billing/ai_credit/usage`
  const months = monthsInRange(since, until)
  const uniqueLogins = [...new Set(logins.map((l) => l.trim()).filter(Boolean))]

  for (const { year, month } of months) {
    const orgUrl =
      `${base}?year=${year}&month=${month}` +
      `&organization=${encodeURIComponent(org)}`
    const orgResult = await fetchJson<AiCreditResponse>(orgUrl, headers)
    if (orgResult.ok) {
      const items = (orgResult.data.usageItems || []).map((raw) =>
        normalizePremiumRequestUsageItem(raw)
      )
      ingestAiCreditItems(map, items)
      if (map.size > 0) {
        logger.info(
          `Enterprise AI credits for ${org} ${year}-${month}: ${map.size} users (organization filter)`
        )
        continue
      }
    } else if (orgResult.status !== 403 && orgResult.status !== 404) {
      logger.warn(
        `Enterprise AI credits org filter failed (${year}-${month}): HTTP ${orgResult.status} ${orgResult.message}`
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
          const userResult = await fetchJson<AiCreditResponse>(userUrl, headers)
          if (!userResult.ok) {
            if (userResult.status !== 403) {
              logger.warn(
                `Enterprise AI credits for ${login} (${year}-${month}): HTTP ${userResult.status}`
              )
            }
            return
          }
          const items = (userResult.data.usageItems || []).map((raw) =>
            normalizePremiumRequestUsageItem(raw)
          )
          ingestAiCreditItems(map, items, login)
        })
      )
    }
  }

  if (map.size > 0) {
    logger.info(`Enterprise AI credits loaded for ${map.size} users`)
  }

  return map
}
