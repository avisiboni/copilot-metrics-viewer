import { describe, expect, test } from 'vitest'
import {
  buildAdoptionPhaseView,
  extractAdoptionPhaseTotals,
  normalizePhaseId,
  parseAiAdoptionPhase
} from '../shared/utils/ai-adoption-phase'

describe('ai-adoption-phase', () => {
  test('parseAiAdoptionPhase reads object with version', () => {
    expect(parseAiAdoptionPhase({ phase: 2, version: 'v1' })).toEqual({
      phase: 2,
      version: 'v1'
    })
  })

  test('normalizePhaseId accepts string aliases', () => {
    expect(normalizePhaseId('multi_agent')).toBe(3)
    expect(normalizePhaseId('code_first')).toBe(1)
  })

  test('extractAdoptionPhaseTotals from org rollup line', () => {
    const rows = extractAdoptionPhaseTotals({
      totals_by_ai_adoption_phase: [
        {
          phase: 1,
          version: 'v1',
          total_engaged_users: 10,
          user_initiated_interaction_count_avg: 4.5
        },
        {
          phase: 3,
          version: 'v1',
          total_engaged_users: 3,
          code_generation_activity_count_avg: 12
        }
      ]
    })
    expect(rows).toHaveLength(2)
    expect(rows[0]?.phase).toBe(1)
    expect(rows[0]?.engagedUsers).toBe(10)
    expect(rows[1]?.phase).toBe(3)
  })

  test('extractAdoptionPhaseTotals maps PR and LOC deleted averages', () => {
    const rows = extractAdoptionPhaseTotals({
      totals_by_ai_adoption_phase: [
        {
          phase: 2,
          total_engaged_users: 5,
          loc_deleted_sum_avg: 12.5,
          pull_requests: {
            total_created_avg: 1.2,
            total_merged_avg: 0.8,
            total_reviewed_avg: 2.1,
            median_minutes_to_merge_avg: 90
          }
        }
      ]
    })
    expect(rows[0]?.avgLocDeleted).toBe(12.5)
    expect(rows[0]?.avgPrCreated).toBe(1.2)
    expect(rows[0]?.medianMinutesToMerge).toBe(90)
  })

  test('buildAdoptionPhaseView falls back to user counts', () => {
    const view = buildAdoptionPhaseView([], [
      { ai_adoption_phase: { phase: 1, version: 'v1' } },
      { ai_adoption_phase: { phase: 1, version: 'v1' } },
      { ai_adoption_phase: { phase: 3, version: 'v1' } }
    ])
    expect(view.find((r) => r.phase === 1)?.engagedUsers).toBe(2)
    expect(view.find((r) => r.phase === 3)?.engagedUsers).toBe(1)
    expect(view.find((r) => r.phase === 1)?.labeledUsers).toBeUndefined()
  })

  test('buildAdoptionPhaseView merges org engaged with user report labels', () => {
    const view = buildAdoptionPhaseView(
      [
        {
          phase: 1,
          version: 'v1',
          engagedUsers: 1,
          avgInteractions: 4,
          avgGenerations: 0,
          avgAcceptances: 0,
          avgLocAdded: 0,
          avgLocDeleted: 0
        }
      ],
      [
        { ai_adoption_phase: { phase: 1, version: 'v1' } },
        { ai_adoption_phase: { phase: 1, version: 'v1' } },
        { ai_adoption_phase: { phase: 1, version: 'v1' } }
      ]
    )
    const row = view.find((r) => r.phase === 1)
    expect(row?.engagedUsers).toBe(1)
    expect(row?.labeledUsers).toBe(3)
  })
})
