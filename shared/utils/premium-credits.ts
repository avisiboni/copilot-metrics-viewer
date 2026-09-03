import type { BillingFetchResult } from '../types/billing-usage'
import type { UserPremiumCredits } from '../types/copilot-usage'
import { usageNumber } from '../types/copilot-usage'
import type { EnterprisePremiumUserRow } from './billing-enterprise-premium'
import {
  isPremiumRequestSku,
  premiumQuantityFromPremiumItem,
  premiumQuantityFromUsageLine
} from './billing-normalize'

export const DEFAULT_ENTERPRISE_MONTHLY_PREMIUM_QUOTA = 1000

/** GitHub billing exports use INT_MAX when quota is not capped on a row. */
const GITHUB_UNLIMITED_QUOTA_MARKER = 2_147_483_647
const MAX_REASONABLE_MONTHLY_PRU_QUOTA = 10_000

export function normalizePremiumMonthlyQuota(
  quota: number | undefined,
  defaultQuota: number = DEFAULT_ENTERPRISE_MONTHLY_PREMIUM_QUOTA
): number {
  if (!quota || quota <= 0) return defaultQuota
  if (quota >= GITHUB_UNLIMITED_QUOTA_MARKER || quota > MAX_REASONABLE_MONTHLY_PRU_QUOTA) {
    return defaultQuota
  }
  return quota
}

export function aggregatePremiumCreditsByUser(
  billing: BillingFetchResult,
  defaultQuota: number = DEFAULT_ENTERPRISE_MONTHLY_PREMIUM_QUOTA
): Map<string, UserPremiumCredits> {
  const map = new Map<
    string,
    { used: number; quota?: number; exceedsQuota?: boolean }
  >()

  const add = (
    username: string,
    quantity: number,
    quota?: number,
    exceedsQuota?: boolean
  ) => {
    const key = username.toLowerCase()
    const existing = map.get(key) || { used: 0 }
    existing.used += quantity
    const normalizedQuota = normalizePremiumMonthlyQuota(quota, defaultQuota)
    if (
      normalizedQuota > 0 &&
      (!existing.quota || normalizedQuota > existing.quota)
    ) {
      existing.quota = normalizedQuota
    }
    if (exceedsQuota) {
      existing.exceedsQuota = true
    }
    map.set(key, existing)
  }

  for (const item of billing.detailedUsage) {
    if (!isPremiumRequestSku(item.sku) || !item.username) continue
    add(
      String(item.username),
      premiumQuantityFromUsageLine(item),
      item.totalMonthlyQuota,
      item.exceedsQuota
    )
  }

  for (const item of billing.premiumRequestUsage) {
    if (!item.username) continue
    add(
      String(item.username),
      premiumQuantityFromPremiumItem(item),
      item.totalMonthlyQuota,
      item.exceedsQuota
    )
  }

  return rowsToCreditsMap(map, defaultQuota)
}

export function aggregatePremiumCreditsFromEnterpriseRows(
  rows: Map<string, EnterprisePremiumUserRow>,
  defaultQuota: number = DEFAULT_ENTERPRISE_MONTHLY_PREMIUM_QUOTA
): Map<string, UserPremiumCredits> {
  const map = new Map<
    string,
    { used: number; quota?: number; exceedsQuota?: boolean }
  >()
  for (const [login, row] of rows) {
    map.set(login, {
      used: row.used,
      quota: row.quota,
      exceedsQuota: row.exceedsQuota
    })
  }
  return rowsToCreditsMap(map, defaultQuota)
}

function rowsToCreditsMap(
  map: Map<string, { used: number; quota?: number; exceedsQuota?: boolean }>,
  defaultQuota: number
): Map<string, UserPremiumCredits> {
  const result = new Map<string, UserPremiumCredits>()
  for (const [login, row] of map) {
    const quota = normalizePremiumMonthlyQuota(row.quota, defaultQuota)
    const used = Math.min(row.used, quota)
    const remaining = Math.max(0, quota - used)
    const percentUsed =
      quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0
    const percentRemaining =
      quota > 0 ? Math.max(0, Math.round((remaining / quota) * 100)) : 0
    result.set(login, {
      used,
      quota,
      remaining,
      percentUsed,
      percentRemaining,
      exceedsQuota: row.exceedsQuota,
      source: 'billing'
    })
  }
  return result
}

export function mergePremiumCreditsMaps(
  ...maps: Array<Map<string, UserPremiumCredits>>
): Map<string, UserPremiumCredits> {
  const merged = new Map<string, UserPremiumCredits>()
  for (const map of maps) {
    for (const [login, credits] of map) {
      const key = login.toLowerCase()
      const existing = merged.get(key)
      if (!existing || credits.used > existing.used) {
        merged.set(key, credits)
      }
    }
  }
  return merged
}

export function buildPremiumCreditsForUser(
  login: string,
  creditsMap: Map<string, UserPremiumCredits>
): UserPremiumCredits | undefined {
  return creditsMap.get(login.toLowerCase())
}

/** Shown when billing API works but per-user PRU is not available for this org. */
export function buildUnavailablePremiumCredits(
  defaultQuota: number
): UserPremiumCredits {
  return {
    used: 0,
    quota: defaultQuota,
    remaining: defaultQuota,
    percentUsed: 0,
    percentRemaining: 100,
    source: 'unavailable'
  }
}

/** Bar color from remaining level (% left). */
export function premiumCreditsProgressColor(
  percentRemaining: number,
  source?: UserPremiumCredits['source']
): string {
  if (source === 'unavailable') return 'grey'
  if (percentRemaining <= 15) return 'error'
  if (percentRemaining <= 40) return 'warning'
  return 'primary'
}

export interface LeaderboardCreditsRow {
  user_login: string
}

export function enrichRowsWithPremiumCredits<T extends LeaderboardCreditsRow>(
  rows: T[],
  billing: BillingFetchResult,
  defaultQuota: number,
  premiumByUser: Array<{ user_login: string; netQuantity: number; netAmount?: number }>,
  options?: {
    billingLoaded?: boolean
    perUserUnavailable?: boolean
    creditsMap?: Map<string, UserPremiumCredits>
  }
): Array<T & { premium_credits?: UserPremiumCredits; pruNetAmount?: number }> {
  if (!billing.available && !options?.billingLoaded) {
    return rows
  }

  const creditsMap =
    options?.creditsMap ?? aggregatePremiumCreditsByUser(billing, defaultQuota)
  const pruByLogin = new Map(
    premiumByUser.map((p) => [p.user_login.toLowerCase(), p])
  )
  const perUserUnavailable = options?.perUserUnavailable ?? false
  const billingLoaded = options?.billingLoaded ?? billing.available

  return rows.map((row) => {
    let premium_credits = buildPremiumCreditsForUser(row.user_login, creditsMap)
    const pru = pruByLogin.get(row.user_login.toLowerCase())

    if (!premium_credits && billingLoaded && perUserUnavailable) {
      premium_credits = buildUnavailablePremiumCredits(defaultQuota)
    }

    if (premium_credits && pru && pru.netQuantity > premium_credits.used) {
      const used = Math.min(pru.netQuantity, premium_credits.quota)
      const quota = premium_credits.quota
      const remaining = Math.max(0, quota - used)
      premium_credits = {
        ...premium_credits,
        used,
        remaining,
        percentUsed:
          quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0,
        percentRemaining:
          quota > 0 ? Math.max(0, Math.round((remaining / quota) * 100)) : 0,
        source: 'billing'
      }
    }

    return {
      ...row,
      premium_credits,
      pruNetAmount: pru?.netAmount
    }
  })
}

export function currentUtcMonthRange(): { since: string; until: string; label: string } {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const start = new Date(Date.UTC(year, month, 1))
  const end = new Date(Date.UTC(year, month + 1, 0))
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const monthName = start.toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  })
  return {
    since: fmt(start),
    until: fmt(end),
    label: monthName
  }
}
