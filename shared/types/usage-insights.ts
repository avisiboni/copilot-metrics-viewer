import type { BillingFetchResult, BillingSummaryItem, PremiumRequestUsageItem } from './billing-usage'
import type {
  AiAdoptionPhaseAggregate,
  UserAiCredits,
  UserPremiumCredits,
  UserTeamRecord,
  UserUsageRecord
} from './copilot-usage'
import type { AiAdoptionPhase } from './copilot-usage'

export interface ModelUsageAggregate {
  model: string
  feature: string
  interactions: number
  generations: number
  acceptances: number
  locSuggested: number
  locAdded: number
  userCount: number
}

export interface UserUsageLeaderboardRow {
  user_login: string
  user_id: number
  name?: string | null
  email?: string | null
  interactions: number
  generations: number
  acceptances: number
  locAdded: number
  modelCount: number
  topModel?: string
  used_agent: boolean
  used_chat: boolean
  used_cli: boolean
  used_code_review: boolean
  used_coding_agent: boolean
  ai_adoption_phase?: AiAdoptionPhase
  totals_by_model_feature?: UserUsageRecord['totals_by_model_feature']
  totals_by_feature?: UserUsageRecord['totals_by_feature']
  premium_credits?: UserPremiumCredits
  ai_credits?: UserAiCredits
  pruNetAmount?: number
}

export interface FeatureAdoptionAggregate {
  feature: string
  interactions: number
  users: number
}

export interface TeamUsageAggregate {
  teamSlug: string
  userCount: number
  interactions: number
  acceptances: number
}

export interface SkuCostAggregate {
  sku: string
  netAmount: number
  grossAmount: number
  quantity: number
}

export interface ModelPremiumAggregate {
  model: string
  netQuantity: number
  netAmount: number
  grossAmount: number
  userCount: number
}

export interface UsageInsightsSummary {
  userCount: number
  totalInteractions: number
  totalGenerations: number
  totalAcceptances: number
  totalLocAdded: number
  totalLocDeleted: number
  /** Added + deleted — matches GitHub Insights “lines of code changed with AI”. */
  totalLocChanged: number
  uniqueModels: number
  agentUsers: number
  chatUsers: number
  cliUsers: number
  codingAgentUsers: number
  /** Sum of `ai_credits_used` from usage metrics reports when present. */
  totalAiCreditsUsed?: number
}

export interface UsageInsightsResponse {
  reportStartDay?: string
  reportEndDay?: string
  since?: string
  until?: string
  summary: UsageInsightsSummary
  users: UserUsageLeaderboardRow[]
  modelUsage: ModelUsageAggregate[]
  featureAdoption: FeatureAdoptionAggregate[]
  teamUsage: TeamUsageAggregate[]
  billing: BillingFetchResult
  skuCosts: SkuCostAggregate[]
  premiumByModel: ModelPremiumAggregate[]
  premiumByUser: Array<{ user_login: string; netQuantity: number; netAmount: number; topModel?: string }>
  userTeams: UserTeamRecord[]
  /** Monthly PRU quota per seat (enterprise); used for credits column when billing is available. */
  premiumCreditsQuota?: number
  /** Per-phase engaged users and averages from org/enterprise 28-day report. */
  adoptionByPhase: AiAdoptionPhaseAggregate[]
}
