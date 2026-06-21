import { describe, expect, it } from 'vitest'
import { pickTopUsersByEngagement, topUserKpiCardClass } from '../shared/utils/users-top-kpi'

describe('pickTopUsersByEngagement', () => {
  const users = [
    { id: 'a', login: 'alice' },
    { id: 'b', login: 'bob' },
    { id: 'c', login: 'carol' },
    { id: 'd', login: 'dan' },
    { id: 'e', login: 'eve' },
    { id: 'f', login: 'frank' }
  ]

  it('returns top N by engagement score', () => {
    const ranked = pickTopUsersByEngagement(users, (u) => ({
      login: u.login,
      engagementScore:
        u.id === 'b' ? 90 : u.id === 'a' ? 70 : u.id === 'c' ? 50 : u.id === 'd' ? 30 : 10,
      interactions: 1,
      generations: 1,
      acceptances: 1,
      locAdded: 0
    }))

    expect(ranked.map((r) => r.login)).toEqual(['bob', 'alice', 'carol', 'dan', 'eve'])
  })

  it('excludes zero engagement', () => {
    const ranked = pickTopUsersByEngagement(
      [{ id: 'z', login: 'zero' }],
      () => ({
        login: 'zero',
        engagementScore: 0,
        interactions: 0,
        generations: 0,
        acceptances: 0,
        locAdded: 0
      })
    )
    expect(ranked).toHaveLength(0)
  })

  it('breaks ties by activity total then login', () => {
    const tied = [
      { id: '1', login: 'zara' },
      { id: '2', login: 'amy' }
    ]
    const ranked = pickTopUsersByEngagement(tied, (u) => ({
      login: u.login,
      engagementScore: 50,
      interactions: u.id === '1' ? 5 : 10,
      generations: 0,
      acceptances: 0,
      locAdded: 0
    }))
    expect(ranked[0].login).toBe('amy')
  })
})

describe('topUserKpiCardClass', () => {
  it('cycles metric card classes', () => {
    expect(topUserKpiCardClass(0)).toContain('purple')
    expect(topUserKpiCardClass(1)).toContain('turquoise')
    expect(topUserKpiCardClass(4)).toContain('purple')
  })
})
