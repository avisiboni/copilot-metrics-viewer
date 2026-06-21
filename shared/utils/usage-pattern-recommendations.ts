import type {
  UsageActivityInput,
  UsageEffectiveness,
  UsagePatternId,
  UsageRecommendation,
  UsageRecommendationContext,
  UsageRecommendationPriority,
  UserUsageInsight
} from '../types/usage-pattern'

type InsightSlice = Pick<
  UserUsageInsight,
  'patternId' | 'engagementScore' | 'confidence' | 'percentiles' | 'rates'
>

interface RecoSet {
  headlineId: string
  actionIds: string[]
  priority: UsageRecommendationPriority
  effectiveness: UsageEffectiveness
}

function isHeavyLowFit(insight: InsightSlice): boolean {
  if (insight.patternId === 'high_try_low_keep') return true
  return (
    insight.engagementScore >= 55 &&
    insight.percentiles.acceptanceRate <= 25 &&
    insight.percentiles.generations >= 50
  )
}

function isProductive(insight: InsightSlice): boolean {
  if (['efficient_adopter', 'power_user'].includes(insight.patternId)) return true
  if (insight.patternId === 'volume_adopter' && insight.percentiles.acceptanceRate >= 45) {
    return true
  }
  if (
    insight.patternId === 'balanced_user' &&
    insight.percentiles.acceptanceRate >= 40 &&
    insight.engagementScore >= 25
  ) {
    return true
  }
  return false
}

function deriveEffectiveness(
  patternId: UsagePatternId,
  insight: InsightSlice
): UsageEffectiveness {
  if (patternId === 'insufficient_data') return 'unknown'
  if (patternId === 'underuse') return 'idle'
  if (isHeavyLowFit(insight)) return 'high_volume_low_fit'
  if (isProductive(insight)) return 'productive'
  if (['light_user', 'selective_accepter', 'completion_first'].includes(patternId)) {
    return 'building'
  }
  if (['active_reviewer', 'balanced_user'].includes(patternId)) return 'mixed'
  if (patternId === 'volume_adopter') return 'high_volume_low_fit'
  return 'mixed'
}

function baseSetForPattern(patternId: UsagePatternId, insight: InsightSlice): RecoSet {
  const effectiveness = deriveEffectiveness(patternId, insight)

  if (patternId === 'insufficient_data') {
    return {
      effectiveness: 'unknown',
      priority: 'low',
      headlineId: 'insufficient_data',
      actionIds: ['waitForActivity', 'tryShortSession', 'checkDateRange']
    }
  }

  if (patternId === 'underuse') {
    return {
      effectiveness: 'idle',
      priority: 'high',
      headlineId: 'underuse',
      actionIds: ['enableCopilot', 'officeHours', 'removeBlockers', 'pairOnFirstTask']
    }
  }

  if (patternId === 'light_user') {
    return {
      effectiveness: 'building',
      priority: 'medium',
      headlineId: 'light_user',
      actionIds: ['dailyCopilotGoal', 'tryChatOnce', 'watchDemo', 'pickSmallTicket']
    }
  }

  if (patternId === 'high_try_low_keep' || (patternId === 'volume_adopter' && effectiveness === 'high_volume_low_fit')) {
    return {
      effectiveness: 'high_volume_low_fit',
      priority: 'high',
      headlineId: 'high_volume_low_fit',
      actionIds: [
        'repoInstructions',
        'scopedPrompts',
        'tryChatRefactor',
        'pairWithPeer',
        'reviewAcceptanceHabit'
      ]
    }
  }

  if (patternId === 'active_reviewer') {
    return {
      effectiveness: 'mixed',
      priority: 'high',
      headlineId: 'active_reviewer',
      actionIds: [
        'repoInstructions',
        'acceptOrDismiss',
        'smallerEdits',
        'compareWithEfficientPeer'
      ]
    }
  }

  if (patternId === 'selective_accepter') {
    return {
      effectiveness: 'building',
      priority: 'medium',
      headlineId: 'selective_accepter',
      actionIds: ['qualityIsGood', 'tryLargerChatTask', 'shareSelectiveWorkflow', 'optionalExpandUsage']
    }
  }

  if (patternId === 'completion_first') {
    return {
      effectiveness: 'building',
      priority: 'medium',
      headlineId: 'completion_first',
      actionIds: ['keepCompletions', 'tryChatForTests', 'agentForMultiFile', 'documentPatterns']
    }
  }

  if (patternId === 'efficient_adopter') {
    return {
      effectiveness: 'productive',
      priority: 'low',
      headlineId: 'efficient_adopter',
      actionIds: ['championInvite', 'lunchAndLearn', 'captureTips', 'stretchWithAgent']
    }
  }

  if (patternId === 'volume_adopter') {
    return {
      effectiveness: 'productive',
      priority: 'medium',
      headlineId: 'volume_adopter',
      actionIds: ['prQualityCheck', 'shareVolumePatterns', 'balanceSpeedAndReview', 'mentorOthers']
    }
  }

  if (patternId === 'power_user') {
    return {
      effectiveness: 'productive',
      priority: 'low',
      headlineId: 'power_user',
      actionIds: [
        'orgChampion',
        'crossTeamDemo',
        'exploreNewSurfaces',
        'guardrailForBurnout'
      ]
    }
  }

  return {
    effectiveness: effectiveness === 'productive' ? 'productive' : 'mixed',
    priority: 'medium',
    headlineId: 'balanced_user',
    actionIds: ['maintainRhythm', 'tryOneNewSurface', 'monthlySelfCheck', 'benchmarkWithMedian']
  }
}

function appendUnique(target: string[], ids: string[]): string[] {
  for (const id of ids) {
    if (!target.includes(id)) target.push(id)
  }
  return target
}

function contextualActions(
  input: UsageActivityInput,
  insight: InsightSlice,
  ctx?: UsageRecommendationContext
): string[] {
  const extras: string[] = []

  if (!input.used_chat && insight.percentiles.interactions <= 40) {
    extras.push('tryChat')
  }
  if (!input.used_agent && insight.engagementScore >= 35) {
    extras.push('tryAgent')
  }
  if (input.used_cli) {
    extras.push('cliWorkflow')
  }
  if (ctx?.topModel && isHeavyLowFit(insight)) {
    extras.push('modelExperiment')
  }
  if (insight.confidence === 'low') {
    extras.push('lowConfidenceNote')
  }

  return extras
}

export function buildUsageRecommendation(
  input: UsageActivityInput,
  insight: InsightSlice,
  ctx?: UsageRecommendationContext
): UsageRecommendation {
  const base = baseSetForPattern(insight.patternId, insight)
  const actions = appendUnique([...base.actionIds], contextualActions(input, insight, ctx)).slice(
    0,
    5
  )

  return {
    effectiveness: base.effectiveness,
    priority: base.priority,
    headlineId: base.headlineId,
    actionIds: actions
  }
}
