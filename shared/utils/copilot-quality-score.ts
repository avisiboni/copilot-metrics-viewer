import type { UsagePatternId, UserUsageInsight } from '../types/usage-pattern'

/** Patterns that should not appear in “best Copilot users” rankings. */
const EXCLUDED_PATTERNS = new Set<UsagePatternId>([
  'insufficient_data',
  'underuse',
  'high_try_low_keep',
  'light_user'
])

/** Base score from classified usage pattern (how “right” the workflow looks). */
const PATTERN_QUALITY_BASE: Record<UsagePatternId, number> = {
  power_user: 95,
  efficient_adopter: 90,
  volume_adopter: 78,
  selective_accepter: 72,
  balanced_user: 58,
  completion_first: 54,
  active_reviewer: 50,
  light_user: 0,
  high_try_low_keep: 0,
  underuse: 0,
  insufficient_data: 0
}

/** Mean percentile for interactions, generations, and acceptances vs org. */
function averageActivityPercentile(insight: UserUsageInsight): number {
  const p = insight.percentiles
  return Math.round((p.interactions + p.generations + p.acceptances) / 3)
}

/**
 * 0–1 weight from actual Copilot usage in the period.
 * High acceptance alone (few events) should not score like sustained effective use.
 */
function usageVolumeMultiplier(insight: UserUsageInsight): number {
  const activityPct = averageActivityPercentile(insight)
  const engagement = insight.engagementScore

  // Hard gate: very light users are not “top effective” candidates
  if (activityPct < 28 && engagement < 28) {
    return 0
  }

  // Ramp from low to solid org-relative activity (percentile ~15 → 70)
  const activityRamp = Math.max(0, Math.min(1, (activityPct - 15) / 55))
  const engagementRamp = Math.max(0, Math.min(1, (engagement - 12) / 58))

  return 0.25 + 0.75 * Math.max(activityRamp, engagementRamp * 0.9)
}

/**
 * 0–100 score for ranking “best” Copilot users: effective patterns plus
 * meaningful usage volume in the report window — not acceptance rate alone.
 */
export function computeCopilotQualityScore(insight: UserUsageInsight): number {
  if (EXCLUDED_PATTERNS.has(insight.patternId)) {
    return 0
  }

  if (
    insight.recommendation.effectiveness === 'high_volume_low_fit' &&
    insight.percentiles.acceptanceRate < 35
  ) {
    return 0
  }

  if (insight.recommendation.effectiveness === 'idle' || insight.recommendation.effectiveness === 'unknown') {
    return 0
  }

  const usageMultiplier = usageVolumeMultiplier(insight)
  if (usageMultiplier <= 0) {
    return 0
  }

  const patternBase = PATTERN_QUALITY_BASE[insight.patternId] ?? 40
  const acceptancePct = insight.percentiles.acceptanceRate
  const acceptanceRate = Math.min(insight.rates.acceptanceRate, 100)
  const activityPct = averageActivityPercentile(insight)

  let volumePenalty = 0
  if (insight.engagementScore >= 45 && insight.percentiles.acceptanceRate <= 25) {
    volumePenalty = 20
  }

  const qualityRaw = Math.round(
    patternBase * 0.45 +
      acceptancePct * 0.3 +
      acceptanceRate * 0.1 +
      activityPct * 0.15 -
      volumePenalty
  )

  const score = Math.round(qualityRaw * usageMultiplier)

  return Math.max(0, Math.min(100, score))
}
