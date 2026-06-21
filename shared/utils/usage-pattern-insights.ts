import type {
  UsageActivityInput,
  UsageDerivedRates,
  UsageInsightConfidence,
  UsageOrgBenchmarks,
  UsagePatternId,
  UsageRatePercentiles,
  UsageRecommendationContext,
  UserUsageInsight
} from '../types/usage-pattern'
import { buildUsageRecommendation } from './usage-pattern-recommendations'

const MIN_ACTIVITY_EVENTS = 3
const MIN_LOC_FOR_CLASSIFY = 25

function safeDiv(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return numerator / denominator
}

export function computeDerivedRates(input: UsageActivityInput): UsageDerivedRates {
  const generations = Math.max(0, input.generations)
  const interactions = Math.max(0, input.interactions)
  const acceptances = Math.max(0, input.acceptances)
  const locAdded = Math.max(0, input.locAdded)

  return {
    acceptanceRate: safeDiv(acceptances, generations) * 100,
    generationsPerInteraction: safeDiv(generations, interactions),
    locPerAcceptance: safeDiv(locAdded, acceptances),
    locPerInteraction: safeDiv(locAdded, interactions),
    locPerGeneration: safeDiv(locAdded, generations)
  }
}

function activityScore(input: UsageActivityInput): number {
  return input.interactions + input.generations + input.acceptances
}

function sortedNumeric(values: number[]): number[] {
  return [...values].filter((v) => Number.isFinite(v)).sort((a, b) => a - b)
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0
  if (sorted.length === 1) return sorted[0]
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  const weight = index - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

/** Share of cohort with a strictly lower value (0–100). */
export function percentileRank(value: number, cohort: number[]): number {
  const finite = cohort.filter((v) => Number.isFinite(v))
  if (!finite.length) return 50
  const below = finite.filter((v) => v < value).length
  return Math.round((below / finite.length) * 100)
}

function median(sorted: number[]): number {
  return percentile(sorted, 0.5)
}

export function buildOrgBenchmarks(users: UsageActivityInput[]): UsageOrgBenchmarks {
  const rates = users.map(computeDerivedRates)
  const interactions = sortedNumeric(users.map((u) => u.interactions))
  const generations = sortedNumeric(users.map((u) => u.generations))
  const acceptances = sortedNumeric(users.map((u) => u.acceptances))
  const locAdded = sortedNumeric(users.map((u) => u.locAdded))
  const acceptanceRate = sortedNumeric(rates.map((r) => r.acceptanceRate))
  const generationsPerInteraction = sortedNumeric(rates.map((r) => r.generationsPerInteraction))
  const locPerAcceptance = sortedNumeric(rates.map((r) => r.locPerAcceptance))
  const locPerInteraction = sortedNumeric(rates.map((r) => r.locPerInteraction))
  const locPerGeneration = sortedNumeric(rates.map((r) => r.locPerGeneration))

  const medians = {
    interactions: median(interactions),
    generations: median(generations),
    acceptances: median(acceptances),
    locAdded: median(locAdded),
    acceptanceRate: median(acceptanceRate),
    generationsPerInteraction: median(generationsPerInteraction),
    locPerAcceptance: median(locPerAcceptance),
    locPerInteraction: median(locPerInteraction),
    locPerGeneration: median(locPerGeneration)
  }

  const p25 = {
    interactions: percentile(interactions, 0.25),
    generations: percentile(generations, 0.25),
    acceptances: percentile(acceptances, 0.25),
    locAdded: percentile(locAdded, 0.25),
    acceptanceRate: percentile(acceptanceRate, 0.25),
    generationsPerInteraction: percentile(generationsPerInteraction, 0.25),
    locPerAcceptance: percentile(locPerAcceptance, 0.25),
    locPerInteraction: percentile(locPerInteraction, 0.25),
    locPerGeneration: percentile(locPerGeneration, 0.25)
  }

  const p75 = {
    interactions: percentile(interactions, 0.75),
    generations: percentile(generations, 0.75),
    acceptances: percentile(acceptances, 0.75),
    locAdded: percentile(locAdded, 0.75),
    acceptanceRate: percentile(acceptanceRate, 0.75),
    generationsPerInteraction: percentile(generationsPerInteraction, 0.75),
    locPerAcceptance: percentile(locPerAcceptance, 0.75),
    locPerInteraction: percentile(locPerInteraction, 0.75),
    locPerGeneration: percentile(locPerGeneration, 0.75)
  }

  return {
    userCount: users.length,
    medians,
    percentiles: { p25, p75 }
  }
}

function computePercentiles(
  input: UsageActivityInput,
  rates: UsageDerivedRates,
  benchmarks: UsageOrgBenchmarks,
  cohortRates: UsageDerivedRates[],
  cohortUsers: UsageActivityInput[]
): UsageRatePercentiles {
  return {
    interactions: percentileRank(input.interactions, cohortUsers.map((u) => u.interactions)),
    generations: percentileRank(input.generations, cohortUsers.map((u) => u.generations)),
    acceptances: percentileRank(input.acceptances, cohortUsers.map((u) => u.acceptances)),
    locAdded: percentileRank(input.locAdded, cohortUsers.map((u) => u.locAdded)),
    acceptanceRate: percentileRank(rates.acceptanceRate, cohortRates.map((r) => r.acceptanceRate)),
    generationsPerInteraction: percentileRank(
      rates.generationsPerInteraction,
      cohortRates.map((r) => r.generationsPerInteraction)
    ),
    locPerAcceptance: percentileRank(rates.locPerAcceptance, cohortRates.map((r) => r.locPerAcceptance)),
    locPerInteraction: percentileRank(rates.locPerInteraction, cohortRates.map((r) => r.locPerInteraction)),
    locPerGeneration: percentileRank(rates.locPerGeneration, cohortRates.map((r) => r.locPerGeneration))
  }
}

function engagementScore(input: UsageActivityInput, cohort: UsageActivityInput[]): number {
  const score = activityScore(input)
  const max = Math.max(1, ...cohort.map(activityScore))
  return Math.min(100, Math.round((score / max) * 100))
}

function confidenceFromActivity(score: number): UsageInsightConfidence {
  if (score >= 25) return 'high'
  if (score >= 10) return 'medium'
  return 'low'
}

function isLow(value: number, p25: number): boolean {
  return value <= p25
}

function isHigh(value: number, p75: number): boolean {
  return value >= p75
}

/** Patterns that imply effective Copilot use — require meaningful activity, not rate alone. */
const QUALITY_USAGE_PATTERNS = new Set<UsagePatternId>([
  'selective_accepter',
  'efficient_adopter',
  'volume_adopter',
  'power_user',
  'completion_first',
  'active_reviewer'
])

/**
 * True when period activity is too low to label as selective/efficient/etc.
 * Aligns with copilot-quality-score gates (prevents "high acceptance, barely used").
 */
function isBelowMeaningfulActivity(
  input: UsageActivityInput,
  bench: UsageOrgBenchmarks
): boolean {
  const { p25, med } = bench.percentiles
  const score = activityScore(input)

  if (score < 25) {
    return true
  }

  const lowDimensions = [
    isLow(input.interactions, p25.interactions),
    isLow(input.generations, p25.generations),
    isLow(input.acceptances, p25.acceptances)
  ].filter(Boolean).length

  if (lowDimensions >= 2 && score < 50) {
    return true
  }

  return false
}

function refinePatternForActivityVolume(
  patternId: UsagePatternId,
  input: UsageActivityInput,
  bench: UsageOrgBenchmarks
): UsagePatternId {
  if (!QUALITY_USAGE_PATTERNS.has(patternId)) {
    return patternId
  }
  if (!isBelowMeaningfulActivity(input, bench)) {
    return patternId
  }
  // High acceptance count — selective label is still fair
  if (
    patternId === 'selective_accepter' &&
    !isLow(input.acceptances, bench.percentiles.p25.acceptances)
  ) {
    return patternId
  }
  return 'light_user'
}

export function classifyUsagePattern(
  input: UsageActivityInput,
  rates: UsageDerivedRates,
  bench: UsageOrgBenchmarks
): UsagePatternId {
  const { p25, p75 } = bench.percentiles
  const score = activityScore(input)

  if (score < MIN_ACTIVITY_EVENTS && input.locAdded < MIN_LOC_FOR_CLASSIFY) {
    return 'insufficient_data'
  }

  if (
    score < 8 &&
    isLow(input.interactions, p25.interactions) &&
    isLow(input.generations, p25.generations) &&
    isLow(input.locAdded, p25.locAdded)
  ) {
    return 'underuse'
  }

  if (
    isHigh(input.generations, p75.generations) &&
    isHigh(input.locAdded, p75.locAdded) &&
    rates.acceptanceRate <= p25.acceptanceRate &&
    input.generations >= 5
  ) {
    return 'high_try_low_keep'
  }

  const med = bench.medians

  if (
    isHigh(input.interactions, p75.interactions) &&
    input.generations >= med.generations &&
    rates.acceptanceRate <= p25.acceptanceRate
  ) {
    return refinePatternForActivityVolume('active_reviewer', input, bench)
  }

  if (
    isHigh(rates.locPerInteraction, p75.locPerInteraction) &&
    input.interactions <= med.interactions &&
    input.locAdded >= p25.locAdded
  ) {
    return refinePatternForActivityVolume('completion_first', input, bench)
  }

  if (
    rates.acceptanceRate >= p75.acceptanceRate &&
    input.locAdded <= med.locAdded &&
    input.interactions <= med.interactions &&
    input.generations >= 1
  ) {
    return refinePatternForActivityVolume('selective_accepter', input, bench)
  }

  if (isHigh(input.locAdded, p75.locAdded) && input.acceptances >= med.acceptances) {
    return refinePatternForActivityVolume('volume_adopter', input, bench)
  }

  if (
    rates.acceptanceRate >= p75.acceptanceRate &&
    input.locAdded >= p25.locAdded &&
    input.generations >= p25.generations
  ) {
    return refinePatternForActivityVolume('efficient_adopter', input, bench)
  }

  if (
    isHigh(input.locAdded, p75.locAdded) &&
    isHigh(input.generations, p75.generations) &&
    (input.used_agent || input.used_chat)
  ) {
    return refinePatternForActivityVolume('power_user', input, bench)
  }

  if (
    score < 15 &&
    isLow(input.interactions, med.interactions) &&
    isLow(input.generations, med.generations) &&
    isLow(input.locAdded, med.locAdded)
  ) {
    return 'light_user'
  }

  if (isBelowMeaningfulActivity(input, bench)) {
    return 'light_user'
  }

  return 'balanced_user'
}

export function buildUserUsageInsight(
  input: UsageActivityInput,
  cohort: UsageActivityInput[],
  recoContext?: UsageRecommendationContext
): UserUsageInsight {
  const benchmarks = buildOrgBenchmarks(cohort)
  const cohortRates = cohort.map(computeDerivedRates)
  const rates = computeDerivedRates(input)
  const patternId = classifyUsagePattern(input, rates, benchmarks)
  const score = activityScore(input)

  const partial = {
    patternId,
    confidence: confidenceFromActivity(score),
    engagementScore: engagementScore(input, cohort),
    rates,
    percentiles: computePercentiles(input, rates, benchmarks, cohortRates, cohort),
    orgMedians: benchmarks.medians,
    orgUserCount: benchmarks.userCount
  }

  return {
    ...partial,
    recommendation: buildUsageRecommendation(input, partial, {
      topModel: recoContext?.topModel ?? input.topModel ?? null
    })
  }
}

export function buildUsageInsightsMap(
  users: UsageActivityInput[]
): Map<string, UserUsageInsight> {
  const map = new Map<string, UserUsageInsight>()
  if (!users.length) return map

  for (const user of users) {
    if (!user.user_login) continue
    map.set(user.user_login.toLowerCase(), buildUserUsageInsight(user, users))
  }
  return map
}

export function activityInputFromLeaderboardRow(row: {
  user_login: string
  interactions: number
  generations: number
  acceptances: number
  locAdded: number
  used_agent?: boolean
  used_chat?: boolean
  used_cli?: boolean
  topModel?: string
}): UsageActivityInput {
  return {
    user_login: row.user_login,
    interactions: row.interactions,
    generations: row.generations,
    acceptances: row.acceptances,
    locAdded: row.locAdded,
    used_agent: row.used_agent,
    used_chat: row.used_chat,
    used_cli: row.used_cli,
    topModel: row.topModel ?? null
  }
}

export function activityInputFromUsageRecord(row: {
  user_login: string
  user_initiated_interaction_count?: number
  code_generation_activity_count?: number
  code_acceptance_activity_count?: number
  loc_added_sum?: number
  used_agent?: boolean
  used_chat?: boolean
  used_cli?: boolean
}): UsageActivityInput {
  return {
    user_login: row.user_login,
    interactions: row.user_initiated_interaction_count ?? 0,
    generations: row.code_generation_activity_count ?? 0,
    acceptances: row.code_acceptance_activity_count ?? 0,
    locAdded: row.loc_added_sum ?? 0,
    used_agent: Boolean(row.used_agent),
    used_chat: Boolean(row.used_chat),
    used_cli: Boolean(row.used_cli)
  }
}
