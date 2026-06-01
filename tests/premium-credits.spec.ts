import { describe, expect, test } from 'vitest'
import type { BillingFetchResult } from '../shared/types/billing-usage'
import {
  aggregatePremiumCreditsByUser,
  buildPremiumCreditsForUser,
  normalizePremiumMonthlyQuota,
  premiumCreditsProgressColor
} from '../shared/utils/premium-credits'

describe('premium-credits', () => {
  test('aggregates usage and quota from billing items', () => {
    const billing: BillingFetchResult = {
      available: true,
      detailedUsage: [
        {
          product: 'copilot',
          sku: 'copilot_premium_request',
          username: 'alice',
          quantity: 250,
          totalMonthlyQuota: 1000
        }
      ],
      summaryUsage: [],
      premiumRequestUsage: [
        {
          product: 'copilot',
          sku: 'copilot_premium_request',
          username: 'bob',
          model: 'gpt-4',
          netQuantity: 100,
          totalMonthlyQuota: 500
        }
      ]
    }

    const map = aggregatePremiumCreditsByUser(billing, 1000)
    expect(map.get('alice')).toMatchObject({
      used: 250,
      quota: 1000,
      remaining: 750,
      percentUsed: 25,
      percentRemaining: 75,
      source: 'billing'
    })
    expect(map.get('bob')).toMatchObject({
      used: 100,
      quota: 500,
      remaining: 400,
      percentUsed: 20,
      percentRemaining: 80,
      source: 'billing'
    })
  })

  test('buildPremiumCreditsForUser returns map entry only', () => {
    const map = new Map([
      [
        'alice',
        {
          used: 10,
          quota: 1000,
          remaining: 990,
          percentUsed: 1,
          percentRemaining: 99,
          source: 'billing' as const
        }
      ]
    ])
    expect(buildPremiumCreditsForUser('alice', map)?.used).toBe(10)
    expect(buildPremiumCreditsForUser('missing', map)).toBeUndefined()
  })

  test('normalizePremiumMonthlyQuota treats GitHub INT_MAX as default', () => {
    expect(normalizePremiumMonthlyQuota(2147483647, 1000)).toBe(1000)
    expect(normalizePremiumMonthlyQuota(1000, 1000)).toBe(1000)
  })

  test('premiumCreditsProgressColor thresholds by usage', () => {
    expect(premiumCreditsProgressColor(80)).toBe('primary')
    expect(premiumCreditsProgressColor(30)).toBe('warning')
    expect(premiumCreditsProgressColor(10)).toBe('error')
  })
})
