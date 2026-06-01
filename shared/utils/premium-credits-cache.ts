import { createHash } from 'node:crypto'
import type { UserPremiumCredits } from '../types/copilot-usage'
import { PREMIUM_CREDITS_CACHE_TTL_MS } from './premium-credits-constants'

type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const userCreditsCache = new Map<string, CacheEntry<UserPremiumCredits>>()

export function premiumCreditsAuthKey(headers: HeadersInit): string {
  const auth = new Headers(headers).get('Authorization') || ''
  return createHash('sha256').update(auth).digest('hex').slice(0, 16)
}

export function premiumCreditsUserCacheKey(
  authKey: string,
  org: string,
  enterprise: string | undefined,
  since: string,
  until: string,
  login: string
): string {
  return `${authKey}:${org}:${enterprise || ''}:${since}:${until}:${login.toLowerCase()}`
}

export function getCachedPremiumCredits(
  cacheKey: string
): UserPremiumCredits | undefined {
  const entry = userCreditsCache.get(cacheKey)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    userCreditsCache.delete(cacheKey)
    return undefined
  }
  return entry.value
}

export function setCachedPremiumCredits(
  cacheKey: string,
  credits: UserPremiumCredits
): void {
  userCreditsCache.set(cacheKey, {
    value: credits,
    expiresAt: Date.now() + PREMIUM_CREDITS_CACHE_TTL_MS
  })
}

/** @internal test helper */
export function clearPremiumCreditsCache(): void {
  userCreditsCache.clear()
}
