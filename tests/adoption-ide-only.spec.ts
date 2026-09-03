import { describe, it, expect } from 'vitest'
import {
  adoptionPhaseOrder,
  filterAdoptionPhasesForDisplay,
  isAdoptionIdeOnlyEnabled,
  isAgentAdoptionPhase,
} from '../shared/utils/adoption-ide-only'
import type { AiAdoptionPhaseAggregate } from '../shared/types/copilot-usage'

const SAMPLE: AiAdoptionPhaseAggregate[] = [
  { phase: 0, version: 'v1', engagedUsers: 1, avgInteractions: 0, avgGenerations: 0, avgAcceptances: 0, avgLocAdded: 0, avgLocDeleted: 0, avgPrCreated: 0, avgPrMerged: 0, avgPrReviewed: 0, medianMinutesToMerge: 0 },
  { phase: 1, version: 'v1', engagedUsers: 10, avgInteractions: 0, avgGenerations: 0, avgAcceptances: 0, avgLocAdded: 0, avgLocDeleted: 0, avgPrCreated: 0, avgPrMerged: 0, avgPrReviewed: 0, medianMinutesToMerge: 0 },
  { phase: 2, version: 'v1', engagedUsers: 2, avgInteractions: 0, avgGenerations: 0, avgAcceptances: 0, avgLocAdded: 0, avgLocDeleted: 0, avgPrCreated: 0, avgPrMerged: 0, avgPrReviewed: 0, medianMinutesToMerge: 0 },
  { phase: 3, version: 'v1', engagedUsers: 1, avgInteractions: 0, avgGenerations: 0, avgAcceptances: 0, avgLocAdded: 0, avgLocDeleted: 0, avgPrCreated: 0, avgPrMerged: 0, avgPrReviewed: 0, medianMinutesToMerge: 0 },
]

describe('adoption-ide-only', () => {
  it('isAdoptionIdeOnlyEnabled is opt-in', () => {
    expect(isAdoptionIdeOnlyEnabled({})).toBe(false)
    expect(isAdoptionIdeOnlyEnabled({ adoptionIdeOnly: false })).toBe(false)
    expect(isAdoptionIdeOnlyEnabled({ adoptionIdeOnly: true })).toBe(true)
  })

  it('filterAdoptionPhasesForDisplay keeps phases 0 and 1 when ide only', () => {
    expect(filterAdoptionPhasesForDisplay(SAMPLE, true).map((r) => r.phase)).toEqual([0, 1])
    expect(filterAdoptionPhasesForDisplay(SAMPLE, false)).toHaveLength(4)
  })

  it('adoptionPhaseOrder shortens when ide only', () => {
    expect(adoptionPhaseOrder(true)).toEqual([0, 1])
    expect(adoptionPhaseOrder(false)).toEqual([0, 1, 2, 3])
  })

  it('isAgentAdoptionPhase identifies phases 2 and 3', () => {
    expect(isAgentAdoptionPhase(2)).toBe(true)
    expect(isAgentAdoptionPhase(3)).toBe(true)
    expect(isAgentAdoptionPhase(1)).toBe(false)
  })
})
