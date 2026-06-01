import type { TranslateFn } from '../../shared/i18n'

const CHART_TOOLTIP_KEYS = {
  acceptanceRateByCount: 'charts.acceptanceRateByCount',
  totalSuggestionsAndAcceptances: 'charts.totalSuggestionsAndAcceptances',
  acceptanceRateByLines: 'charts.acceptanceRateByLines',
  totalLinesSuggestedAccepted: 'charts.totalLinesSuggestedAccepted',
  totalActiveUsers: 'charts.totalActiveUsers',
  dauWauMau: 'charts.dauWauMau',
  chatAcceptancesAndTurns: 'charts.chatAcceptancesAndTurns',
  chatActiveUsers: 'charts.chatActiveUsers',
  chatRequestsByMode: 'charts.chatRequestsByMode',
  usageInsightsOverview: 'charts.usageInsightsOverview',
  copilotFeatureUsageOverTime: 'charts.copilotFeatureUsageOverTime',
  usageInsightsDauWauMau: 'charts.usageInsightsDauWauMau',
  usageInsightsChatByMode: 'charts.usageInsightsChatByMode',
  usageInsightsCli: 'charts.usageInsightsCli',
  modelsUsedByUsers: 'charts.modelsUsedByUsers',
  teamsAcceptanceRateByCount: 'charts.teamsAcceptanceRateByCount',
  teamsTotalSuggestions: 'charts.teamsTotalSuggestions',
  teamsAcceptanceRateByLines: 'charts.teamsAcceptanceRateByLines',
  teamsLinesSuggestedAccepted: 'charts.teamsLinesSuggestedAccepted',
  teamsActiveUsers: 'charts.teamsActiveUsers',
  teamsIdeCompletions: 'charts.teamsIdeCompletions',
  teamsIdeChat: 'charts.teamsIdeChat',
  teamsDotcomChat: 'charts.teamsDotcomChat',
  teamsDotcomPr: 'charts.teamsDotcomPr',
  teamsLanguageUsage: 'charts.teamsLanguageUsage',
  teamsEditorUsage: 'charts.teamsEditorUsage',
  billingTopModels: 'charts.billingTopModels',
  billingFeatureAdoption: 'charts.billingFeatureAdoption',
  billingCostBySku: 'charts.billingCostBySku',
  billingPremiumByModel: 'charts.billingPremiumByModel',
  billingTeamUsage: 'charts.billingTeamUsage',
  userTopModels: 'charts.userTopModels',
  userActivityMix: 'charts.userActivityMix',
  userFeatures: 'charts.userFeatures',
  userModelFeature: 'charts.userModelFeature',
  breakdownTopAcceptedPrompts: 'charts.breakdownTopAcceptedPrompts',
  breakdownAcceptanceRateByCount: 'charts.breakdownAcceptanceRateByCount',
  breakdownAcceptanceRateByLines: 'charts.breakdownAcceptanceRateByLines',
  adoptionPhases: 'charts.adoptionPhases',
} as const

export type ChartTooltipKey = keyof typeof CHART_TOOLTIP_KEYS

/** @deprecated Use useChartTooltips() in components for locale-aware tooltips. */
export const CHART_TOOLTIP_KEY_MAP = CHART_TOOLTIP_KEYS

export function buildChartTooltips(t: TranslateFn): Record<ChartTooltipKey, string> {
  const result = {} as Record<ChartTooltipKey, string>
  for (const [key, path] of Object.entries(CHART_TOOLTIP_KEYS) as [ChartTooltipKey, string][]) {
    result[key] = t(path)
  }
  return result
}

export function useChartTooltips() {
  const { t } = useAppI18n()
  return computed(() => buildChartTooltips(t.value))
}
