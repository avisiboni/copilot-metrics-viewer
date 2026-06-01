import type { H3Event, EventHandlerRequest } from 'h3';
import { Options } from '@/model/Options';
import type { UserUsageRecord } from '../../shared/types/copilot-usage';
import { downloadReportFromMeta } from '../../shared/utils/usage-metrics-download';
import { fetchReportMeta } from '../../shared/utils/usage-metrics-download';
import {
  buildUsers28DayReportUrl,
  buildUsersOneDayReportUrl,
  fetch28DayAdoptionPhases,
  fetchNdjsonReport
} from '../../shared/utils/usage-metrics-report';
import { consolidateUserRecords } from '../../shared/utils/usage-insights-aggregate';
import { enrichWithOrgDirectory, fetchOrgMemberDirectory } from '../../shared/utils/org-member-directory';
import { fetchOrganizationBilling } from '../../shared/utils/billing-api';
import { currentUtcMonthRange } from '../../shared/utils/premium-credits';
import { isPremiumCreditsFetchEnabled } from '../../shared/utils/premium-credits-feature';
import { buildAdoptionPhaseView } from '../../shared/utils/ai-adoption-phase';
import type { AiAdoptionPhaseAggregate } from '../../shared/types/copilot-usage';
import { parseAiAdoptionPhase } from '../../shared/utils/ai-adoption-phase';

interface UserMetricsApiResponse {
  reportStartDay?: string;
  reportEndDay?: string;
  reportDay?: string;
  users: UserUsageRecord[];
  adoptionByPhase?: AiAdoptionPhaseAggregate[];
  premiumCredits?: {
    available: boolean;
    periodLabel?: string;
    since?: string;
    until?: string;
    defaultQuota: number;
    reason?: string;
    usersWithBillingData: number;
    perUserDataAvailable?: boolean;
    httpStatus?: number;
    tokenScopes?: string;
    fetchDisabled?: boolean;
  };
}

function billingWindowFromQuery(query: Record<string, unknown>): { since: string; until: string } {
  const day = typeof query.day === 'string' ? query.day.trim() : undefined
  if (day) {
    const d = new Date(`${day}T00:00:00.000Z`)
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth()
    const start = new Date(Date.UTC(year, month, 1))
    const end = new Date(Date.UTC(year, month + 1, 0))
    const fmt = (x: Date) => x.toISOString().slice(0, 10)
    return { since: fmt(start), until: fmt(end) }
  }

  const since = typeof query.since === 'string' ? query.since.trim() : '';
  const until = typeof query.until === 'string' ? query.until.trim() : '';
  if (since && until) {
    return { since, until };
  }
  return currentUtcMonthRange();
}

async function getPremiumCreditsMeta(
  org: string,
  headers: HeadersInit,
  logger: Console,
  defaultQuota: number,
  since: string,
  until: string,
  fetchEnabled: boolean
): Promise<NonNullable<UserMetricsApiResponse['premiumCredits']>> {
  if (!fetchEnabled) {
    return {
      available: false,
      since,
      until,
      defaultQuota,
      usersWithBillingData: 0,
      perUserDataAvailable: false,
      fetchDisabled: true,
    }
  }

  const billing = await fetchOrganizationBilling(org, headers, since, until, logger)
  return {
    available: billing.available,
    since,
    until,
    defaultQuota,
    usersWithBillingData: 0,
    perUserDataAvailable: false,
    reason: billing.available ? undefined : billing.reason,
    httpStatus: billing.httpStatus,
    tokenScopes: billing.tokenScopes
  }
}

function mapUserRecord(record: Record<string, unknown>): UserUsageRecord {
  return {
    day: typeof record.day === 'string' ? record.day : undefined,
    user_login: String(record.user_login || ''),
    user_id: typeof record.user_id === 'number' ? record.user_id : Number(record.user_id) || 0,
    user_initiated_interaction_count: Number(record.user_initiated_interaction_count) || 0,
    code_generation_activity_count: Number(record.code_generation_activity_count) || 0,
    code_acceptance_activity_count: Number(record.code_acceptance_activity_count) || 0,
    loc_suggested_to_add_sum: Number(record.loc_suggested_to_add_sum) || 0,
    loc_added_sum: Number(record.loc_added_sum) || 0,
    loc_deleted_sum: Number(record.loc_deleted_sum) || 0,
    last_known_ide_version: (record.last_known_ide_version as string) ?? null,
    last_known_plugin_version: (record.last_known_plugin_version as string) ?? null,
    used_agent: Boolean(record.used_agent),
    used_chat: Boolean(record.used_chat),
    used_cli: Boolean(record.used_cli),
    used_copilot_code_review_active: Boolean(record.used_copilot_code_review_active),
    used_copilot_code_review_passive: Boolean(record.used_copilot_code_review_passive),
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
  };
}

async function loadAdoptionPhases(
  options: Options,
  headers: HeadersInit,
  logger: Console,
  users: UserUsageRecord[]
): Promise<AiAdoptionPhaseAggregate[]> {
  try {
    const orgTotals = await fetch28DayAdoptionPhases(options, headers, logger);
    return buildAdoptionPhaseView(orgTotals, users);
  } catch (error) {
    logger.warn('Adoption phase rollup unavailable:', error);
    return buildAdoptionPhaseView([], users);
  }
}

export default defineEventHandler(async (event: H3Event<EventHandlerRequest>) => {
  const logger = console;
  const config = useRuntimeConfig(event);
  const query = getQuery(event);

  const org = config.public.githubOrg;
  const ent = config.public.githubEnt;
  const scope = config.public.scope;
  const day = typeof query.day === 'string' ? query.day : undefined;
  const billingWindow = billingWindowFromQuery(query as Record<string, unknown>);

  if (scope?.includes('team')) {
    return new Response('Team scope is not supported for user metrics.', { status: 422 });
  }

  if (scope === 'organization' && !org) {
    return new Response('GitHub organization is not configured for user metrics.', { status: 422 });
  }

  if (scope === 'enterprise' && !ent) {
    return new Response('GitHub enterprise is not configured for user metrics.', { status: 422 });
  }

  if (!event.context.headers || !event.context.headers.has('Authorization')) {
    return new Response('No Authentication provided', { status: 401 });
  }

  const options = new Options({
    scope: scope === 'enterprise' ? 'enterprise' : 'organization',
    githubOrg: org,
    githubEnt: ent
  });

  const defaultQuota = Number(config.public.enterprisePremiumQuota) || 1000;
  const premiumCreditsFetchEnabled = isPremiumCreditsFetchEnabled(config.public);

  try {
    if (day) {
      const metaUrl = buildUsersOneDayReportUrl(options, day);
      const lines = await fetchNdjsonReport(metaUrl, event.context.headers, logger);
      let users = lines.map(mapUserRecord);

      if (org) {
        const directory = await fetchOrgMemberDirectory(org, event.context.headers, logger);
        users = enrichWithOrgDirectory(users, directory);
      }

      const premiumCredits = org
        ? await getPremiumCreditsMeta(
            org,
            event.context.headers,
            logger,
            defaultQuota,
            billingWindow.since,
            billingWindow.until,
            premiumCreditsFetchEnabled
          )
        : undefined;

      const adoptionByPhase = await loadAdoptionPhases(options, event.context.headers, logger, users);

      return {
        reportDay: day,
        users,
        adoptionByPhase,
        premiumCredits
      } satisfies UserMetricsApiResponse;
    }

    const metaUrl = buildUsers28DayReportUrl(options);
    const meta = await fetchReportMeta(metaUrl, event.context.headers);

    if (!meta?.download_links?.length) {
      return {
        reportStartDay: meta?.report_start_day,
        reportEndDay: meta?.report_end_day,
        users: []
      } satisfies UserMetricsApiResponse;
    }

    const lines = await downloadReportFromMeta(meta, logger);
    let users = consolidateUserRecords(lines.map(mapUserRecord));

    if (org) {
      const directory = await fetchOrgMemberDirectory(org, event.context.headers, logger);
      users = enrichWithOrgDirectory(users, directory);
    }

    const premiumCredits = org
      ? await getPremiumCreditsMeta(
          org,
          event.context.headers,
          logger,
          defaultQuota,
          billingWindow.since,
          billingWindow.until,
          premiumCreditsFetchEnabled
        )
      : undefined;

    const adoptionByPhase = await loadAdoptionPhases(options, event.context.headers, logger, users);

    return {
      reportStartDay: meta.report_start_day,
      reportEndDay: meta.report_end_day,
      users,
      adoptionByPhase,
      premiumCredits
    } satisfies UserMetricsApiResponse;
  } catch (error: unknown) {
    logger.error('Error fetching user metrics data:', error);
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    const message = error instanceof Error ? error.message : String(error);
    return new Response('Error fetching user metrics data: ' + message, { status: statusCode });
  }
});
