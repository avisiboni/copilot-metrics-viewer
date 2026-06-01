import { describe, expect, test, beforeEach } from 'vitest'
import { PREMIUM_CREDITS_CACHE_TTL_MS } from '../shared/utils/premium-credits-constants'
import {
  clearPremiumCreditsCache,
  getCachedPremiumCredits,
  premiumCreditsUserCacheKey,
  setCachedPremiumCredits
} from '../shared/utils/premium-credits-cache'

describe('premium-credits-cache', () => {
  beforeEach(() => {
    clearPremiumCreditsCache()
  })

  test('stores and returns credits within TTL', () => {
    const key = premiumCreditsUserCacheKey('auth', 'org', 'ent', '2026-05-01', '2026-05-28', 'alice')
    const credits = {
      used: 100,
      quota: 1000,
      remaining: 900,
      percentUsed: 10,
      percentRemaining: 90,
      source: 'billing' as const
    }
    setCachedPremiumCredits(key, credits)
    expect(getCachedPremiumCredits(key)).toEqual(credits)
  })

  test('expires after TTL', () => {
    const key = premiumCreditsUserCacheKey('auth', 'org', undefined, '2026-05-01', '2026-05-28', 'bob')
    setCachedPremiumCredits(key, {
      used: 0,
      quota: 1000,
      remaining: 1000,
      percentUsed: 0,
      percentRemaining: 100,
      source: 'billing'
    })
    const realNow = Date.now
    Date.now = () => realNow() + PREMIUM_CREDITS_CACHE_TTL_MS + 1
    expect(getCachedPremiumCredits(key)).toBeUndefined()
    Date.now = realNow
  })
})
