import { describe, expect, it } from 'vitest'
import { buildUserUsageInsight } from '../shared/utils/usage-pattern-insights'
import { buildUsageRecommendation } from '../shared/utils/usage-pattern-recommendations'

describe('usage-pattern-recommendations', () => {
  const cohort = [
    { user_login: 'a', interactions: 5, generations: 20, acceptances: 8, locAdded: 100 },
    { user_login: 'b', interactions: 40, generations: 80, acceptances: 35, locAdded: 600 },
    { user_login: 'c', interactions: 90, generations: 200, acceptances: 90, locAdded: 2000 }
  ]

  it('recommends coaching for high volume low keep', () => {
    const insight = buildUserUsageInsight(
      {
        user_login: 'heavy',
        interactions: 85,
        generations: 180,
        acceptances: 5,
        locAdded: 1900,
        used_chat: true,
        topModel: 'claude-4.6-sonnet'
      },
      cohort
    )
    expect(insight.patternId).toBe('high_try_low_keep')
    expect(insight.recommendation.effectiveness).toBe('high_volume_low_fit')
    expect(insight.recommendation.headlineId).toBe('high_volume_low_fit')
    expect(insight.recommendation.actionIds).toContain('repoInstructions')
    expect(insight.recommendation.actionIds).toContain('tryChatRefactor')
    expect(insight.recommendation.priority).toBe('high')
  })

  it('recommends activation for underuse', () => {
    const insight = buildUserUsageInsight(
      {
        user_login: 'idle',
        interactions: 0,
        generations: 1,
        acceptances: 0,
        locAdded: 0
      },
      cohort
    )
    expect(insight.patternId).toBe('insufficient_data')
    expect(insight.recommendation.effectiveness).toBe('unknown')
  })

  it('celebrates efficient adopter', () => {
    const insight = buildUserUsageInsight(
      {
        user_login: 'star',
        interactions: 50,
        generations: 90,
        acceptances: 80,
        locAdded: 700,
        used_agent: true,
        used_chat: true
      },
      cohort
    )
    expect(['efficient_adopter', 'power_user', 'volume_adopter']).toContain(insight.patternId)
    if (insight.patternId === 'efficient_adopter') {
      expect(insight.recommendation.effectiveness).toBe('productive')
      expect(insight.recommendation.actionIds).toContain('championInvite')
    }
  })

  it('adds contextual tryChat when chat unused', () => {
    const partial = buildUserUsageInsight(
      {
        user_login: 'inline',
        interactions: 10,
        generations: 40,
        acceptances: 15,
        locAdded: 300,
        used_chat: false
      },
      cohort
    )
    const reco = buildUsageRecommendation(
      {
        user_login: 'inline',
        interactions: 10,
        generations: 40,
        acceptances: 15,
        locAdded: 300,
        used_chat: false
      },
      partial
    )
    expect(reco.actionIds).toContain('tryChat')
  })
})
