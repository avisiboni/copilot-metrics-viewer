import { describe, expect, it } from 'vitest'
import { buildUserUsageInsight } from '../shared/utils/usage-pattern-insights'
import { computeCopilotQualityScore } from '../shared/utils/copilot-quality-score'
import { pickTopUsersByCopilotQuality } from '../shared/utils/users-top-kpi'
import type { UserUsageInsight } from '../shared/types/usage-pattern'

/** Spread cohort so percentile-based classification is stable in tests. */
function testCohort() {
  return Array.from({ length: 12 }, (_, i) => ({
    user_login: `bench${i}`,
    interactions: 10 + i * 8,
    generations: 30 + i * 25,
    acceptances: 8 + i * 12,
    locAdded: 80 + i * 60
  }))
}

describe('computeCopilotQualityScore', () => {
  it('returns 0 for high_try_low_keep and positive score for productive patterns', () => {
    const cohort = testCohort()
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
    expect(computeCopilotQualityScore(wasteful)).toBe(0)

    const productive = buildUserUsageInsight(
      {
        user_login: 'star',
        interactions: 40,
        generations: 120,
        acceptances: 95,
        locAdded: 450
      },
      cohort
    )
    expect(productive.patternId).not.toBe('high_try_low_keep')
    expect(computeCopilotQualityScore(productive)).toBeGreaterThan(computeCopilotQualityScore(wasteful))
    expect(computeCopilotQualityScore(productive)).toBeGreaterThan(40)
  })

  it('scores low-activity selective accepter below high-activity productive user', () => {
    const cohort = testCohort()
    const lightSelective = buildUserUsageInsight(
      {
        user_login: 'light',
        interactions: 13,
        generations: 24,
        acceptances: 3,
        locAdded: 30
      },
      cohort
    )
    const activeProductive = buildUserUsageInsight(
      {
        user_login: 'star',
        interactions: 95,
        generations: 873,
        acceptances: 297,
        locAdded: 450
      },
      cohort
    )

    expect(computeCopilotQualityScore(activeProductive)).toBeGreaterThan(
      computeCopilotQualityScore(lightSelective)
    )
    expect(computeCopilotQualityScore(lightSelective)).toBeLessThan(55)
  })

  it('returns 0 for excluded patterns', () => {
    const insight: UserUsageInsight = {
      patternId: 'underuse',
      confidence: 'low',
      engagementScore: 5,
      rates: {
        acceptanceRate: 0,
        generationsPerInteraction: 0,
        locPerAcceptance: 0,
        locPerInteraction: 0,
        locPerGeneration: 0
      },
      percentiles: {
        interactions: 5,
        generations: 5,
        acceptances: 5,
        locAdded: 5,
        acceptanceRate: 5,
        generationsPerInteraction: 5,
        locPerAcceptance: 5,
        locPerInteraction: 5,
        locPerGeneration: 5
      },
      orgMedians: {
        interactions: 50,
        generations: 100,
        acceptances: 50,
        locAdded: 200,
        acceptanceRate: 30,
        generationsPerInteraction: 2,
        locPerAcceptance: 4,
        locPerInteraction: 4,
        locPerGeneration: 2
      },
      orgUserCount: 10,
      recommendation: {
        effectiveness: 'idle',
        priority: 'high',
        headlineId: 'underuse',
        actionIds: []
      }
    }
    expect(computeCopilotQualityScore(insight)).toBe(0)
  })
})

describe('pickTopUsersByCopilotQuality', () => {
  it('ranks by quality score and omits zero-score users', () => {
    const cohort = testCohort()
    const wasteInsight = buildUserUsageInsight(
      { user_login: 'waste', interactions: 200, generations: 800, acceptances: 1, locAdded: 1200 },
      cohort
    )
    const starInsight = buildUserUsageInsight(
      { user_login: 'star', interactions: 40, generations: 120, acceptances: 95, locAdded: 450 },
      cohort
    )
    const midInsight = buildUserUsageInsight(
      { user_login: 'mid', interactions: 25, generations: 60, acceptances: 25, locAdded: 150 },
      cohort
    )

    const users = [{ login: 'waste' }, { login: 'star' }, { login: 'mid' }]
    const insights = new Map([
      ['waste', wasteInsight],
      ['star', starInsight],
      ['mid', midInsight]
    ])

    const ranked = pickTopUsersByCopilotQuality(
      users,
      (u) => ({
        login: u.login,
        insight: insights.get(u.login),
        interactions: 0,
        generations: 0,
        acceptances: 0,
        locAdded: 0
      }),
      3
    )

    expect(ranked.map((r) => r.login)).not.toContain('waste')
    expect(ranked[0]!.engagementScore).toBeGreaterThanOrEqual(ranked[1]?.engagementScore ?? 0)
    expect(ranked[0]?.login).toBe('star')
  })
})
