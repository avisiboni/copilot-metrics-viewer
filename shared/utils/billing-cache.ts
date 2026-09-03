import { createHash } from 'node:crypto'
import type { BillingFetchResult } from '../types/billing-usage'

type CacheEntry = {
  value: BillingFetchResult
  expiresAt: number
}

const billingCache = new Map<string, CacheEntry>()

const DEFAULT_TTL_MS = 10 * 60 * 1000

function ttlMs(): number {
  const seconds = Number(process.env.BILLING_CACHE_TTL_SECONDS)
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000
  return DEFAULT_TTL_MS
}

export function billingAuthKey(headers: HeadersInit): string {
  const auth = new Headers(headers).get('Authorization') || ''
  return createHash('sha256').update(auth).digest('hex').slice(0, 16)
}

export function billingCacheKey(params: {
  authKey: string
  org: string
  enterprise?: string
  since: string
  until: string
  includePremiumRequest: boolean
  includeDetailedUsage: boolean
}): string {
  return [
    'billing',
    params.authKey,
    params.org,
    params.enterprise || '',
    params.since,
    params.until,
    params.includePremiumRequest ? '1' : '0',
    params.includeDetailedUsage ? '1' : '0'
  ].join(':')
}

export function getCachedBilling(cacheKey: string): BillingFetchResult | undefined {
  const entry = billingCache.get(cacheKey)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    billingCache.delete(cacheKey)
    return undefined
  }
  return entry.value
}

export function setCachedBilling(cacheKey: string, value: BillingFetchResult): void {
  if (!value.available) return
  billingCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + ttlMs()
  })
}

/** @internal test helper */
export function clearBillingCache(): void {
  billingCache.clear()
}
