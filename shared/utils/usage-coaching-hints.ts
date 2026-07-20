import type { UserAiCredits, UsageFeatureTotal, UsageModelFeatureTotal } from '../types/copilot-usage'
import { usageNumber } from '../types/copilot-usage'

export type UsageCoachingHintId =
  | 'insufficient_breakdown'
  | 'plan_mode_summary'
  | 'no_plan_mode'
  | 'no_premium_models'
  | 'premium_without_plan'
  | 'high_spend_low_acceptance'

export type UsageCoachingHintPriority = 'high' | 'medium' | 'low'

export interface UsageCoachingHint {
  id: UsageCoachingHintId
  priority: UsageCoachingHintPriority
  /** Interpolation params for i18n */
  params: Record<string, string | number>
}

export interface UsageCoachingHintInput {
  interactions: number
  generations: number
  acceptances: number
  totals_by_feature?: UsageFeatureTotal[]
  totals_by_model_feature?: UsageModelFeatureTotal[]
  ai_credits?: UserAiCredits
  used_agent?: boolean
  used_chat?: boolean
  engagementScore?: number
  acceptanceRate?: number
}

export const PLAN_MODE_FEATURE = 'chat_panel_plan_mode'
export const AGENT_MODE_FEATURE = 'chat_panel_agent_mode'

const PREMIUM_MODEL_PATTERNS = [
  /opus/i,
  /\bo1[-_]?/i,
  /\bo3[-_]?/i,
  /gpt-4/i,
  /gpt-5/i,
  /sonnet-4/i,
  /claude-4/i,
  /gemini-.*pro/i,
  /deepseek/i
]

const PRIORITY_RANK: Record<UsageCoachingHintPriority, number> = {
  high: 0,
  medium: 1,
  low: 2
}

function featureInteractions(
  rows: UsageFeatureTotal[] | undefined,
  feature: string
): number {
  if (!rows?.length) return 0
  return rows
    .filter((r) => r.feature === feature)
    .reduce((sum, r) => sum + usageNumber(r.user_initiated_interaction_count), 0)
}

function hasBreakdown(input: UsageCoachingHintInput): boolean {
  return (
    (input.totals_by_feature?.length ?? 0) > 0
    || (input.totals_by_model_feature?.length ?? 0) > 0
  )
}

export function isPremiumModelName(model: string): boolean {
  const name = model.trim()
  if (!name) return false
  return PREMIUM_MODEL_PATTERNS.some((pattern) => pattern.test(name))
}

export function modelsForFeature(
  rows: UsageModelFeatureTotal[] | undefined,
  feature: string
): Array<{ model: string; interactions: number }> {
  if (!rows?.length) return []
  const byModel = new Map<string, number>()
  for (const row of rows) {
    if (row.feature !== feature) continue
    const model = (row.model || '').trim()
    if (!model) continue
    const count = usageNumber(row.user_initiated_interaction_count)
    if (count <= 0) continue
    byModel.set(model, (byModel.get(model) || 0) + count)
  }
  return [...byModel.entries()]
    .map(([model, interactions]) => ({ model, interactions }))
    .sort((a, b) => b.interactions - a.interactions)
}

export function premiumModelsUsed(
  rows: UsageModelFeatureTotal[] | undefined
): string[] {
  if (!rows?.length) return []
  const models = new Set<string>()
  for (const row of rows) {
    const model = (row.model || '').trim()
    if (!model || !isPremiumModelName(model)) continue
    if (usageNumber(row.user_initiated_interaction_count) <= 0) continue
    models.add(model)
  }
  return [...models].sort()
}

function formatModelList(models: string[], max = 3): string {
  if (models.length === 0) return ''
  const shown = models.slice(0, max)
  const rest = models.length - shown.length
  return rest > 0 ? `${shown.join(', ')} +${rest}` : shown.join(', ')
}

export function buildUsageCoachingHints(input: UsageCoachingHintInput): UsageCoachingHint[] {
  const hints: UsageCoachingHint[] = []
  const interactions = usageNumber(input.interactions)
  const generations = usageNumber(input.generations)
  const acceptances = usageNumber(input.acceptances)
  const acceptanceRate =
    input.acceptanceRate ??
    (generations > 0 ? (acceptances / generations) * 100 : 0)
  const engagement = input.engagementScore ?? 0
  const active = interactions >= 10 || engagement >= 25

  if (interactions > 0 && !hasBreakdown(input)) {
    hints.push({
      id: 'insufficient_breakdown',
      priority: 'low',
      params: {}
    })
    return hints
  }

  const planInteractions = featureInteractions(input.totals_by_feature, PLAN_MODE_FEATURE)
  const planModels = modelsForFeature(input.totals_by_model_feature, PLAN_MODE_FEATURE)
  const premiumModels = premiumModelsUsed(input.totals_by_model_feature)
  const aiUsed = usageNumber(input.ai_credits?.used)
  const aiUsd = usageNumber(input.ai_credits?.netAmount)

  if (planInteractions > 0) {
    hints.push({
      id: 'plan_mode_summary',
      priority: 'low',
      params: {
        interactions: planInteractions,
        models: formatModelList(planModels.map((m) => m.model)) || '—'
      }
    })
  } else if (active && (input.used_chat || input.used_agent)) {
    hints.push({
      id: 'no_plan_mode',
      priority: 'medium',
      params: {}
    })
  }

  if (premiumModels.length > 0 && planInteractions === 0 && active) {
    hints.push({
      id: 'premium_without_plan',
      priority: 'high',
      params: { models: formatModelList(premiumModels) }
    })
  } else if (premiumModels.length === 0 && active && generations >= 5) {
    hints.push({
      id: 'no_premium_models',
      priority: 'medium',
      params: {}
    })
  }

  const costly = aiUsd >= 5 || aiUsed >= 10 || input.ai_credits?.exceedsQuota
  if (costly && acceptanceRate < 35 && generations >= 15) {
    hints.push({
      id: 'high_spend_low_acceptance',
      priority: 'high',
      params: {
        acceptanceRate: Math.round(acceptanceRate),
        spend: aiUsd > 0 ? aiUsd.toFixed(2) : '—'
      }
    })
  }

  return hints
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    .slice(0, 4)
}
