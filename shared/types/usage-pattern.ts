/** Suggested usage style from metric ratios vs org benchmarks (heuristic, not ground truth). */
export type UsagePatternId =
  | 'insufficient_data'
  | 'underuse'
  | 'light_user'
  | 'selective_accepter'
  | 'completion_first'
  | 'active_reviewer'
  | 'efficient_adopter'
  | 'volume_adopter'
  | 'high_try_low_keep'
  | 'power_user'
  | 'balanced_user'

export type UsageInsightConfidence = 'low' | 'medium' | 'high'

export interface UsageActivityInput {
  user_login: string
  interactions: number
  generations: number
  acceptances: number
  locAdded: number
  used_agent?: boolean
  used_chat?: boolean
  used_cli?: boolean
  /** From leaderboard row — used for coaching tips only */
  topModel?: string | null
}

export interface UsageDerivedRates {
  /** acceptances / generations, 0–100 */
  acceptanceRate: number
  /** generations / interactions */
  generationsPerInteraction: number
  /** locAdded / acceptances */
  locPerAcceptance: number
  /** locAdded / interactions */
  locPerInteraction: number
  /** locAdded / generations */
  locPerGeneration: number
}

export interface UsageOrgBenchmarks {
  userCount: number
  medians: {
    interactions: number
    generations: number
    acceptances: number
    locAdded: number
    acceptanceRate: number
    generationsPerInteraction: number
    locPerAcceptance: number
    locPerInteraction: number
    locPerGeneration: number
  }
  percentiles: {
    p25: UsageDerivedRates & {
      interactions: number
      generations: number
      acceptances: number
      locAdded: number
    }
    p75: UsageDerivedRates & {
      interactions: number
      generations: number
      acceptances: number
      locAdded: number
    }
  }
}

export interface UsageRatePercentiles {
  interactions: number
  generations: number
  acceptances: number
  locAdded: number
  acceptanceRate: number
  generationsPerInteraction: number
  locPerAcceptance: number
  locPerInteraction: number
  locPerGeneration: number
}

/** Coaching read on how well Copilot usage fits the org (heuristic). */
export type UsageEffectiveness =
  | 'unknown'
  | 'idle'
  | 'building'
  | 'productive'
  | 'mixed'
  | 'high_volume_low_fit'

export type UsageRecommendationPriority = 'high' | 'medium' | 'low'

/** i18n keys under usagePattern.recommendations.headlines / .actions */
export interface UsageRecommendation {
  effectiveness: UsageEffectiveness
  priority: UsageRecommendationPriority
  /** Suffix for usagePattern.recommendations.headlines.{headlineId} */
  headlineId: string
  /** Suffixes for usagePattern.recommendations.actions.{actionId} */
  actionIds: string[]
}

export interface UsageRecommendationContext {
  topModel?: string | null
}

export interface UserUsageInsight {
  patternId: UsagePatternId
  confidence: UsageInsightConfidence
  /** 0–100 relative activity vs busiest user in cohort */
  engagementScore: number
  rates: UsageDerivedRates
  percentiles: UsageRatePercentiles
  orgMedians: UsageOrgBenchmarks['medians']
  orgUserCount: number
  recommendation: UsageRecommendation
}
