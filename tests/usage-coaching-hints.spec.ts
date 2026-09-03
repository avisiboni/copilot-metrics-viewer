import { describe, expect, it } from 'vitest'
import {
  buildUsageCoachingHints,
  isPremiumModelName,
  modelsForFeature,
  PLAN_MODE_FEATURE,
  premiumModelsUsed
} from '../shared/utils/usage-coaching-hints'

describe('usage-coaching-hints', () => {
  it('detects premium model names', () => {
    expect(isPremiumModelName('claude-opus-4')).toBe(true)
    expect(isPremiumModelName('gpt-4.1')).toBe(true)
    expect(isPremiumModelName('gpt-3.5-turbo')).toBe(false)
  })

  it('lists models used in plan mode', () => {
    const rows = modelsForFeature(
      [
        {
          model: 'claude-opus-4',
          feature: PLAN_MODE_FEATURE,
          user_initiated_interaction_count: 12
        },
        {
          model: 'gpt-4.1',
          feature: 'code_completion',
          user_initiated_interaction_count: 40
        }
      ],
      PLAN_MODE_FEATURE
    )
    expect(rows).toEqual([{ model: 'claude-opus-4', interactions: 12 }])
  })

  it('suggests plan mode when chat/agent used but plan mode is absent', () => {
    const hints = buildUsageCoachingHints({
      interactions: 50,
      generations: 30,
      acceptances: 10,
      used_chat: true,
      used_agent: false,
      engagementScore: 40,
      totals_by_feature: [
        {
          feature: 'chat_panel_ask_mode',
          user_initiated_interaction_count: 30
        }
      ],
      totals_by_model_feature: [
        {
          model: 'gpt-4.1',
          feature: 'chat_panel_ask_mode',
          user_initiated_interaction_count: 30
        }
      ]
    })
    expect(hints.some((h) => h.id === 'no_plan_mode')).toBe(true)
  })

  it('summarizes plan mode with models', () => {
    const hints = buildUsageCoachingHints({
      interactions: 80,
      generations: 40,
      acceptances: 20,
      totals_by_feature: [
        {
          feature: PLAN_MODE_FEATURE,
          user_initiated_interaction_count: 15
        }
      ],
      totals_by_model_feature: [
        {
          model: 'claude-opus-4',
          feature: PLAN_MODE_FEATURE,
          user_initiated_interaction_count: 15
        }
      ]
    })
    const summary = hints.find((h) => h.id === 'plan_mode_summary')
    expect(summary?.params.models).toContain('claude-opus-4')
    expect(hints.some((h) => h.id === 'no_plan_mode')).toBe(false)
  })

  it('flags premium models without plan mode', () => {
    const hints = buildUsageCoachingHints({
      interactions: 60,
      generations: 35,
      acceptances: 12,
      engagementScore: 45,
      totals_by_feature: [
        {
          feature: 'chat_panel_agent_mode',
          user_initiated_interaction_count: 25
        }
      ],
      totals_by_model_feature: [
        {
          model: 'claude-opus-4',
          feature: 'chat_panel_agent_mode',
          user_initiated_interaction_count: 25
        }
      ]
    })
    expect(hints.some((h) => h.id === 'premium_without_plan')).toBe(true)
    expect(premiumModelsUsed([
      {
        model: 'claude-opus-4',
        feature: 'chat_panel_agent_mode',
        user_initiated_interaction_count: 1
      }
    ])).toEqual(['claude-opus-4'])
  })

  it('returns insufficient breakdown when activity exists without feature rows', () => {
    const hints = buildUsageCoachingHints({
      interactions: 20,
      generations: 10,
      acceptances: 2
    })
    expect(hints).toEqual([{ id: 'insufficient_breakdown', priority: 'low', params: {} }])
  })
})
