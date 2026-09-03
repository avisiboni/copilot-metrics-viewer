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

function isEnterpriseOwnedOrgUserFilterBlock(status: number, message: string): boolean {
  if (status !== 403) return false
  const lower = message.toLowerCase()
  return (
    lower.includes('cannot filter usage by user') ||
    lower.includes('enterprise owned organizations')
  )
}

/**
 * Per-user AI credits via org billing API:
 * `GET .../organizations/{org}/settings/billing/ai_credit/usage?user=`.
 */
export async function fetchOrgAiCreditsByUser(
  org: string,
  logins: string[],
  since: string,
  until: string,
  headers: HeadersInit,
  logger: Console = console
): Promise<{
  rows: Map<string, AiCreditsUserRow>
  userFilterBlocked: boolean
}> {
  const map = new Map<string, AiCreditsUserRow>()
  const base = `https://api.github.com/organizations/${encodeURIComponent(org)}/settings/billing/ai_credit/usage`
  const months = monthsInRange(since, until)
  const uniqueLogins = [...new Set(logins.map((l) => l.trim()).filter(Boolean))]
  let userFilterBlocked = false

  for (const { year, month } of months) {
    const batchSize = 10
    let consecutiveForbiddenBatches = 0
    for (let i = 0; i < uniqueLogins.length; i += batchSize) {
      if (userFilterBlocked) break
      const batch = uniqueLogins.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(async (login) => {
          const userUrl =
            `${base}?year=${year}&month=${month}` +
            `&user=${encodeURIComponent(login)}`
          const userResult = await fetchJson<AiCreditResponse>(userUrl, headers)
          if (!userResult.ok) {
            if (isEnterpriseOwnedOrgUserFilterBlock(userResult.status, userResult.message)) {
              userFilterBlocked = true
              logger.warn(
                `Org AI credits API blocks ?user= for ${org} (enterprise-owned org). Use enterprise billing API or NUXT_PUBLIC_GITHUB_ENT.`
              )
              return 'blocked' as const
            }
            if (userResult.status !== 404) {
              logger.warn(
                `Org AI credits for ${login} (${year}-${month}): HTTP ${userResult.status} ${userResult.message}`
              )
            }
            return userResult.status === 403 ? ('forbidden' as const) : ('error' as const)
          }
          const responseUser = userResult.data.user?.trim() || login
          const items = (userResult.data.usageItems || []).map((raw) =>
            normalizePremiumRequestUsageItem({
              ...(raw as Record<string, unknown>),
              username:
                (raw as Record<string, unknown>).username ?? responseUser
            })
          )
          ingestAiCreditItems(map, items, responseUser)
          return 'ok' as const
        })
      )
      if (userFilterBlocked) break
      const allForbidden =
        batchResults.length > 0 && batchResults.every((r) => r === 'forbidden' || r === 'blocked')
      if (allForbidden) {
        consecutiveForbiddenBatches += 1
      } else if (batchResults.some((r) => r === 'ok')) {
        consecutiveForbiddenBatches = 0
      }
      // Enterprise-owned orgs often return generic 403s for every ?user= call.
      if (consecutiveForbiddenBatches >= 2) {
        userFilterBlocked = true
        logger.warn(
          `Org AI credits: stopping after repeated HTTP 403 batches for ${org} (likely no per-user access).`
        )
        break
      }
    }
    if (userFilterBlocked) break
  }

  if (map.size > 0) {
    logger.info(`Org AI credits loaded via ?user= for ${map.size} users`)
  }

  return { rows: map, userFilterBlocked }
}
