import type { UserUsageRecord } from '../types/copilot-usage'
import type { UserUsageInsight } from '../types/usage-pattern'

export interface UserAnalyticsExportLabels {
  login: string
  name: string
  email: string
  usagePattern: string
  engagementScore: string
  acceptanceRate: string
  aiCreditsUsed: string
  aiCreditsNetUsd: string
  interactions: string
  generations: string
  acceptances: string
  locAdded: string
  usedAgent: string
  usedChat: string
  usedCodingAgent: string
  lastIdeVersion: string
  lastPluginVersion: string
  adoptionPhase: string
  yes: string
  no: string
}

export const DEFAULT_USER_ANALYTICS_EXPORT_LABELS: UserAnalyticsExportLabels = {
  login: 'Login',
  name: 'Name',
  email: 'Email',
  usagePattern: 'Usage pattern',
  engagementScore: 'Engagement score',
  acceptanceRate: 'Acceptance rate (%)',
  aiCreditsUsed: 'AI credits used',
  aiCreditsNetUsd: 'AI credits net (USD)',
  interactions: 'Interactions',
  generations: 'Generations',
  acceptances: 'Acceptances',
  locAdded: 'LoC added',
  usedAgent: 'Agent',
  usedChat: 'Chat',
  usedCodingAgent: 'Coding agent',
  lastIdeVersion: 'Last IDE version',
  lastPluginVersion: 'Last plugin version',
  adoptionPhase: 'AI adoption phase',
  yes: 'Yes',
  no: 'No',
}

export interface UserAnalyticsExportOptions {
  labels?: Partial<UserAnalyticsExportLabels>
  includeAiCredits?: boolean
  getInsight?: (login: string) => UserUsageInsight | undefined
  /** Optional date-range / report label stored on a metadata sheet. */
  reportRange?: string | null
  sheetName?: string
}

function boolLabel(value: boolean | undefined, labels: UserAnalyticsExportLabels): string {
  return value ? labels.yes : labels.no
}

function patternLabel(insight: UserUsageInsight | undefined): string {
  if (!insight?.patternId) return ''
  return insight.patternId.replace(/_/g, ' ')
}

/**
 * Build a 2D matrix (header + rows) for the Users analysis Excel export.
 * Pure / sync so unit tests do not need to load SheetJS.
 */
export function buildUserAnalyticsExportRows(
  users: UserUsageRecord[],
  options: UserAnalyticsExportOptions = {}
): (string | number)[][] {
  const labels: UserAnalyticsExportLabels = {
    ...DEFAULT_USER_ANALYTICS_EXPORT_LABELS,
    ...options.labels,
  }
  const includeAiCredits = options.includeAiCredits !== false
  const getInsight = options.getInsight

  const headers: string[] = [
    labels.login,
    labels.name,
    labels.email,
    labels.usagePattern,
    labels.engagementScore,
    labels.acceptanceRate,
  ]
  if (includeAiCredits) {
    headers.push(labels.aiCreditsUsed, labels.aiCreditsNetUsd)
  }
  headers.push(
    labels.interactions,
    labels.generations,
    labels.acceptances,
    labels.locAdded,
    labels.usedAgent,
    labels.usedChat,
    labels.usedCodingAgent,
    labels.lastIdeVersion,
    labels.lastPluginVersion,
    labels.adoptionPhase
  )

  const rows: (string | number)[][] = [headers]

  for (const user of users) {
    const insight = getInsight?.(user.user_login)
    const acceptanceRate =
      insight?.rates.acceptanceRate != null
        ? Math.round(insight.rates.acceptanceRate * 10) / 10
        : ''

    const row: (string | number)[] = [
      user.user_login || '',
      user.name || '',
      user.email || '',
      patternLabel(insight),
      insight?.engagementScore ?? '',
      acceptanceRate,
    ]

    if (includeAiCredits) {
      const credits = user.ai_credits
      const used =
        credits?.source === 'billing' || credits?.source === 'metrics'
          ? (credits.used ?? '')
          : (user.ai_credits_used ?? '')
      const net =
        credits?.source === 'billing' && credits.netAmount != null
          ? credits.netAmount
          : ''
      row.push(used === '' ? '' : used, net === '' ? '' : net)
    }

    row.push(
      user.user_initiated_interaction_count ?? 0,
      user.code_generation_activity_count ?? 0,
      user.code_acceptance_activity_count ?? 0,
      user.loc_added_sum ?? 0,
      boolLabel(user.used_agent, labels),
      boolLabel(user.used_chat, labels),
      boolLabel(user.used_copilot_coding_agent, labels),
      user.last_known_ide_version || '',
      user.last_known_plugin_version || '',
      user.ai_adoption_phase?.phase ?? ''
    )

    rows.push(row)
  }

  return rows
}

/** Filter users by the same free-text search used in the Users table. */
export function filterUsersForAnalyticsExport(
  users: UserUsageRecord[],
  search: string | null | undefined,
  getInsight?: (login: string) => UserUsageInsight | undefined
): UserUsageRecord[] {
  const q = (search || '').trim().toLowerCase()
  if (!q) return users

  return users.filter((user) => {
    const insight = getInsight?.(user.user_login)
    const haystack = [
      user.user_login,
      user.name,
      user.email,
      patternLabel(insight),
      user.ai_adoption_phase?.phase,
      user.last_known_ide_version,
      user.last_known_plugin_version,
    ]
      .filter((v) => v !== undefined && v !== null && v !== '')
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export function buildUserAnalyticsFilename(reportRange?: string | null): string {
  const stamp = new Date().toISOString().slice(0, 10)
  const rangePart = (reportRange || '')
    .replace(/[→\-–—]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return rangePart
    ? `user-analytics-${rangePart}-${stamp}.xlsx`
    : `user-analytics-${stamp}.xlsx`
}

/** Build an .xlsx workbook for Users analysis (loads SheetJS on demand). */
export async function buildUserAnalyticsWorkbook(
  users: UserUsageRecord[],
  options: UserAnalyticsExportOptions = {}
): Promise<ArrayBuffer> {
  const XLSX = await import('xlsx')
  const sheetName = (options.sheetName || 'Users').slice(0, 31)
  const matrix = buildUserAnalyticsExportRows(users, options)
  const ws = XLSX.utils.aoa_to_sheet(matrix)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  if (options.reportRange) {
    const meta = XLSX.utils.aoa_to_sheet([
      ['Report range', options.reportRange],
      ['Exported at (UTC)', new Date().toISOString()],
      ['User count', users.length],
    ])
    XLSX.utils.book_append_sheet(wb, meta, 'Export info')
  }

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

/** Trigger a browser download for the Users analysis workbook. */
export async function downloadUserAnalyticsExcel(
  users: UserUsageRecord[],
  options: UserAnalyticsExportOptions = {}
): Promise<void> {
  const buf = await buildUserAnalyticsWorkbook(users, options)
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = buildUserAnalyticsFilename(options.reportRange)
  a.click()
  URL.revokeObjectURL(url)
}
