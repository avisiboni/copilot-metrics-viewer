export interface UsageReportMeta {
  download_links?: string[];
  report_day?: string;
  report_start_day?: string;
  report_end_day?: string;
}

export interface UsageFeatureTotal {
  feature: string;
  user_initiated_interaction_count?: number;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
}

export interface UsageIdeTotal {
  ide: string;
  user_initiated_interaction_count?: number;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
}

export interface UsageLanguageFeatureTotal {
  language: string;
  feature: string;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
}

export interface UsageModelFeatureTotal {
  model: string;
  feature: string;
  user_initiated_interaction_count?: number;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
}

/** AI adoption cohort phase (28-day rolling window). See GitHub Copilot usage metrics API. */
export type AiAdoptionPhaseId = 0 | 1 | 2 | 3

export interface AiAdoptionPhase {
  phase: AiAdoptionPhaseId
  version: string
}

export interface UsagePullRequestPhaseAverages {
  total_created_avg?: number
  total_merged_avg?: number
  total_reviewed_avg?: number
  median_minutes_to_merge_avg?: number
}

/** Organization / enterprise `totals_by_ai_adoption_phase` row (per-user averages). */
export interface UsageAiAdoptionPhaseTotal {
  phase: AiAdoptionPhaseId
  version?: string
  total_engaged_users?: number
  user_initiated_interaction_count_avg?: number
  code_generation_activity_count_avg?: number
  code_acceptance_activity_count_avg?: number
  loc_added_sum_avg?: number
  loc_deleted_sum_avg?: number
  pull_requests?: UsagePullRequestPhaseAverages
}

/** Normalized cohort row for charts and tables in the dashboard. */
export interface AiAdoptionPhaseAggregate {
  phase: AiAdoptionPhaseId
  version: string
  /** Org rollup `total_engaged_users` (≥2 active days in 28-day window). */
  engagedUsers: number
  /** Users report: rows with this `ai_adoption_phase` (matches table chips). */
  labeledUsers?: number
  avgInteractions: number
  avgGenerations: number
  avgAcceptances: number
  avgLocAdded: number
  avgLocDeleted: number
  avgPrCreated?: number
  avgPrMerged?: number
  avgPrReviewed?: number
  medianMinutesToMerge?: number
}

export interface UsageCliTotals {
  session_count?: number;
  request_count?: number;
  prompt_count?: number;
  last_known_cli_version?: string;
  token_usage?: {
    output_tokens_sum?: number;
    prompt_tokens_sum?: number;
    avg_tokens_per_request?: number;
  };
}

export interface UsageDayRecord {
  day: string;
  report_start_day?: string;
  report_end_day?: string;
  enterprise_id?: number;
  organization_id?: number;
  daily_active_users?: number;
  weekly_active_users?: number;
  monthly_active_users?: number;
  monthly_active_chat_users?: number;
  daily_active_cli_users?: number;
  daily_active_copilot_code_review_users?: number;
  daily_passive_copilot_code_review_users?: number;
  weekly_active_copilot_code_review_users?: number;
  weekly_passive_copilot_code_review_users?: number;
  monthly_active_copilot_code_review_users?: number;
  monthly_passive_copilot_code_review_users?: number;
  user_initiated_interaction_count?: number;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
  totals_by_ide?: UsageIdeTotal[];
  totals_by_feature?: UsageFeatureTotal[];
  totals_by_language_feature?: UsageLanguageFeatureTotal[];
  totals_by_model_feature?: UsageModelFeatureTotal[];
  totals_by_language_model?: UsageModelFeatureTotal[];
  totals_by_cli?: UsageCliTotals;
  totals_by_ai_adoption_phase?: UsageAiAdoptionPhaseTotal[];
}

export interface UserTeamRecord {
  day: string;
  user_id: number;
  user_login?: string;
  team_id?: number;
  slug: string;
  organization_id?: number;
  enterprise_id?: number;
}

export interface UserPremiumCredits {
  used: number;
  quota: number;
  remaining: number;
  /** Share of monthly quota consumed (0–100). Drives the progress bar. */
  percentUsed: number;
  percentRemaining: number;
  exceedsQuota?: boolean;
  /** billing = from API; unavailable = per-user PRU not loaded yet or blocked */
  source: 'billing' | 'unavailable';
}

export interface UserAiCredits {
  /** AI credits consumed in the billing period. */
  used: number;
  /** Net USD for AI credit usage when returned by billing API. */
  netAmount?: number;
  exceedsQuota?: boolean;
  /** metrics = usage metrics report `ai_credits_used`; billing = billing API; unavailable = not loaded */
  source: 'metrics' | 'billing' | 'unavailable';
}

export interface UserUsageRecord {
  day?: string;
  user_id: number;
  user_login: string;
  premium_credits?: UserPremiumCredits;
  ai_credits?: UserAiCredits;
  name?: string | null;
  email?: string | null;
  user_initiated_interaction_count?: number;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
  last_known_ide_version?: string | null;
  last_known_plugin_version?: string | null;
  used_agent?: boolean;
  used_chat?: boolean;
  used_cli?: boolean;
  used_copilot_code_review_active?: boolean;
  used_copilot_code_review_passive?: boolean;
  /** Copilot coding agent (issue assignment / @copilot in PR comments). */
  used_copilot_coding_agent?: boolean;
  /** Per-user AI credits from usage metrics reports (June 2026+). */
  ai_credits_used?: number;
  ai_adoption_phase?: AiAdoptionPhase;
  totals_by_feature?: UsageFeatureTotal[];
  totals_by_ide?: UsageIdeTotal[];
  totals_by_model_feature?: UsageModelFeatureTotal[];
  totals_by_language_model?: UsageModelFeatureTotal[];
}

export interface CopilotBillingSettings {
  seat_breakdown?: {
    total?: number;
    added_this_cycle?: number;
    pending_cancellation?: number;
    pending_invitation?: number;
    active_this_cycle?: number;
    inactive_this_cycle?: number;
  };
  public_code_suggestions?: string;
  ide_chat?: string;
  platform_chat?: string;
  cli?: string;
  seat_management_setting?: string;
  plan_type?: string;
}

export const CHAT_PANEL_FEATURES = [
  'chat_panel_agent_mode',
  'chat_panel_ask_mode',
  'chat_panel_edit_mode',
  'chat_panel_plan_mode',
  'chat_panel_custom_mode',
  'chat_panel_unknown_mode'
] as const;

export function isChatPanelFeature(feature: string): boolean {
  return (CHAT_PANEL_FEATURES as readonly string[]).includes(feature);
}

export function usageNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
