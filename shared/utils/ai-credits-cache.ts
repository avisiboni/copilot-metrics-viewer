import { createHash } from 'node:crypto'
import type { UserAiCredits } from '../types/copilot-usage'
import { AI_CREDITS_CACHE_TTL_MS } from './ai-credits-constants'

type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const userCreditsCache = new Map<string, CacheEntry<UserAiCredits>>()

export function aiCreditsAuthKey(headers: HeadersInit): string {
  const auth = new Headers(headers).get('Authorization') || ''
  return createHash('sha256').update(auth).digest('hex').slice(0, 16)
}

export function aiCreditsUserCacheKey(
  authKey: string,
  org: string,
  enterprise: string | undefined,
  since: string,
  until: string,
  login: string
): string {
  return `aic:${authKey}:${org}:${enterprise || ''}:${since}:${until}:${login.toLowerCase()}`
}

export function getCachedAiCredits(cacheKey: string): UserAiCredits | undefined {
  const entry = userCreditsCache.get(cacheKey)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    userCreditsCache.delete(cacheKey)
    return undefined
  }
  return entry.value
}

export function setCachedAiCredits(cacheKey: string, credits: UserAiCredits): void {
  userCreditsCache.set(cacheKey, {
    value: credits,
    expiresAt: Date.now() + AI_CREDITS_CACHE_TTL_MS
  })
}

/** @internal test helper */
export function clearAiCreditsCache(): void {
  userCreditsCache.clear()
}
