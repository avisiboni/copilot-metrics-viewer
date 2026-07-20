import type { BillingFetchResult } from '../types/billing-usage'
import type {
  FeatureAdoptionAggregate,
  ModelPremiumAggregate,
  ModelUsageAggregate,
  SkuCostAggregate,
  TeamUsageAggregate,
  UsageInsightsResponse,
  UsageInsightsSummary,
  UserUsageLeaderboardRow
} from '../types/usage-insights'
import type {
  AiAdoptionPhase,
  AiAdoptionPhaseAggregate,
  UsageFeatureTotal,
  UsageModelFeatureTotal,
  UserTeamRecord,
  UserUsageRecord
} from '../types/copilot-usage'
import { usageNumber } from '../types/copilot-usage'
import { buildAdoptionPhaseView, parseAiAdoptionPhase } from './ai-adoption-phase'
import {
  canonicalBillingSkuKey,
  displayBillingSkuLabel,
  isPremiumRequestSku
} from './billing-normalize'
import { enrichRowsWithPremiumCredits } from './premium-credits'
import { enrichRowsWithAiCredits, parseMetricsAiCredits } from './ai-credits'
import type { PremiumCreditsResolveResult } from './fetch-premium-credits-batch'
import type { AiCreditsResolveResult } from './fetch-ai-credits-batch'

const NUMERIC_USER_KEYS = [
  'user_initiated_interaction_count',
  'code_generation_activity_count',
  'code_acceptance_activity_count',
  'loc_suggested_to_add_sum',
  'loc_suggested_to_delete_sum',
  'loc_added_sum',
  'loc_deleted_sum'
] as const

function mergeFeatureTotals(
  target: UsageFeatureTotal[],
  source: UsageFeatureTotal[] | undefined
): UsageFeatureTotal[] {
  const map = new Map<string, UsageFeatureTotal>()
  for (const row of target) {
    map.set(String(row.feature), { ...row })
  }
  for (const row of source || []) {
    const key = String(row.feature)
    const existing = map.get(key) || { feature: key }
    for (const field of NUMERIC_USER_KEYS) {
      if (field in row || field in existing) {
        (existing as Record<string, number>)[field] =
          usageNumber((existing as Record<string, unknown>)[field]) +
          usageNumber((row as Record<string, unknown>)[field])
      }
    }
    map.set(key, existing)
  }
  return Array.from(map.values())
}

function mergeModelTotals(
  target: UsageModelFeatureTotal[],
  source: UsageModelFeatureTotal[] | undefined
): UsageModelFeatureTotal[] {
  const map = new Map<string, UsageModelFeatureTotal>()
  for (const row of target) {
    map.set(`${row.model}::${row.feature}`, { ...row })
  }
  for (const row of source || []) {
    const key = `${row.model}::${row.feature}`
    const existing = map.get(key) || { model: row.model, feature: row.feature }
    for (const field of NUMERIC_USER_KEYS) {
      if (field in row || field in existing) {
        (existing as Record<string, number>)[field] =
          usageNumber((existing as Record<string, unknown>)[field]) +
          usageNumber((row as Record<string, unknown>)[field])
      }
    }
    map.set(key, existing)
  }
  return Array.from(map.values())
}

/** users-28-day NDJSON may contain one row per user per day; merge into one row per user. */
export function consolidateUserRecords(rows: UserUsageRecord[]): UserUsageRecord[] {
  const byUser = new Map<string, UserUsageRecord>()

  for (const row of rows) {
    const key = String(row.user_login || row.user_id).toLowerCase()
    const existing = byUser.get(key)

    if (!existing) {
      byUser.set(key, {
        ...row,
        totals_by_feature: [...(row.totals_by_feature || [])],
        totals_by_model_feature: [...(row.totals_by_model_feature || [])],
        totals_by_language_model: [...(row.totals_by_language_model || [])],
        ai_adoption_phase: row.ai_adoption_phase
      })
      continue
    }

    if (row.day && (!existing.day || row.day > existing.day)) {
      existing.day = row.day
      if (row.ai_adoption_phase) {
        existing.ai_adoption_phase = row.ai_adoption_phase
      }
    }

    for (const field of NUMERIC_USER_KEYS) {
      existing[field] = usageNumber(existing[field]) + usageNumber(row[field])
    }

    existing.used_agent = Boolean(existing.used_agent || row.used_agent)
    existing.used_chat = Boolean(existing.used_chat || row.used_chat)
    existing.used_cli = Boolean(existing.used_cli || row.used_cli)
    existing.used_copilot_code_review_active = Boolean(
      existing.used_copilot_code_review_active || row.used_copilot_code_review_active
    )
    existing.used_copilot_code_review_passive = Boolean(
      existing.used_copilot_code_review_passive || row.used_copilot_code_review_passive
    )
    existing.used_copilot_coding_agent = Boolean(
      existing.used_copilot_coding_agent || row.used_copilot_coding_agent
    )

    if (row.ai_credits_used != null || existing.ai_credits_used != null) {
      existing.ai_credits_used =
        usageNumber(existing.ai_credits_used) + usageNumber(row.ai_credits_used)
      existing.ai_credits = parseMetricsAiCredits(existing.ai_credits_used)
    }

    existing.totals_by_feature = mergeFeatureTotals(
      existing.totals_by_feature || [],
      row.totals_by_feature
    )
    existing.totals_by_model_feature = mergeModelTotals(
      existing.totals_by_model_feature || [],
      row.totals_by_model_feature
    )
    existing.totals_by_language_model = mergeModelTotals(
      existing.totals_by_language_model || [],
      row.totals_by_language_model
    )
  }

  return Array.from(byUser.values())
}

function featureLabel(feature: string): string {
  return feature
    .replace('chat_panel_', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function mapFullUserRecord(record: Record<string, unknown>): UserUsageRecord {
  const ai_credits_used = usageNumber(record.ai_credits_used)
  return {
    day: typeof record.day === 'string' ? record.day : undefined,
    user_login: String(record.user_login || ''),
    user_id: typeof record.user_id === 'number' ? record.user_id : Number(record.user_id) || 0,
    user_initiated_interaction_count: usageNumber(record.user_initiated_interaction_count),
    code_generation_activity_count: usageNumber(record.code_generation_activity_count),
    code_acceptance_activity_count: usageNumber(record.code_acceptance_activity_count),
    loc_suggested_to_add_sum: usageNumber(record.loc_suggested_to_add_sum),
    loc_added_sum: usageNumber(record.loc_added_sum),
    loc_deleted_sum: usageNumber(record.loc_deleted_sum),
    used_agent: Boolean(record.used_agent),
    used_chat: Boolean(record.used_chat),
    used_cli: Boolean(record.used_cli),
    used_copilot_code_review_active: Boolean(record.used_copilot_code_review_active),
    used_copilot_code_review_passive: Boolean(record.used_copilot_code_review_passive),
    used_copilot_coding_agent: Boolean(record.used_copilot_coding_agent),
    ai_credits_used: ai_credits_used > 0 ? ai_credits_used : undefined,
    ai_credits: parseMetricsAiCredits(record.ai_credits_used),
    totals_by_feature: Array.isArray(record.totals_by_feature)
      ? record.totals_by_feature as UserUsageRecord['totals_by_feature']
      : undefined,
    totals_by_ide: Array.isArray(record.totals_by_ide)
      ? record.totals_by_ide as UserUsageRecord['totals_by_ide']
      : undefined,
    totals_by_model_feature: Array.isArray(record.totals_by_model_feature)
      ? record.totals_by_model_feature as UserUsageRecord['totals_by_model_feature']
      : undefined,
    totals_by_language_model: Array.isArray(record.totals_by_language_model)
      ? record.totals_by_language_model as UserUsageRecord['totals_by_language_model']
      : undefined,
    ai_adoption_phase: parseAiAdoptionPhase(record.ai_adoption_phase)
  }
}

export function buildUserLeaderboard(users: UserUsageRecord[]): UserUsageLeaderboardRow[] {
  return users
    .map((user) => {
      const models = user.totals_by_model_feature || []
      const top = [...models].sort(
        (a, b) => usageNumber(b.user_initiated_interaction_count) - usageNumber(a.user_initiated_interaction_count)
      )[0]

      return {
        user_login: user.user_login,
        user_id: user.user_id,
        name: user.name ?? null,
        email: user.email ?? null,
        interactions: usageNumber(user.user_initiated_interaction_count),
        generations: usageNumber(user.code_generation_activity_count),
        acceptances: usageNumber(user.code_acceptance_activity_count),
        locAdded: usageNumber(user.loc_added_sum),
        modelCount: new Set(models.map((m) => String(m.model || 'unknown'))).size,
        topModel: top?.model ? String(top.model) : undefined,
        used_agent: Boolean(user.used_agent),
        used_chat: Boolean(user.used_chat),
        used_cli: Boolean(user.used_cli),
        used_code_review: Boolean(user.used_copilot_code_review_active || user.used_copilot_code_review_passive),
        used_coding_agent: Boolean(user.used_copilot_coding_agent),
        ai_adoption_phase: user.ai_adoption_phase,
        ai_credits: user.ai_credits,
        totals_by_model_feature: user.totals_by_model_feature,
        totals_by_feature: user.totals_by_feature
      }
    })
    .sort((a, b) => b.interactions - a.interactions)
}

export function aggregateModelUsage(users: UserUsageRecord[]): ModelUsageAggregate[] {
  const map = new Map<string, ModelUsageAggregate>()

  for (const user of users) {
    for (const row of user.totals_by_model_feature || []) {
      const model = String(row.model || 'unknown')
      const feature = String(row.feature || 'unknown')
      const key = `${model}::${feature}`
      const existing = map.get(key) || {
        model,
        feature: featureLabel(feature),
        interactions: 0,
        generations: 0,
        acceptances: 0,
        locSuggested: 0,
        locAdded: 0,
        userCount: 0
      }

      existing.interactions += usageNumber(row.user_initiated_interaction_count)
      existing.generations += usageNumber(row.code_generation_activity_count)
      existing.acceptances += usageNumber(row.code_acceptance_activity_count)
      existing.locSuggested += usageNumber(row.loc_suggested_to_add_sum)
      existing.locAdded += usageNumber(row.loc_added_sum)
      existing.userCount += 1
      map.set(key, existing)
    }
  }

  return Array.from(map.values()).sort((a, b) => b.interactions - a.interactions)
}

export function aggregateFeatureAdoption(users: UserUsageRecord[]): FeatureAdoptionAggregate[] {
  const map = new Map<string, FeatureAdoptionAggregate>()

  for (const user of users) {
    for (const row of user.totals_by_feature || []) {
      const feature = featureLabel(String(row.feature || 'unknown'))
      const existing = map.get(feature) || { feature, interactions: 0, users: 0 }
      existing.interactions += usageNumber(row.user_initiated_interaction_count)
      existing.users += 1
      map.set(feature, existing)
    }
  }

  return Array.from(map.values()).sort((a, b) => b.interactions - a.interactions)
}

export function aggregateTeamUsage(
  users: UserUsageRecord[],
  userTeams: UserTeamRecord[]
): TeamUsageAggregate[] {
  const userByLogin = new Map(users.map((u) => [u.user_login.toLowerCase(), u]))
  const map = new Map<string, TeamUsageAggregate>()

  for (const membership of userTeams) {
    const login = String(membership.user_login || '').toLowerCase()
    const user = userByLogin.get(login)
    const slug = String(membership.slug || 'unknown')
    const existing = map.get(slug) || {
      teamSlug: slug,
      userCount: 0,
      interactions: 0,
      acceptances: 0
    }

    existing.userCount += 1
    if (user) {
      existing.interactions += usageNumber(user.user_initiated_interaction_count)
      existing.acceptances += usageNumber(user.code_acceptance_activity_count)
    }
    map.set(slug, existing)
  }

  return Array.from(map.values()).sort((a, b) => b.interactions - a.interactions)
}

function isDuplicateSkuAliasLine(
  existing: SkuCostAggregate,
  netAmount: number,
  grossAmount: number,
  quantity: number
): boolean {
  if (existing.netAmount === 0 && existing.grossAmount === 0 && existing.quantity === 0) {
    return false
  }
  return (
    Math.abs(existing.netAmount - netAmount) < 0.005 &&
    Math.abs(existing.grossAmount - grossAmount) < 0.005 &&
    Math.abs(existing.quantity - quantity) < 0.0001
  )
}

export function aggregateSkuCosts(billing: BillingFetchResult): SkuCostAggregate[] {
  const map = new Map<string, SkuCostAggregate>()

  // Summary is an org-level rollup of the same charges as `/usage` line items — do not sum both.
  const items =
    billing.summaryUsage.length > 0 ? billing.summaryUsage : billing.detailedUsage

  for (const item of items) {
    const rawSku = String(item.sku || 'unknown')
    const key = canonicalBillingSkuKey(rawSku)
    const netAmount = usageNumber(item.netAmount)
    const grossAmount = usageNumber(item.grossAmount)
    const quantity = usageNumber(item.quantity ?? item.grossQuantity)

    const existing = map.get(key)
    if (existing && isDuplicateSkuAliasLine(existing, netAmount, grossAmount, quantity)) {
      continue
    }

    const row = existing || {
      sku: displayBillingSkuLabel(key),
      netAmount: 0,
      grossAmount: 0,
      quantity: 0
    }
    row.sku = displayBillingSkuLabel(key)
    row.netAmount += netAmount
    row.grossAmount += grossAmount
    row.quantity += quantity
    map.set(key, row)
  }

  return Array.from(map.values()).sort((a, b) => b.netAmount - a.netAmount)
}

export function aggregatePremiumByModel(billing: BillingFetchResult): ModelPremiumAggregate[] {
  const map = new Map<string, ModelPremiumAggregate>()

  for (const item of billing.premiumRequestUsage) {
    const model = String(item.model || 'unknown')
    const existing = map.get(model) || {
      model,
      netQuantity: 0,
      netAmount: 0,
      grossAmount: 0,
      userCount: 0
    }
    existing.netQuantity += usageNumber(item.netQuantity ?? item.grossQuantity)
    existing.netAmount += usageNumber(item.netAmount)
    existing.grossAmount += usageNumber(item.grossAmount)
    existing.userCount += 1
    map.set(model, existing)
  }

  return Array.from(map.values()).sort((a, b) => b.netQuantity - a.netQuantity)
}

export function buildSummary(users: UserUsageRecord[]): UsageInsightsSummary {
  const models = new Set<string>()
  for (const user of users) {
    for (const m of user.totals_by_model_feature || []) {
      if (m.model) models.add(String(m.model))
    }
  }

  const totalLocAdded = users.reduce((s, u) => s + usageNumber(u.loc_added_sum), 0)
  const totalLocDeleted = users.reduce((s, u) => s + usageNumber(u.loc_deleted_sum), 0)

  return {
    userCount: users.length,
    totalInteractions: users.reduce((s, u) => s + usageNumber(u.user_initiated_interaction_count), 0),
    totalGenerations: users.reduce((s, u) => s + usageNumber(u.code_generation_activity_count), 0),
    totalAcceptances: users.reduce((s, u) => s + usageNumber(u.code_acceptance_activity_count), 0),
    totalLocAdded,
    totalLocDeleted,
    totalLocChanged: totalLocAdded + totalLocDeleted,
    uniqueModels: models.size,
    agentUsers: users.filter((u) => u.used_agent).length,
    chatUsers: users.filter((u) => u.used_chat).length,
    cliUsers: users.filter((u) => u.used_cli).length,
    codingAgentUsers: users.filter((u) => u.used_copilot_coding_agent).length,
    totalAiCreditsUsed: users.some((u) => (u.ai_credits_used ?? 0) > 0)
      ? users.reduce((s, u) => s + usageNumber(u.ai_credits_used), 0)
      : undefined
  }
}

export function buildUsageInsightsResponse(params: {
  users: UserUsageRecord[]
  userTeams: UserTeamRecord[]
  billing: BillingFetchResult
  since?: string
  until?: string
  reportStartDay?: string
  reportEndDay?: string
  premiumCreditsQuota?: number
  premiumCredits?: PremiumCreditsResolveResult
  aiCredits?: AiCreditsResolveResult
  adoptionByPhase?: AiAdoptionPhaseAggregate[]
}): UsageInsightsResponse {
  const users = params.users
  const billing = params.billing
  const premiumCreditsQuota = params.premiumCreditsQuota ?? 1000
  const perUserDataAvailable = params.premiumCredits?.perUserDataAvailable ?? false
  const perUserAiDataAvailable = params.aiCredits?.perUserDataAvailable ?? false

  const premiumByUser = aggregatePremiumByUser(billing)
  const withPremium = enrichRowsWithPremiumCredits(
    buildUserLeaderboard(users),
    billing,
    premiumCreditsQuota,
    premiumByUser,
    {
      billingLoaded: billing.available,
      perUserUnavailable: billing.available && !perUserDataAvailable,
      creditsMap: params.premiumCredits?.creditsMap
    }
  )
  const leaderboard = enrichRowsWithAiCredits(withPremium, billing, {
    billingLoaded: billing.available,
    perUserUnavailable: billing.available && !perUserAiDataAvailable,
    creditsMap: params.aiCredits?.creditsMap
  })

  return {
    reportStartDay: params.reportStartDay,
    reportEndDay: params.reportEndDay,
    since: params.since,
    until: params.until,
    summary: buildSummary(users),
    users: leaderboard,
    modelUsage: aggregateModelUsage(users),
    featureAdoption: aggregateFeatureAdoption(users),
    teamUsage: aggregateTeamUsage(users, params.userTeams),
    billing,
    skuCosts: aggregateSkuCosts(billing),
    premiumByModel: aggregatePremiumByModel(billing),
    premiumByUser,
    userTeams: params.userTeams,
    premiumCreditsQuota,
    adoptionByPhase: params.adoptionByPhase ?? []
  }
}

function aggregatePremiumByUser(
  billing: BillingFetchResult
): Array<{ user_login: string; netQuantity: number; netAmount: number; topModel?: string }> {
  const map = new Map<string, { user_login: string; netQuantity: number; netAmount: number; models: Map<string, number> }>()

  const addRow = (login: string, model: string | undefined, quantity: number, amount: number) => {
    const existing = map.get(login) || {
      user_login: login,
      netQuantity: 0,
      netAmount: 0,
      models: new Map<string, number>()
    }
    existing.netQuantity += quantity
    existing.netAmount += amount
    if (model) {
      existing.models.set(model, (existing.models.get(model) || 0) + quantity)
    }
    map.set(login, existing)
  }

  for (const item of billing.detailedUsage) {
    if (!isPremiumRequestSku(item.sku) || !item.username) continue
    addRow(
      String(item.username),
      item.model ? String(item.model) : undefined,
      usageNumber(item.quantity),
      usageNumber(item.netAmount)
    )
  }

  for (const item of billing.premiumRequestUsage) {
    if (!item.username) continue
    addRow(
      String(item.username),
      String(item.model || 'unknown'),
      usageNumber(item.netQuantity ?? item.grossQuantity),
      usageNumber(item.netAmount)
    )
  }

  return Array.from(map.values())
    .map((row) => {
      let topModel: string | undefined
      let topQty = 0
      for (const [model, qty] of row.models) {
        if (qty > topQty) {
          topQty = qty
          topModel = model
        }
      }
      return {
        user_login: row.user_login,
        netQuantity: row.netQuantity,
        netAmount: row.netAmount,
        topModel
      }
    })
    .sort((a, b) => b.netQuantity - a.netQuantity)
}

function leaderRowToUserRecord(row: UserUsageLeaderboardRow): UserUsageRecord {
  return {
    user_login: row.user_login,
    user_id: row.user_id,
    name: row.name ?? null,
    email: row.email ?? null,
    user_initiated_interaction_count: row.interactions,
    code_generation_activity_count: row.generations,
    code_acceptance_activity_count: row.acceptances,
    loc_added_sum: row.locAdded,
    used_agent: row.used_agent,
    used_chat: row.used_chat,
    used_cli: row.used_cli,
    used_copilot_code_review_active: row.used_code_review,
    used_copilot_code_review_passive: false,
    used_copilot_coding_agent: row.used_coding_agent,
    ai_adoption_phase: row.ai_adoption_phase,
    ai_credits: row.ai_credits,
    totals_by_model_feature: row.totals_by_model_feature,
    totals_by_feature: row.totals_by_feature
  }
}

/** Client-side filter: recomputes KPIs and charts for one user. */
export function filterUsageInsightsByUser(
  data: UsageInsightsResponse,
  userLogin: string | null | undefined
): UsageInsightsResponse {
  const trimmed = userLogin?.trim()
  if (!trimmed) {
    return data
  }

  const login = trimmed.toLowerCase()
  const usersRaw = data.users.filter((u) => u.user_login.toLowerCase() === login)
  const userRecords = usersRaw.map(leaderRowToUserRecord)

  const teamSlugs = new Set(
    data.userTeams
      .filter((t) => String(t.user_login || '').toLowerCase() === login)
      .map((t) => t.slug)
  )

  const filteredBilling: BillingFetchResult = {
    ...data.billing,
    summaryUsage: [],
    detailedUsage: data.billing.detailedUsage.filter(
      (item) => !item.username || String(item.username).toLowerCase() === login
    ),
    premiumRequestUsage: data.billing.premiumRequestUsage.filter(
      (item) => !item.username || String(item.username).toLowerCase() === login
    )
  }

  const premiumByUser = data.premiumByUser.filter(
    (u) => u.user_login.toLowerCase() === login
  )

  const withPremium = enrichRowsWithPremiumCredits(
    usersRaw,
    filteredBilling,
    data.premiumCreditsQuota ?? 1000,
    premiumByUser
  )
  const users = enrichRowsWithAiCredits(withPremium, filteredBilling)

  return {
    ...data,
    users,
    summary: buildSummary(userRecords),
    modelUsage: aggregateModelUsage(userRecords),
    featureAdoption: aggregateFeatureAdoption(userRecords),
    teamUsage: data.teamUsage.filter((t) => teamSlugs.has(t.teamSlug)),
    premiumByUser,
    skuCosts: aggregateSkuCosts(filteredBilling),
    premiumByModel: aggregatePremiumByModel(filteredBilling),
    billing: filteredBilling,
    adoptionByPhase: buildAdoptionPhaseView(
      [],
      userRecords.map((row) => ({ ai_adoption_phase: row.ai_adoption_phase }))
    )
  }
}
