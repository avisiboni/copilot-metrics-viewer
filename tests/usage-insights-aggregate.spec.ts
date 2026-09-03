import { describe, expect, it } from 'vitest'
import {
  aggregateFeatureAdoption,
  aggregateModelUsage,
  aggregateSkuCosts,
  buildSummary,
  buildUsageInsightsResponse,
  consolidateUserRecords,
  filterUsageInsightsByUser,
  mapFullUserRecord
} from '../shared/utils/usage-insights-aggregate'
import type { UserUsageRecord } from '../shared/types/copilot-usage'

describe('usage-insights-aggregate', () => {
  const sampleUser: UserUsageRecord = {
    user_login: 'alice',
    user_id: 1,
    user_initiated_interaction_count: 10,
    code_generation_activity_count: 5,
    code_acceptance_activity_count: 3,
    loc_added_sum: 100,
    used_agent: true,
    used_chat: true,
    used_cli: false,
    totals_by_model_feature: [
      {
        model: 'gpt-4.1',
        feature: 'chat_panel_ide_chat',
        user_initiated_interaction_count: 8,
        code_generation_activity_count: 4,
        code_acceptance_activity_count: 2
      },
      {
        model: 'claude-sonnet',
        feature: 'agent',
        user_initiated_interaction_count: 2,
        code_generation_activity_count: 1,
        code_acceptance_activity_count: 1
      }
    ],
    totals_by_feature: [
      { feature: 'chat_panel_ide_chat', user_initiated_interaction_count: 8 },
      { feature: 'agent', user_initiated_interaction_count: 2 }
    ]
  }

  it('maps full user records with model breakdowns and new API fields', () => {
    const mapped = mapFullUserRecord({
      user_login: 'bob',
      user_id: 2,
      ai_adoption_phase: { phase: 2, version: 'v1' },
      ai_credits_used: 15.5,
      used_copilot_coding_agent: true,
      totals_by_model_feature: [{ model: 'gpt-4.1', feature: 'agent' }]
    })
    expect(mapped.user_login).toBe('bob')
    expect(mapped.ai_adoption_phase?.phase).toBe(2)
    expect(mapped.ai_credits_used).toBe(15.5)
    expect(mapped.ai_credits).toEqual({ used: 15.5, source: 'metrics' })
    expect(mapped.used_copilot_coding_agent).toBe(true)
    expect(mapped.totals_by_model_feature).toHaveLength(1)
  })

  it('aggregates model usage across users', () => {
    const rows = aggregateModelUsage([sampleUser])
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0].interactions).toBeGreaterThan(0)
  })

  it('normalizes feature labels', () => {
    const features = aggregateFeatureAdoption([sampleUser])
    expect(features.some((f) => f.feature.includes('Ide Chat'))).toBe(true)
  })

  it('builds summary KPIs', () => {
    const summary = buildSummary([sampleUser])
    expect(summary.userCount).toBe(1)
    expect(summary.uniqueModels).toBe(2)
    expect(summary.agentUsers).toBe(1)
  })

  it('consolidates duplicate user rows from multi-day NDJSON', () => {
    const merged = consolidateUserRecords([
      { ...sampleUser, day: '2026-05-01', user_initiated_interaction_count: 5 },
      { ...sampleUser, day: '2026-05-02', user_initiated_interaction_count: 7 }
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0].user_initiated_interaction_count).toBe(12)
  })

  it('filters insights to a single user', () => {
    const alice = {
      ...sampleUser,
      ai_adoption_phase: { phase: 2 as const, version: 'v1' }
    }
    const full = buildUsageInsightsResponse({
      users: [
        alice,
        {
          ...sampleUser,
          user_login: 'bob',
          user_id: 2,
          user_initiated_interaction_count: 1,
          ai_adoption_phase: { phase: 1 as const, version: 'v1' }
        }
      ],
      adoptionByPhase: [
        {
          phase: 1,
          version: 'v1',
          engagedUsers: 5,
          avgInteractions: 4,
          avgGenerations: 0,
          avgAcceptances: 0,
          avgLocAdded: 0,
          avgLocDeleted: 0
        },
        {
          phase: 2,
          version: 'v1',
          engagedUsers: 3,
          avgInteractions: 0,
          avgGenerations: 0,
          avgAcceptances: 0,
          avgLocAdded: 0,
          avgLocDeleted: 0
        }
      ],
      userTeams: [],
      billing: {
        available: false,
        detailedUsage: [],
        summaryUsage: [],
        premiumRequestUsage: []
      }
    })

    const filtered = filterUsageInsightsByUser(full, 'alice')
    expect(filtered.users).toHaveLength(1)
    expect(filtered.users[0].user_login).toBe('alice')
    expect(filtered.summary.userCount).toBe(1)
    expect(filtered.summary.totalInteractions).toBe(10)
    expect(filtered.adoptionByPhase.find((r) => r.phase === 2)?.engagedUsers).toBe(1)
    expect(filtered.adoptionByPhase.find((r) => r.phase === 1)?.engagedUsers).toBeUndefined()
  })

  it('does not double-count SKU costs from summary and detailed billing', () => {
    const rows = aggregateSkuCosts({
      available: true,
      summaryUsage: [
        {
          product: 'Copilot',
          sku: 'enterprise',
          grossQuantity: 36.038,
          grossAmount: 1405.47,
          netAmount: 1405.47
        }
      ],
      detailedUsage: [
        {
          product: 'Copilot',
          sku: 'Copilot Enterprise',
          quantity: 36.038,
          grossAmount: 1405.47,
          netAmount: 1405.47
        }
      ],
      premiumRequestUsage: []
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].sku).toBe('Copilot Enterprise')
    expect(rows[0].netAmount).toBe(1405.47)
  })

  it('merges all common GitHub billing SKU alias pairs in one response', () => {
    const rows = aggregateSkuCosts({
      available: true,
      summaryUsage: [
        {
          product: 'Copilot',
          sku: 'Copilot Enterprise',
          grossQuantity: 112.604,
          grossAmount: 4391.55,
          netAmount: 4391.55
        },
        {
          product: 'Copilot',
          sku: 'enterprise',
          grossQuantity: 112.604,
          grossAmount: 4391.55,
          netAmount: 4391.55
        },
        {
          product: 'Copilot',
          sku: 'Copilot Premium Request',
          grossQuantity: 70438.41,
          grossAmount: 2817.54,
          netAmount: 1557.05
        },
        {
          product: 'Copilot',
          sku: 'premium request',
          grossQuantity: 70438.41,
          grossAmount: 2817.54,
          netAmount: 1557.05
        },
        {
          product: 'Actions',
          sku: 'Actions Linux',
          grossQuantity: 3,
          grossAmount: 0.02,
          netAmount: 0
        },
        {
          product: 'Actions',
          sku: 'actions linux',
          grossQuantity: 3,
          grossAmount: 0.02,
          netAmount: 0
        },
        {
          product: 'Copilot',
          sku: 'Copilot AI Credits',
          grossQuantity: 13196.938,
          grossAmount: 131.97,
          netAmount: 0
        },
        {
          product: 'Copilot',
          sku: 'ai unit',
          grossQuantity: 13196.938,
          grossAmount: 131.97,
          netAmount: 0
        }
      ],
      detailedUsage: [],
      premiumRequestUsage: []
    })
    expect(rows).toHaveLength(4)
    expect(rows.map((r) => r.sku).sort()).toEqual([
      'Actions Linux',
      'Copilot AI Credits',
      'Copilot Enterprise',
      'Copilot Premium Request'
    ])
    expect(rows.find((r) => r.sku === 'Copilot Enterprise')?.netAmount).toBe(4391.55)
  })

  it('still sums same SKU across periods when amounts differ', () => {
    const rows = aggregateSkuCosts({
      available: true,
      summaryUsage: [
        {
          product: 'Copilot',
          sku: 'enterprise',
          grossQuantity: 10,
          grossAmount: 100,
          netAmount: 100
        },
        {
          product: 'Copilot',
          sku: 'enterprise',
          grossQuantity: 5,
          grossAmount: 50,
          netAmount: 50
        }
      ],
      detailedUsage: [],
      premiumRequestUsage: []
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].netAmount).toBe(150)
  })

  it('merges enterprise SKU aliases within a single billing source', () => {
    const rows = aggregateSkuCosts({
      available: true,
      summaryUsage: [
        {
          product: 'Copilot',
          sku: 'enterprise',
          grossQuantity: 10,
          grossAmount: 100,
          netAmount: 100
        },
        {
          product: 'Copilot',
          sku: 'Copilot Enterprise',
          grossQuantity: 10,
          grossAmount: 100,
          netAmount: 100
        }
      ],
      detailedUsage: [],
      premiumRequestUsage: []
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].netAmount).toBe(100)
  })

  it('builds full response with billing unavailable', () => {
    const response = buildUsageInsightsResponse({
      users: [sampleUser],
      userTeams: [],
      billing: {
        available: false,
        reason: 'test',
        detailedUsage: [],
        summaryUsage: [],
        premiumRequestUsage: []
      }
    })
    expect(response.users[0].user_login).toBe('alice')
    expect(response.billing.available).toBe(false)
    expect(response.modelUsage.length).toBeGreaterThan(0)
  })
})
