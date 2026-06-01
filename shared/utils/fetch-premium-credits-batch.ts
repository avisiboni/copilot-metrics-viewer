import type { UserPremiumCredits } from '../types/copilot-usage'
import { fetchOrganizationBilling } from './billing-api'
import {
  fetchEnterprisePremiumCreditsByUser,
  resolveEnterpriseSlug,
  type EnterprisePremiumUserRow
} from './billing-enterprise-premium'
import { fetchOrgPremiumCreditsByUser } from './billing-org-premium'
import {
  aggregatePremiumCreditsFromEnterpriseRows,
  buildPremiumCreditsForUser,
  buildUnavailablePremiumCredits
} from './premium-credits'
import {
  getCachedPremiumCredits,
  premiumCreditsAuthKey,
  premiumCreditsUserCacheKey,
  setCachedPremiumCredits
} from './premium-credits-cache'

export type FetchPremiumCreditsBatchResult = {
  credits: Record<string, UserPremiumCredits>
  fromCache: string[]
  orgUserFilterBlocked: boolean
  billingAvailable: boolean
}

export type PremiumCreditsResolveResult = {
  creditsMap: Map<string, UserPremiumCredits>
  perUserDataAvailable: boolean
  orgUserFilterBlocked?: boolean
}

/** Resolve per-user PRU for many logins via billing API (org ?user=, then enterprise). */
export async function resolvePremiumCreditsFromBillingApi(params: {
  logins: string[]
  org: string
  enterprise?: string
  since: string
  until: string
  headers: HeadersInit
  defaultQuota: number
  logger?: Console
}): Promise<PremiumCreditsResolveResult> {
  const result = await fetchPremiumCreditsForLogins(params)
  const creditsMap = new Map<string, UserPremiumCredits>(
    Object.entries(result.credits).map(([k, v]) => [k.toLowerCase(), v])
  )
  const perUserDataAvailable = [...creditsMap.values()].some(
    (c) => c.source === 'billing'
  )
  return {
    creditsMap,
    perUserDataAvailable,
    orgUserFilterBlocked: result.orgUserFilterBlocked
  }
}

export async function fetchPremiumCreditsForLogins(params: {
  logins: string[]
  org: string
  enterprise?: string
  since: string
  until: string
  headers: HeadersInit
  defaultQuota: number
  logger?: Console
}): Promise<FetchPremiumCreditsBatchResult> {
  const logger = params.logger ?? console
  const authKey = premiumCreditsAuthKey(params.headers)
  const uniqueLogins = [...new Set(params.logins.map((l) => l.trim()).filter(Boolean))]
  const credits: Record<string, UserPremiumCredits> = {}
  const fromCache: string[] = []
  const missing: string[] = []

  for (const login of uniqueLogins) {
    const cacheKey = premiumCreditsUserCacheKey(
      authKey,
      params.org,
      params.enterprise,
      params.since,
      params.until,
      login
    )
    const cached = getCachedPremiumCredits(cacheKey)
    if (cached) {
      credits[login.toLowerCase()] = cached
      fromCache.push(login)
    } else {
      missing.push(login)
    }
  }

  if (missing.length === 0) {
    return {
      credits,
      fromCache,
      orgUserFilterBlocked: false,
      billingAvailable: true
    }
  }

  const billing = await fetchOrganizationBilling(
    params.org,
    params.headers,
    params.since,
    params.until,
    logger,
    { enterprise: params.enterprise }
  )

  if (!billing.available) {
    for (const login of missing) {
      credits[login.toLowerCase()] = buildUnavailablePremiumCredits(params.defaultQuota)
    }
    return {
      credits,
      fromCache,
      orgUserFilterBlocked: false,
      billingAvailable: false
    }
  }

  let orgUserFilterBlocked = false
  const rows = new Map<string, EnterprisePremiumUserRow>()

  const orgResult = await fetchOrgPremiumCreditsByUser(
    params.org,
    missing,
    params.since,
    params.until,
    params.headers,
    logger
  )
  orgUserFilterBlocked = orgResult.userFilterBlocked
  for (const [login, row] of orgResult.rows) {
    rows.set(login, row)
  }

  const stillMissing = missing.filter((l) => !rows.has(l.toLowerCase()))
  if (stillMissing.length > 0) {
    const enterpriseSlug = await resolveEnterpriseSlug(
      params.headers,
      params.enterprise,
      logger
    )
    if (enterpriseSlug) {
      const entRows = await fetchEnterprisePremiumCreditsByUser(
        enterpriseSlug,
        params.org,
        stillMissing,
        params.since,
        params.until,
        params.headers,
        logger
      )
      for (const [login, row] of entRows) {
        rows.set(login, row)
      }
    }
  }

  const rowCreditsMap = aggregatePremiumCreditsFromEnterpriseRows(
    rows,
    params.defaultQuota
  )

  for (const login of missing) {
    const key = login.toLowerCase()
    let premium = buildPremiumCreditsForUser(login, rowCreditsMap)
    if (!premium) {
      premium = orgUserFilterBlocked
        ? buildUnavailablePremiumCredits(params.defaultQuota)
        : undefined
    }
    if (premium) {
      credits[key] = premium
      const cacheKey = premiumCreditsUserCacheKey(
        authKey,
        params.org,
        params.enterprise,
        params.since,
        params.until,
        login
      )
      if (premium.source === 'billing') {
        setCachedPremiumCredits(cacheKey, premium)
      }
    }
  }

  return {
    credits,
    fromCache,
    orgUserFilterBlocked,
    billingAvailable: true
  }
}
