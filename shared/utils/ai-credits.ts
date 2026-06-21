import type { BillingFetchResult } from '../types/billing-usage'
import type { UserAiCredits } from '../types/copilot-usage'
import { usageNumber } from '../types/copilot-usage'
import type { PremiumRequestUsageItem } from '../types/billing-usage'
import {
  isAiCreditsSku,
  premiumQuantityFromPremiumItem,
  premiumQuantityFromUsageLine
} from './billing-normalize'

export type AiCreditsUserRow = {
  used: number
  netAmount: number
  exceedsQuota?: boolean
}

export function aiCreditQuantityFromPremiumItem(item: PremiumRequestUsageItem): number {
  return premiumQuantityFromPremiumItem(item)
}

export function aggregateAiCreditsByUser(
  billing: BillingFetchResult
): Map<string, UserAiCredits> {
  const map = new Map<string, AiCreditsUserRow>()

  const add = (
    username: string,
    quantity: number,
    amount: number,
    exceedsQuota?: boolean
  ) => {
    const key = username.toLowerCase()
    const existing = map.get(key) || { used: 0, netAmount: 0 }
    existing.used += quantity
    existing.netAmount += amount
    if (exceedsQuota) existing.exceedsQuota = true
    map.set(key, existing)
  }

  for (const item of billing.detailedUsage) {
    if (!isAiCreditsSku(item.sku) || !item.username) continue
    add(
      String(item.username),
      premiumQuantityFromUsageLine(item),
      usageNumber(item.netAmount),
      item.exceedsQuota
    )
  }

  return rowsToCreditsMap(map)
}

export function aggregateAiCreditsFromUserRows(
  rows: Map<string, AiCreditsUserRow>
): Map<string, UserAiCredits> {
  return rowsToCreditsMap(rows)
}

function rowsToCreditsMap(map: Map<string, AiCreditsUserRow>): Map<string, UserAiCredits> {
  const result = new Map<string, UserAiCredits>()
  for (const [login, row] of map) {
    if (row.used <= 0 && row.netAmount <= 0) continue
    result.set(login, {
      used: row.used,
      netAmount: row.netAmount > 0 ? row.netAmount : undefined,
      exceedsQuota: row.exceedsQuota,
      source: 'billing'
    })
  }
  return result
}

export function buildAiCreditsForUser(
  login: string,
  creditsMap: Map<string, UserAiCredits>
): UserAiCredits | undefined {
  return creditsMap.get(login.toLowerCase())
}

export function buildUnavailableAiCredits(): UserAiCredits {
  return {
    used: 0,
    source: 'unavailable'
  }
}

export type LeaderboardAiCreditsRow = { user_login: string }

export function enrichRowsWithAiCredits<T extends LeaderboardAiCreditsRow>(
  rows: T[],
  billing: BillingFetchResult,
  options?: {
    billingLoaded?: boolean
    perUserUnavailable?: boolean
    creditsMap?: Map<string, UserAiCredits>
  }
): Array<T & { ai_credits?: UserAiCredits }> {
  if (!billing.available && !options?.billingLoaded) {
    return rows
  }

  const creditsMap = options?.creditsMap ?? aggregateAiCreditsByUser(billing)
  const perUserUnavailable = options?.perUserUnavailable ?? false
  const billingLoaded = options?.billingLoaded ?? billing.available

  return rows.map((row) => {
    let ai_credits = buildAiCreditsForUser(row.user_login, creditsMap)

    if (!ai_credits && billingLoaded && perUserUnavailable) {
      ai_credits = buildUnavailableAiCredits()
    }

    return {
      ...row,
      ai_credits
    }
  })
}
