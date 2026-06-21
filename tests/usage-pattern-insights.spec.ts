import { describe, expect, it } from 'vitest'
import {
  buildUserUsageInsight,
  buildUsageInsightsMap,
  computeDerivedRates,
  percentileRank
} from '../shared/utils/usage-pattern-insights'

describe('usage-pattern-insights', () => {
  it('computes acceptance rate', () => {
    const rates = computeDerivedRates({
      user_login: 'a',
      interactions: 10,
      generations: 100,
      acceptances: 40,
      locAdded: 500
    })
    expect(rates.acceptanceRate).toBe(40)
    expect(rates.locPerInteraction).toBe(50)
  })

  it('classifies high try low keep vs selective accepter', () => {
    const cohort = Array.from({ length: 12 }, (_, i) => ({
      user_login: `bench${i}`,
      interactions: 10 + i * 8,
      generations: 30 + i * 25,
      acceptances: 8 + i * 12,
      locAdded: 80 + i * 60
    }))

    const wasteful = buildUserUsageInsight(
      {
        user_login: 'waste',
        interactions: 200,
        generations: 800,
        acceptances: 1,
        locAdded: 1200
      },
      cohort
    )
    expect(wasteful.patternId).toBe('high_try_low_keep')

    const selective = buildUserUsageInsight(
      {
        user_login: 'sel',
        interactions: 40,
        generations: 120,
        acceptances: 95,
        locAdded: 200
      },
      cohort
    )
    expect(selective.patternId).toBe('selective_accepter')
  })

  it('labels low-activity high-acceptance user as light_user not selective_accepter', () => {
    const cohort = Array.from({ length: 12 }, (_, i) => ({
      user_login: `bench${i}`,
      interactions: 10 + i * 8,
      generations: 30 + i * 25,
      acceptances: 8 + i * 12,
      locAdded: 80 + i * 60
    }))

    const light = buildUserUsageInsight(
      {
        user_login: 'shay',
        interactions: 13,
        generations: 24,
        acceptances: 3,
        locAdded: 30
      },
      cohort
    )
    expect(light.patternId).toBe('light_user')
  })

  it('builds map keyed by login', () => {
    const map = buildUsageInsightsMap([
      { user_login: 'Alice', interactions: 1, generations: 1, acceptances: 0, locAdded: 0 },
      { user_login: 'bob', interactions: 50, generations: 50, acceptances: 25, locAdded: 400 }
    ])
    expect(map.get('alice')?.patternId).toBeDefined()
    expect(map.get('bob')?.engagementScore).toBeGreaterThan(map.get('alice')?.engagementScore ?? 0)
  })

  it('percentileRank returns 0–100', () => {
    expect(percentileRank(5, [1, 2, 3, 4, 10])).toBe(80)
    expect(percentileRank(0, [0, 0, 10])).toBe(0)
  })
})
