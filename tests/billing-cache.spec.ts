import { describe, expect, test, beforeEach } from 'vitest'
import {
  billingAuthKey,
  billingCacheKey,
  clearBillingCache,
  getCachedBilling,
  setCachedBilling
} from '../shared/utils/billing-cache'
import type { BillingFetchResult } from '../shared/types/billing-usage'

describe('billing-cache', () => {
  beforeEach(() => {
    clearBillingCache()
  })

  test('stores and returns available billing payloads', () => {
    const key = billingCacheKey({
      authKey: 'abc',
      org: 'acme',
      enterprise: 'ent',
      since: '2026-01-01',
      until: '2026-07-17',
      includePremiumRequest: true,
      includeDetailedUsage: false
    })
    const payload: BillingFetchResult = {
      available: true,
      detailedUsage: [],
      summaryUsage: [
        {
          product: 'copilot',
          sku: 'Copilot Enterprise',
          netAmount: 100,
          grossAmount: 100,
          quantity: 1
        }
      ],
      premiumRequestUsage: []
    }
    setCachedBilling(key, payload)
    expect(getCachedBilling(key)?.summaryUsage[0]?.netAmount).toBe(100)
  })

  test('does not cache unavailable results', () => {
    const key = billingCacheKey({
      authKey: 'abc',
      org: 'acme',
      since: '2026-01-01',
      until: '2026-01-31',
      includePremiumRequest: true,
      includeDetailedUsage: false
    })
    setCachedBilling(key, {
      available: false,
      reason: 'nope',
      detailedUsage: [],
      summaryUsage: [],
      premiumRequestUsage: []
    })
    expect(getCachedBilling(key)).toBeUndefined()
  })

  test('auth key is stable for same Authorization header', () => {
    const headers = { Authorization: 'token ghp_test' }
    expect(billingAuthKey(headers)).toBe(billingAuthKey(headers))
  })
})
