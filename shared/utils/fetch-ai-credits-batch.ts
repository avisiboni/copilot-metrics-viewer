import type { UserAiCredits } from '../types/copilot-usage'
import { fetchOrganizationBilling } from './billing-api'
import { fetchOrgAiCreditsByUser } from './billing-org-ai-credits'
import { fetchEnterpriseAiCreditsByUser } from './billing-enterprise-ai-credits'
import { resolveEnterpriseSlug } from './billing-enterprise-premium'
import {
  aggregateAiCreditsFromUserRows,
  buildAiCreditsForUser,
  buildUnavailableAiCredits
} from './ai-credits'
import {
  aiCreditsAuthKey,
  aiCreditsUserCacheKey,
  getCachedAiCredits,
  setCachedAiCredits
} from './ai-credits-cache'

export type FetchAiCreditsBatchResult = {
  credits: Record<string, UserAiCredits>
  fromCache: string[]
  orgUserFilterBlocked: boolean
  billingAvailable: boolean
}

export type AiCreditsResolveResult = {
  creditsMap: Map<string, UserAiCredits>
  perUserDataAvailable: boolean
  orgUserFilterBlocked?: boolean
}

/** Resolve per-user AI credits for many logins via billing API (org ?user=, then enterprise). */
export async function resolveAiCreditsFromBillingApi(params: {
  logins: string[]
  org: string
  enterprise?: string
  since: string
  until: string
  headers: HeadersInit
  logger?: Console
}): Promise<AiCreditsResolveResult> {
  const result = await fetchAiCreditsForLogins(params)
  const creditsMap = new Map<string, UserAiCredits>(
    Object.entries(result.credits).map(([k, v]) => [k.toLowerCase(), v])
  )
  const perUserDataAvailable = [...creditsMap.values()].some(
    (c) => c.source === 'billing' && c.used > 0
  )
  return {
    creditsMap,
    perUserDataAvailable,
    orgUserFilterBlocked: result.orgUserFilterBlocked
  }
}

export async function fetchAiCreditsForLogins(params: {
  logins: string[]
  org: string
  enterprise?: string
  since: string
  until: string
  headers: HeadersInit
  logger?: Console
}): Promise<FetchAiCreditsBatchResult> {
  const logger = params.logger ?? console
  const authKey = aiCreditsAuthKey(params.headers)
  const uniqueLogins = [...new Set(params.logins.map((l) => l.trim()).filter(Boolean))]
  const credits: Record<string, UserAiCredits> = {}
  const fromCache: string[] = []
  const missing: string[] = []

  for (const login of uniqueLogins) {
    const cacheKey = aiCreditsUserCacheKey(
      authKey,
      params.org,
      params.enterprise,
      params.since,
      params.until,
      login
    )
    const cached = getCachedAiCredits(cacheKey)
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
      credits[login.toLowerCase()] = buildUnavailableAiCredits()
    }
    return {
      credits,
      fromCache,
      orgUserFilterBlocked: false,
      billingAvailable: false
    }
  }

  let orgUserFilterBlocked = false
  const rows = new Map<string, import('./ai-credits').AiCreditsUserRow>()

  const orgResult = await fetchOrgAiCreditsByUser(
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
      const entRows = await fetchEnterpriseAiCreditsByUser(
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

  const rowCreditsMap = aggregateAiCreditsFromUserRows(rows)

  for (const login of missing) {
    const key = login.toLowerCase()
    let aiCredits = buildAiCreditsForUser(login, rowCreditsMap)
    if (!aiCredits) {
      aiCredits = orgUserFilterBlocked ? buildUnavailableAiCredits() : undefined
    }
    if (aiCredits) {
      credits[key] = aiCredits
      const cacheKey = aiCreditsUserCacheKey(
        authKey,
        params.org,
        params.enterprise,
        params.since,
        params.until,
        login
      )
      if (aiCredits.source === 'billing') {
        setCachedAiCredits(cacheKey, aiCredits)
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
