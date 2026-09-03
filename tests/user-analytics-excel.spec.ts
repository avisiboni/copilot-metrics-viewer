import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import type { UserUsageRecord } from '../shared/types/copilot-usage'
import type { UserUsageInsight } from '../shared/types/usage-pattern'
import {
  buildUserAnalyticsExportRows,
  buildUserAnalyticsFilename,
  buildUserAnalyticsWorkbook,
  filterUsersForAnalyticsExport,
} from '../shared/utils/user-analytics-excel'

function sampleUsers(): UserUsageRecord[] {
  return [
    {
      user_id: 1,
      user_login: 'alice',
      name: 'Alice A',
      email: 'alice@example.com',
      user_initiated_interaction_count: 10,
      code_generation_activity_count: 8,
      code_acceptance_activity_count: 4,
      loc_added_sum: 120,
      used_agent: true,
      used_chat: true,
      used_copilot_coding_agent: false,
      ai_credits: { used: 12.5, netAmount: 3.4, source: 'billing' },
      ai_adoption_phase: {
        phase: 2,
        version: 'v1',
      },
      last_known_ide_version: '1.2.3',
      last_known_plugin_version: '0.9.0',
    },
    {
      user_id: 2,
      user_login: 'bob',
      name: 'Bob B',
      email: null,
      user_initiated_interaction_count: 2,
      code_generation_activity_count: 1,
      code_acceptance_activity_count: 0,
      loc_added_sum: 5,
      used_agent: false,
      used_chat: false,
      used_copilot_coding_agent: true,
    },
  ]
}

function insightFor(login: string): UserUsageInsight | undefined {
  if (login !== 'alice') return undefined
  return {
    patternId: 'completion_first',
    confidence: 'high',
    engagementScore: 88,
    rates: {
      acceptanceRate: 50,
      generationsPerInteraction: 0.8,
      locPerAcceptance: 30,
      locPerInteraction: 12,
      locPerGeneration: 15,
    },
    percentiles: {
      interactions: 70,
      generations: 80,
      acceptances: 60,
      locAdded: 75,
      acceptanceRate: 70,
      generationsPerInteraction: 80,
      locPerAcceptance: 60,
      locPerInteraction: 55,
      locPerGeneration: 50,
    },
    orgMedians: {
      interactions: 5,
      generations: 4,
      acceptances: 2,
      locAdded: 40,
      acceptanceRate: 40,
      generationsPerInteraction: 0.5,
      locPerAcceptance: 20,
      locPerInteraction: 8,
      locPerGeneration: 10,
    },
    orgUserCount: 2,
    recommendation: {
      effectiveness: 'productive',
      priority: 'medium',
      headlineId: 'keep_going',
      actionIds: [],
    },
  }
}

describe('user-analytics-excel', () => {
  it('builds header + user rows with pattern and AI credit columns', () => {
    const rows = buildUserAnalyticsExportRows(sampleUsers(), {
      includeAiCredits: true,
      getInsight: insightFor,
    })

    expect(rows[0]).toContain('Login')
    expect(rows[0]).toContain('AI credits used')
    expect(rows[0]).toContain('Usage pattern')

    const alice = rows[1]
    expect(alice[0]).toBe('alice')
    expect(alice[3]).toBe('completion first')
    expect(alice[4]).toBe(88)
    expect(alice[5]).toBe(50)
    expect(alice[6]).toBe(12.5)
    expect(alice[7]).toBe(3.4)
  })

  it('omits AI credit columns when disabled', () => {
    const rows = buildUserAnalyticsExportRows(sampleUsers(), {
      includeAiCredits: false,
    })
    expect(rows[0]).not.toContain('AI credits used')
    expect(rows[1][0]).toBe('alice')
    expect(rows[1][6]).toBe(10) // interactions shifts left
  })

  it('filters users by free-text search across login/name/pattern', () => {
    const users = sampleUsers()
    expect(filterUsersForAnalyticsExport(users, 'bob')).toHaveLength(1)
    expect(filterUsersForAnalyticsExport(users, 'completion', insightFor)).toHaveLength(1)
    expect(filterUsersForAnalyticsExport(users, '')).toHaveLength(2)
  })

  it('builds a readable filename from the report range', () => {
    expect(buildUserAnalyticsFilename('2026-06-01 → 2026-06-28')).toMatch(
      /^user-analytics-2026-06-01-2026-06-28-\d{4}-\d{2}-\d{2}\.xlsx$/
    )
    expect(buildUserAnalyticsFilename(null)).toMatch(/^user-analytics-\d{4}-\d{2}-\d{2}\.xlsx$/)
  })

  it('writes a valid xlsx workbook', async () => {
    const buf = await buildUserAnalyticsWorkbook(sampleUsers(), {
      reportRange: '2026-06-01 → 2026-06-28',
      getInsight: insightFor,
    })
    const wb = XLSX.read(buf, { type: 'array' })
    expect(wb.SheetNames).toContain('Users')
    expect(wb.SheetNames).toContain('Export info')
    const sheet = wb.Sheets.Users
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]
    expect(matrix.length).toBe(3)
    expect(matrix[1][0]).toBe('alice')
  })
})
