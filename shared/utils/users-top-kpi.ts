import type { UserUsageInsight } from '../types/usage-pattern'
import { computeCopilotQualityScore } from './copilot-quality-score'

export interface UserEngagementRankEntry<T> {
  user: T
  login: string
  /** Displayed rank score on KPI cards (engagement or quality depending on picker). */
  engagementScore: number
  interactions: number
  generations: number
  acceptances: number
  locAdded: number
}

export type UserEngagementRankMetrics = Omit<UserEngagementRankEntry<unknown>, 'user'>

function pickTopUsersByRankScore<T>(
  users: T[],
  resolve: (user: T) => UserEngagementRankMetrics,
  limit = 5
): UserEngagementRankEntry<T>[] {
  return users
    .map((user) => {
      const metrics = resolve(user)
      return { user, ...metrics }
    })
    .filter((entry) => entry.engagementScore > 0)
    .sort((a, b) => {
      if (b.engagementScore !== a.engagementScore) {
        return b.engagementScore - a.engagementScore
      }
      const activityA = a.interactions + a.generations + a.acceptances
      const activityB = b.interactions + b.generations + b.acceptances
      if (activityB !== activityA) {
        return activityB - activityA
      }
      return a.login.localeCompare(b.login)
    })
    .slice(0, limit)
}

/** Pick up to `limit` users with highest raw engagement (activity volume vs cohort max). */
export function pickTopUsersByEngagement<T>(
  users: T[],
  resolve: (user: T) => UserEngagementRankMetrics,
  limit = 5
): UserEngagementRankEntry<T>[] {
  return pickTopUsersByRankScore(users, resolve, limit)
}

/** Pick up to `limit` users with highest effective Copilot usage (pattern + acceptance, not volume). */
export function pickTopUsersByCopilotQuality<T>(
  users: T[],
  resolve: (user: T) => { login: string; insight: UserUsageInsight | undefined } & Pick<
    UserEngagementRankMetrics,
    'interactions' | 'generations' | 'acceptances' | 'locAdded'
  >,
  limit = 5
): UserEngagementRankEntry<T>[] {
  return pickTopUsersByRankScore(users, (user) => {
    const row = resolve(user)
    const qualityScore = row.insight ? computeCopilotQualityScore(row.insight) : 0
    return {
      login: row.login,
      engagementScore: qualityScore,
      interactions: row.interactions,
      generations: row.generations,
      acceptances: row.acceptances,
      locAdded: row.locAdded
    }
  }, limit)
}

const TOP_USER_KPI_CARD_CLASSES = [
  'brand-metric-card--purple',
  'brand-metric-card--turquoise',
  'brand-metric-card--lavender',
  'brand-metric-card--accent',
  'brand-metric-card--purple'
] as const

export function topUserKpiCardClass(rankIndex: number): string {
  return TOP_USER_KPI_CARD_CLASSES[rankIndex % TOP_USER_KPI_CARD_CLASSES.length]
}
