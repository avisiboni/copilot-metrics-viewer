import { describe, expect, test } from 'vitest'
import type { BillingFetchResult } from '../shared/types/billing-usage'
import {
  aggregateAiCreditsByUser,
  buildAiCreditsForUser,
  enrichRowsWithAiCredits
} from '../shared/utils/ai-credits'

describe('ai-credits', () => {
  test('aggregates AI credit usage from billing detailed lines', () => {
    const billing: BillingFetchResult = {
      available: true,
      detailedUsage: [
        {
          product: 'Copilot',
          sku: 'Copilot AI Credits',
          username: 'alice',
          quantity: 120.5,
          netAmount: 1.2
        },
        {
          product: 'Copilot',
          sku: 'ai unit',
          username: 'bob',
          quantity: 50,
          netAmount: 0.5
        }
      ],
      summaryUsage: [],
      premiumRequestUsage: []
    }

    const map = aggregateAiCreditsByUser(billing)
    expect(map.get('alice')).toMatchObject({
      used: 120.5,
      netAmount: 1.2,
      source: 'billing'
    })
    expect(map.get('bob')).toMatchObject({
      used: 50,
      netAmount: 0.5,
      source: 'billing'
    })
  })

  test('buildAiCreditsForUser returns map entry only', () => {
    const map = new Map([
      [
        'alice',
        {
          used: 42,
          netAmount: 0.42,
          source: 'billing' as const
        }
      ]
    ])
    expect(buildAiCreditsForUser('alice', map)?.used).toBe(42)
    expect(buildAiCreditsForUser('missing', map)).toBeUndefined()
  })

  test('enrichRowsWithAiCredits attaches credits to leaderboard rows', () => {
    const billing: BillingFetchResult = {
      available: true,
      detailedUsage: [
        {
          product: 'Copilot',
          sku: 'Copilot AI Credits',
          username: 'alice',
          quantity: 10,
          netAmount: 0.1
        }
      ],
      summaryUsage: [],
      premiumRequestUsage: []
    }

    const rows = enrichRowsWithAiCredits(
      [{ user_login: 'alice' }, { user_login: 'bob' }],
      billing
    )
    expect(rows[0].ai_credits?.used).toBe(10)
    expect(rows[1].ai_credits).toBeUndefined()
  })
})
