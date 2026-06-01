import type { H3Event, EventHandlerRequest } from 'h3'
import { Options } from '@/model/Options'
import type { UserTeamRecord, UserUsageRecord } from '../../shared/types/copilot-usage'
import { fetchOrganizationBilling } from '../../shared/utils/billing-api'
import { enrichWithOrgDirectory, fetchOrgMemberDirectory } from '../../shared/utils/org-member-directory'
import {
  buildUsageInsightsResponse,
  consolidateUserRecords,
  mapFullUserRecord
} from '../../shared/utils/usage-insights-aggregate'
import { resolvePremiumCreditsFromBillingApi } from '../../shared/utils/fetch-premium-credits-batch'
import { isPremiumCreditsFetchEnabled } from '../../shared/utils/premium-credits-feature'
import { downloadReportFromMeta, fetchReportMeta } from '../../shared/utils/usage-metrics-download'
import {
  buildUserTeamsReportUrl,
  buildUsers28DayReportUrl,
  fetch28DayAdoptionPhases,
  fetchNdjsonReport
} from '../../shared/utils/usage-metrics-report'
import { buildAdoptionPhaseView } from '../../shared/utils/ai-adoption-phase'
import { shouldUseMockData } from '../../shared/utils/mock-mode'
import { loadMockUsers28DayPayload } from '../../shared/utils/mock-users-28-day'

export default defineEventHandler(async (event: H3Event<EventHandlerRequest>) => {
  const logger = console
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const options = Options.fromQuery(query, config.public)
  if (shouldUseMockData(config.public, query)) {
    options.isDataMocked = true
  }
  const premiumCreditsQuota = Number(config.public.enterprisePremiumQuota) || 1000
  if (options.scope?.includes('team')) {
    return new Response('Team scope is not supported for usage insights.', { status: 422 })
  }

  if (options.scope === 'organization' && !options.githubOrg) {
    return new Response('GitHub organization is not configured.', { status: 422 })
  }

  if (options.scope === 'enterprise' && !options.githubEnt) {
    return new Response('GitHub enterprise is not configured.', { status: 422 })
  }

  if (!options.isDataMocked && !event.context.headers?.has('Authorization')) {
    return new Response('No Authentication provided', { status: 401 })
  }

  const since = options.since || ''
  const until = options.until || ''

  try {
    if (options.isDataMocked) {
      logger.info('Using mocked data for usage insights')
      const mockPayload = loadMockUsers28DayPayload(options)
      const rawUsers = mockPayload.day_totals.map((line) => mapFullUserRecord(line))
      const users = consolidateUserRecords(rawUsers)

      const billing = {
        available: false as const,
        reason: 'Billing usage is not included in mock mode.',
        detailedUsage: [],
        summaryUsage: [],
        premiumRequestUsage: []
      }

      return buildUsageInsightsResponse({
        users,
        userTeams: [],
        billing,
        since: since || undefined,
        until: until || undefined,
        reportStartDay: mockPayload.report_start_day,
        reportEndDay: mockPayload.report_end_day,
        premiumCreditsQuota,
        adoptionByPhase: buildAdoptionPhaseView([], users)
      })
    }

    const metaUrl = buildUsers28DayReportUrl(options)
    const meta = await fetchReportMeta(metaUrl, event.context.headers)

    let users: UserUsageRecord[] = []
    if (meta?.download_links?.length) {
      const lines = await downloadReportFromMeta(meta, logger)
      const rawUsers = lines.map((line) => mapFullUserRecord(line as Record<string, unknown>))
      users = consolidateUserRecords(rawUsers)

      if (options.githubOrg) {
        const directory = await fetchOrgMemberDirectory(
          options.githubOrg,
          event.context.headers,
          logger
        )
        users = enrichWithOrgDirectory(users, directory)
      }
    }

    const teamDay = meta?.report_end_day || until || new Date().toISOString().split('T')[0]
    let userTeams: UserTeamRecord[] = []
    try {
      const teamRows = await fetchNdjsonReport(
        buildUserTeamsReportUrl(options, teamDay),
        event.context.headers,
        logger
      )
      userTeams = teamRows as UserTeamRecord[]
    } catch (teamError) {
      logger.warn('User-teams report unavailable for', teamDay, teamError)
    }

    let billing = {
      available: false as const,
      reason: 'Date range required for billing usage.',
      detailedUsage: [],
      summaryUsage: [],
      premiumRequestUsage: []
    }

    if (since && until && options.githubOrg) {
      billing = await fetchOrganizationBilling(
        options.githubOrg,
        event.context.headers,
        since,
        until,
        logger,
        { enterprise: options.githubEnt || config.public.githubEnt }
      )
    }

    let premiumCredits
    if (
      since &&
      until &&
      options.githubOrg &&
      billing.available &&
      isPremiumCreditsFetchEnabled(config.public)
    ) {
      premiumCredits = await resolvePremiumCreditsFromBillingApi({
        logins: users.map((u) => u.user_login),
        org: options.githubOrg,
        enterprise: options.githubEnt || config.public.githubEnt,
        since,
        until,
        headers: event.context.headers,
        defaultQuota: premiumCreditsQuota,
        logger
      })
    }

    let adoptionByPhase = []
    try {
      const orgTotals = await fetch28DayAdoptionPhases(options, event.context.headers, logger)
      adoptionByPhase = buildAdoptionPhaseView(orgTotals, users)
    } catch (adoptionError) {
      logger.warn('Adoption phase rollup unavailable:', adoptionError)
      adoptionByPhase = buildAdoptionPhaseView([], users)
    }

    return buildUsageInsightsResponse({
      users,
      userTeams,
      billing,
      since: since || undefined,
      until: until || undefined,
      reportStartDay: meta?.report_start_day,
      reportEndDay: meta?.report_end_day,
      premiumCreditsQuota,
      premiumCredits,
      adoptionByPhase
    })
  } catch (error: unknown) {
    logger.error('Error fetching usage insights:', error)
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? (error as { statusCode: number }).statusCode
        : 500
    const message = error instanceof Error ? error.message : String(error)
    return new Response('Error fetching usage insights: ' + message, { status: statusCode })
  }
})
