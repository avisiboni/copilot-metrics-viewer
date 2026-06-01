import { describe, expect, it } from 'vitest'
import { isPremiumCreditsFetchEnabled } from '../shared/utils/premium-credits-feature'

describe('premium-credits-feature', () => {
  it('defaults to enabled when flag is undefined', () => {
    expect(isPremiumCreditsFetchEnabled({})).toBe(true)
  })

  it('respects explicit false', () => {
    expect(isPremiumCreditsFetchEnabled({ premiumCreditsFetchEnabled: false })).toBe(false)
  })

  it('respects explicit true', () => {
    expect(isPremiumCreditsFetchEnabled({ premiumCreditsFetchEnabled: true })).toBe(true)
  })
})
