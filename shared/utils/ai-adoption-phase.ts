import type {
  AiAdoptionPhase,
  AiAdoptionPhaseAggregate,
  AiAdoptionPhaseId,
  UsageAiAdoptionPhaseTotal
} from '../types/copilot-usage'
import { usageNumber } from '../types/copilot-usage'

const PHASE_ORDER: AiAdoptionPhaseId[] = [0, 1, 2, 3]

const PHASE_STRING_MAP: Record<string, AiAdoptionPhaseId> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  no_cohort: 0,
  none: 0,
  phase_0: 0,
  phase0: 0,
  code_first: 1,
  codefirst: 1,
  phase_1: 1,
  phase1: 1,
  agent_first: 2,
  agentfirst: 2,
  phase_2: 2,
  phase2: 2,
  multi_agent: 3,
  multiagent: 3,
  phase_3: 3,
  phase3: 3
}

export function normalizePhaseId(value: unknown): AiAdoptionPhaseId | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 3) {
    return value as AiAdoptionPhaseId
  }
  if (typeof value === 'string') {
    const key = value.trim().toLowerCase().replace(/\s+/g, '_')
    if (key in PHASE_STRING_MAP) {
      return PHASE_STRING_MAP[key]
    }
    const numeric = Number(key)
    if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 3) {
      return numeric as AiAdoptionPhaseId
    }
  }
  return undefined
}

/** Parse user-level `ai_adoption_phase` from the usage metrics report. */
export function parseAiAdoptionPhase(value: unknown): AiAdoptionPhase | undefined {
  if (value == null) return undefined

  if (typeof value === 'number' || typeof value === 'string') {
    const phase = normalizePhaseId(value)
    return phase !== undefined ? { phase, version: 'v1' } : undefined
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const phase = normalizePhaseId(
      obj.phase ?? obj.value ?? obj.name ?? obj.id ?? obj.ai_adoption_phase
    )
    if (phase === undefined) return undefined
    const version = typeof obj.version === 'string' && obj.version.trim()
      ? obj.version.trim()
      : 'v1'
    return { phase, version }
  }

  return undefined
}

function readAvg(record: Record<string, unknown>, base: string): number {
  const avgKey = `${base}_avg`
  if (avgKey in record) return usageNumber(record[avgKey])
  return usageNumber(record[base])
}

function mapPhaseTotalRow(raw: Record<string, unknown>): AiAdoptionPhaseAggregate | null {
  const phase = normalizePhaseId(raw.phase ?? raw.ai_adoption_phase)
  if (phase === undefined) return null

  const pr = (raw.pull_requests && typeof raw.pull_requests === 'object'
    ? raw.pull_requests
    : {}) as Record<string, unknown>

  return {
    phase,
    version: typeof raw.version === 'string' ? raw.version : 'v1',
    engagedUsers: usageNumber(
      raw.total_engaged_users ?? raw.engaged_users ?? raw.total_engaged_users_count
    ),
    avgInteractions: readAvg(raw, 'user_initiated_interaction_count'),
    avgGenerations: readAvg(raw, 'code_generation_activity_count'),
    avgAcceptances: readAvg(raw, 'code_acceptance_activity_count'),
    avgLocAdded: readAvg(raw, 'loc_added_sum'),
    avgLocDeleted: readAvg(raw, 'loc_deleted_sum'),
    avgPrCreated: readAvg(pr, 'total_created'),
    avgPrMerged: readAvg(pr, 'total_merged'),
    avgPrReviewed: readAvg(pr, 'total_reviewed'),
    medianMinutesToMerge: usageNumber(
      pr.median_minutes_to_merge_avg ?? pr.median_minutes_to_merge
    )
  }
}

/** Read org/enterprise `totals_by_ai_adoption_phase` from a report line or nested day total. */
export function extractAdoptionPhaseTotals(
  record: Record<string, unknown> | null | undefined
): AiAdoptionPhaseAggregate[] {
  if (!record) return []

  const direct = record.totals_by_ai_adoption_phase
  if (Array.isArray(direct) && direct.length) {
    return sortPhaseTotals(
      direct
        .map((row) => mapPhaseTotalRow(row as Record<string, unknown>))
        .filter((row): row is AiAdoptionPhaseAggregate => row != null)
    )
  }

  const dayTotals = record.day_totals
  if (Array.isArray(dayTotals) && dayTotals.length) {
    for (let i = dayTotals.length - 1; i >= 0; i--) {
      const nested = extractAdoptionPhaseTotals(dayTotals[i] as Record<string, unknown>)
      if (nested.length) return nested
    }
  }

  return []
}

export function sortPhaseTotals(
  rows: AiAdoptionPhaseAggregate[]
): AiAdoptionPhaseAggregate[] {
  return [...rows].sort(
    (a, b) => PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase)
  )
}

export function countUsersByPhase(
  users: Array<{ ai_adoption_phase?: AiAdoptionPhase }>
): Record<AiAdoptionPhaseId, number> {
  const counts: Record<AiAdoptionPhaseId, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }
  for (const user of users) {
    const phase = user.ai_adoption_phase?.phase ?? 0
    counts[phase] += 1
  }
  return counts
}

function emptyPhaseAggregate(
  phase: AiAdoptionPhaseId,
  labeledUsers?: number
): AiAdoptionPhaseAggregate {
  return {
    phase,
    version: 'v1',
    engagedUsers: 0,
    labeledUsers,
    avgInteractions: 0,
    avgGenerations: 0,
    avgAcceptances: 0,
    avgLocAdded: 0,
    avgLocDeleted: 0
  }
}

function filterVisiblePhaseRows(rows: AiAdoptionPhaseAggregate[]): AiAdoptionPhaseAggregate[] {
  return rows.filter(
    (row) =>
      row.engagedUsers > 0 ||
      (row.labeledUsers ?? 0) > 0 ||
      row.phase === 0
  )
}

/** Merge org cohort totals with per-user labels from the users report. */
export function buildAdoptionPhaseView(
  orgTotals: AiAdoptionPhaseAggregate[],
  users: Array<{ ai_adoption_phase?: AiAdoptionPhase }>
): AiAdoptionPhaseAggregate[] {
  const userCounts = countUsersByPhase(users)
  const hasUserList = users.length > 0

  if (orgTotals.length) {
    const merged = new Map<AiAdoptionPhaseId, AiAdoptionPhaseAggregate>()
    for (const row of orgTotals) {
      merged.set(row.phase, {
        ...row,
        labeledUsers: hasUserList ? userCounts[row.phase] : undefined
      })
    }
    if (hasUserList) {
      for (const phase of PHASE_ORDER) {
        const labeled = userCounts[phase]
        if (!merged.has(phase) && labeled > 0) {
          merged.set(phase, emptyPhaseAggregate(phase, labeled))
        }
      }
    }
    return sortPhaseTotals(filterVisiblePhaseRows(Array.from(merged.values())))
  }

  const userCountsOnly = PHASE_ORDER.map((phase) => ({
    phase,
    version: 'v1',
    engagedUsers: userCounts[phase],
    avgInteractions: 0,
    avgGenerations: 0,
    avgAcceptances: 0,
    avgLocAdded: 0,
    avgLocDeleted: 0
  })).filter((row) => row.engagedUsers > 0 || row.phase === 0)

  return sortPhaseTotals(userCountsOnly)
}

export function phaseChipColor(phase: AiAdoptionPhaseId): string {
  switch (phase) {
    case 1:
      return 'primary'
    case 2:
      return 'info'
    case 3:
      return 'warning'
    default:
      return 'default'
  }
}

export function toUsageAiAdoptionPhaseTotals(
  rows: AiAdoptionPhaseAggregate[]
): UsageAiAdoptionPhaseTotal[] {
  return rows.map((row) => ({
    phase: row.phase,
    version: row.version,
    total_engaged_users: row.engagedUsers,
    user_initiated_interaction_count_avg: row.avgInteractions,
    code_generation_activity_count_avg: row.avgGenerations,
    code_acceptance_activity_count_avg: row.avgAcceptances,
    loc_added_sum_avg: row.avgLocAdded,
    loc_deleted_sum_avg: row.avgLocDeleted,
    pull_requests: {
      total_created_avg: row.avgPrCreated,
      total_merged_avg: row.avgPrMerged,
      total_reviewed_avg: row.avgPrReviewed,
      median_minutes_to_merge_avg: row.medianMinutesToMerge
    }
  }))
}
