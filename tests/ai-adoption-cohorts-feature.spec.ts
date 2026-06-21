import { describe, expect, it } from 'vitest'
import { isAiAdoptionCohortsVisible } from '../shared/utils/ai-adoption-cohorts-feature'

describe('isAiAdoptionCohortsVisible', () => {
  it('is false when unset or false', () => {
    expect(isAiAdoptionCohortsVisible({})).toBe(false)
    expect(isAiAdoptionCohortsVisible({ showAiAdoptionCohorts: false })).toBe(false)
  })

  it('is true only when explicitly enabled', () => {
    expect(isAiAdoptionCohortsVisible({ showAiAdoptionCohorts: true })).toBe(true)
  })
})
