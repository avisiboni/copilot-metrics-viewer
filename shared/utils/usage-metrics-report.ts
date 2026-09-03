import type { CopilotMetrics } from '@/model/Copilot_Metrics';
import type { Options } from '@/model/Options';
import { parseUtcDate } from '@/utils/dateUtils';
import type {
  UsageDayRecord,
  UsageFeatureTotal,
  UsageReportMeta
} from '../types/copilot-usage';
import { isChatPanelFeature, usageNumber } from '../types/copilot-usage';
import { extractAdoptionPhaseTotals } from './ai-adoption-phase';
import type { AiAdoptionPhaseAggregate } from '../types/copilot-usage';
import { downloadReportFromMeta, fetchReportMeta } from './usage-metrics-download';

function sumByKey<T extends Record<string, unknown>>(items: T[], key: keyof T): number {
  return items.reduce((sum, item) => sum + usageNumber(item[key]), 0);
}

function aggregateBy<T extends Record<string, unknown>>(
  items: T[],
  key: keyof T,
  numericKeys: Array<keyof T>
): Array<T> {
  const grouped = new Map<string, Record<string, unknown>>();

  for (const item of items) {
    const groupKey = String(item[key] ?? 'unknown');
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, { [key]: groupKey });
      for (const numericKey of numericKeys) {
        grouped.get(groupKey)![String(numericKey)] = 0;
      }
    }

    const target = grouped.get(groupKey)!;
    for (const numericKey of numericKeys) {
      target[String(numericKey)] = usageNumber(target[String(numericKey)]) + usageNumber(item[numericKey]);
    }
  }

  return Array.from(grouped.values()) as T[];
}

function normalizeLabel(value: string | undefined, fallback: string): string {
  const normalized = (value || '').trim();
  return normalized.length ? normalized : fallback;
}

export function getRequestedDays(options: Options): string[] {
  const today = new Date();
  const startDate = options.since
    ? parseUtcDate(options.since)
    : new Date(today.getTime() - 27 * 24 * 60 * 60 * 1000);
  const endDate = options.until ? parseUtcDate(options.until) : today;

  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    dates.push(cursor.toISOString().split('T')[0]);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function isDefault28DayRange(options: Options): boolean {
  if (!options.since || !options.until) {
    return true;
  }

  const today = new Date();
  const expectedFrom = new Date(today.getTime() - 27 * 24 * 60 * 60 * 1000);
  const from = parseUtcDate(options.since);
  const to = parseUtcDate(options.until);

  return (
    from.toDateString() === expectedFrom.toDateString() &&
    to.toDateString() === today.toDateString()
  );
}

function buildOneDayReportUrl(options: Options, day: string): string {
  switch (options.scope) {
    case 'organization':
      if (!options.githubOrg) throw new Error('GitHub organization must be set for organization scope');
      return `https://api.github.com/orgs/${options.githubOrg}/copilot/metrics/reports/organization-1-day?day=${encodeURIComponent(day)}`;
    case 'enterprise':
      if (!options.githubEnt) throw new Error('GitHub enterprise must be set for enterprise scope');
      return `https://api.github.com/enterprises/${options.githubEnt}/copilot/metrics/reports/enterprise-1-day?day=${encodeURIComponent(day)}`;
    default:
      throw new Error(`Scope "${options.scope}" is not supported by the Copilot usage metrics reports API.`);
  }
}

function build28DayReportUrl(options: Options): string {
  switch (options.scope) {
    case 'organization':
      if (!options.githubOrg) throw new Error('GitHub organization must be set for organization scope');
      return `https://api.github.com/orgs/${options.githubOrg}/copilot/metrics/reports/organization-28-day/latest`;
    case 'enterprise':
      if (!options.githubEnt) throw new Error('GitHub enterprise must be set for enterprise scope');
      return `https://api.github.com/enterprises/${options.githubEnt}/copilot/metrics/reports/enterprise-28-day/latest`;
    default:
      throw new Error(`Scope "${options.scope}" is not supported by the Copilot usage metrics reports API.`);
  }
}

export function buildUserTeamsReportUrl(options: Options, day: string): string {
  switch (options.scope) {
    case 'organization':
      if (!options.githubOrg) throw new Error('GitHub organization must be set for organization scope');
      return `https://api.github.com/orgs/${options.githubOrg}/copilot/metrics/reports/user-teams-1-day?day=${encodeURIComponent(day)}`;
    case 'enterprise':
      if (!options.githubEnt) throw new Error('GitHub enterprise must be set for enterprise scope');
      return `https://api.github.com/enterprises/${options.githubEnt}/copilot/metrics/reports/user-teams-1-day?day=${encodeURIComponent(day)}`;
    default:
      throw new Error(`Scope "${options.scope}" is not supported for user-teams reports.`);
  }
}

export function buildUsersOneDayReportUrl(options: Options, day: string): string {
  switch (options.scope) {
    case 'organization':
      if (!options.githubOrg) throw new Error('GitHub organization must be set for organization scope');
      return `https://api.github.com/orgs/${options.githubOrg}/copilot/metrics/reports/users-1-day?day=${encodeURIComponent(day)}`;
    case 'enterprise':
      if (!options.githubEnt) throw new Error('GitHub enterprise must be set for enterprise scope');
      return `https://api.github.com/enterprises/${options.githubEnt}/copilot/metrics/reports/users-1-day?day=${encodeURIComponent(day)}`;
    default:
      throw new Error(`Scope "${options.scope}" is not supported for users-1-day reports.`);
  }
}

export function buildUsers28DayReportUrl(options: Options): string {
  switch (options.scope) {
    case 'organization':
      if (!options.githubOrg) throw new Error('GitHub organization must be set for organization scope');
      return `https://api.github.com/orgs/${options.githubOrg}/copilot/metrics/reports/users-28-day/latest`;
    case 'enterprise':
      if (!options.githubEnt) throw new Error('GitHub enterprise must be set for enterprise scope');
      return `https://api.github.com/enterprises/${options.githubEnt}/copilot/metrics/reports/users-28-day/latest`;
    default:
      throw new Error(`Scope "${options.scope}" is not supported for users-28-day reports.`);
  }
}

async function fetchOneDayUsageReport(
  options: Options,
  headers: HeadersInit,
  day: string,
  logger: Console
): Promise<UsageDayRecord | null> {
  const metaUrl = buildOneDayReportUrl(options, day);

  let meta: UsageReportMeta | null;
  try {
    meta = await fetchReportMeta(metaUrl, headers);
  } catch (error: unknown) {
    const statusCode = error && typeof error === 'object' && 'statusCode' in error
      ? (error as { statusCode?: number }).statusCode
      : undefined;

    if (statusCode === 404) {
      logger.warn(`No usage metrics report available for ${day}; skipping.`);
      return null;
    }

    throw error;
  }

  if (!meta) {
    logger.warn(`Empty usage metrics metadata for ${day}; skipping.`);
    return null;
  }

  const lines = await downloadReportFromMeta(meta, logger);
  const firstLine = lines[0];
  if (!firstLine) {
    return null;
  }

  return firstLine as UsageDayRecord;
}

async function fetch28DayUsageReports(
  options: Options,
  headers: HeadersInit,
  logger: Console
): Promise<UsageDayRecord[] | null> {
  const metaUrl = build28DayReportUrl(options);

  try {
    const meta = await fetchReportMeta(metaUrl, headers);
    if (!meta) {
      logger.warn('Empty 28-day usage metrics metadata; falling back to per-day fetch.');
      return null;
    }

    const lines = await downloadReportFromMeta(meta, logger);
    if (!lines.length) {
      return null;
    }

    return lines.map((line) => line as UsageDayRecord);
  } catch (error: unknown) {
    const statusCode = error && typeof error === 'object' && 'statusCode' in error
      ? (error as { statusCode?: number }).statusCode
      : undefined;

    if (statusCode === 404) {
      logger.warn('No 28-day usage metrics rollup available; falling back to per-day fetch.');
      return null;
    }

    throw error;
  }
}

function filterRecordsByDateRange(records: UsageDayRecord[], options: Options): UsageDayRecord[] {
  const requestedDays = new Set(getRequestedDays(options));
  return records.filter((record) => requestedDays.has(record.day));
}

export function convertUsageRecordToLegacyMetric(record: UsageDayRecord): CopilotMetrics {
  const featureTotals = record.totals_by_feature || [];
  const ideTotals = record.totals_by_ide || [];
  const languageFeatureTotals = record.totals_by_language_feature || [];
  const modelFeatureTotals = record.totals_by_model_feature || [];

  const codeCompletionFeature = featureTotals.filter((item) => item.feature === 'code_completion');
  const chatFeatures = featureTotals.filter((item) => isChatPanelFeature(item.feature));
  const agentEditFeature = featureTotals.filter((item) => item.feature === 'agent_edit');

  const codeCompletionLanguageTotals = aggregateBy(
    languageFeatureTotals.filter((item) => item.feature === 'code_completion'),
    'language',
    ['code_generation_activity_count', 'code_acceptance_activity_count', 'loc_suggested_to_add_sum', 'loc_added_sum']
  );

  const codeCompletionModelTotals = aggregateBy(
    modelFeatureTotals.filter((item) => item.feature === 'code_completion'),
    'model',
    ['code_generation_activity_count', 'code_acceptance_activity_count', 'loc_suggested_to_add_sum', 'loc_added_sum']
  );

  const chatModelTotals = aggregateBy(
    modelFeatureTotals.filter((item) => isChatPanelFeature(item.feature)),
    'model',
    ['user_initiated_interaction_count', 'code_generation_activity_count', 'code_acceptance_activity_count', 'loc_suggested_to_add_sum', 'loc_added_sum']
  );

  const chatModeBreakdown = chatFeatures.map((feature: UsageFeatureTotal) => ({
    mode: feature.feature.replace('chat_panel_', '').replace('_mode', ''),
    total_chats: usageNumber(feature.user_initiated_interaction_count),
    total_insertions: usageNumber(feature.code_acceptance_activity_count),
    loc_added: usageNumber(feature.loc_added_sum)
  }));

  return {
    date: record.day,
    total_active_users: usageNumber(record.daily_active_users),
    total_engaged_users: usageNumber(record.daily_active_users),
    usage_detail: record,
    copilot_ide_code_completions: {
      total_engaged_users: sumByKey(codeCompletionFeature, 'code_acceptance_activity_count'),
      total_code_suggestions: sumByKey(codeCompletionFeature, 'code_generation_activity_count'),
      total_code_acceptances: sumByKey(codeCompletionFeature, 'code_acceptance_activity_count'),
      total_code_lines_suggested: sumByKey(codeCompletionFeature, 'loc_suggested_to_add_sum'),
      total_code_lines_accepted: sumByKey(codeCompletionFeature, 'loc_added_sum'),
      languages: codeCompletionLanguageTotals.map((item) => ({
        name: normalizeLabel(String(item.language), 'unknown'),
        total_engaged_users: usageNumber(item.code_acceptance_activity_count),
        total_code_suggestions: usageNumber(item.code_generation_activity_count),
        total_code_acceptances: usageNumber(item.code_acceptance_activity_count),
        total_code_lines_suggested: usageNumber(item.loc_suggested_to_add_sum),
        total_code_lines_accepted: usageNumber(item.loc_added_sum)
      })),
      editors: ideTotals.map((item) => ({
        name: normalizeLabel(item.ide, 'unknown'),
        total_engaged_users: usageNumber(item.code_acceptance_activity_count),
        total_code_suggestions: usageNumber(item.code_generation_activity_count),
        total_code_acceptances: usageNumber(item.code_acceptance_activity_count),
        total_code_lines_suggested: usageNumber(item.loc_suggested_to_add_sum),
        total_code_lines_accepted: usageNumber(item.loc_added_sum),
        models: []
      })),
      models: codeCompletionModelTotals.map((item) => ({
        name: normalizeLabel(String(item.model), 'unknown'),
        is_custom_model: String(item.model || '').trim().length > 0 && String(item.model) !== 'default' && String(item.model) !== 'others',
        custom_model_training_date: null,
        total_engaged_users: usageNumber(item.code_acceptance_activity_count),
        total_code_suggestions: usageNumber(item.code_generation_activity_count),
        total_code_acceptances: usageNumber(item.code_acceptance_activity_count),
        total_code_lines_suggested: usageNumber(item.loc_suggested_to_add_sum),
        total_code_lines_accepted: usageNumber(item.loc_added_sum),
        languages: []
      }))
    } as CopilotMetrics['copilot_ide_code_completions'],
    copilot_ide_chat: {
      total_engaged_users: usageNumber(record.monthly_active_chat_users),
      total_chats: sumByKey(chatFeatures, 'user_initiated_interaction_count'),
      total_chat_insertion_events: sumByKey(chatFeatures, 'code_acceptance_activity_count'),
      total_chat_copy_events: 0,
      chat_mode_breakdown: chatModeBreakdown,
      editors: [
        {
          name: ideTotals.length === 1 ? normalizeLabel(ideTotals[0]?.ide, 'unknown') : 'all ides',
          total_engaged_users: usageNumber(record.monthly_active_chat_users),
          models: chatModelTotals.map((item) => ({
            name: normalizeLabel(String(item.model), 'unknown'),
            is_custom_model: String(item.model || '').trim().length > 0 && String(item.model) !== 'default' && String(item.model) !== 'others',
            custom_model_training_date: null,
            total_engaged_users: usageNumber(item.user_initiated_interaction_count),
            total_chats: usageNumber(item.user_initiated_interaction_count),
            total_chat_insertion_events: usageNumber(item.code_acceptance_activity_count),
            total_chat_copy_events: 0
          }))
        }
      ]
    } as CopilotMetrics['copilot_ide_chat'],
    copilot_dotcom_chat: null,
    copilot_dotcom_pull_requests: null,
    agent_edit_summary: {
      loc_added_sum: sumByKey(agentEditFeature, 'loc_added_sum'),
      loc_deleted_sum: sumByKey(agentEditFeature, 'loc_deleted_sum'),
      code_generation_activity_count: sumByKey(agentEditFeature, 'code_generation_activity_count')
    }
  } as CopilotMetrics;
}

export async function fetchUsageMetricsAsLegacy(
  options: Options,
  headers: HeadersInit,
  logger: Console
): Promise<CopilotMetrics[]> {
  let availableRecords: UsageDayRecord[] = [];

  if (isDefault28DayRange(options)) {
    const rollupRecords = await fetch28DayUsageReports(options, headers, logger);
    if (rollupRecords?.length) {
      availableRecords = filterRecordsByDateRange(rollupRecords, options);
    }
  }

  if (!availableRecords.length) {
    const days = getRequestedDays(options);
    const settled = await Promise.allSettled(
      days.map((day) => fetchOneDayUsageReport(options, headers, day, logger))
    );

    for (const result of settled) {
      if (result.status === 'fulfilled' && result.value) {
        availableRecords.push(result.value);
      } else if (result.status === 'rejected') {
        logger.warn('Failed to fetch usage metrics for one day:', result.reason);
      }
    }
  }

  if (!availableRecords.length) {
    throw new Error('No usage metrics reports were available for the selected date range.');
  }

  availableRecords.sort((a, b) => a.day.localeCompare(b.day));
  return availableRecords.map(convertUsageRecordToLegacyMetric);
}

/** Org/enterprise 28-day rollup line (includes `totals_by_ai_adoption_phase` when available). */
export async function fetch28DayRollupRecord(
  options: Options,
  headers: HeadersInit,
  logger: Console
): Promise<Record<string, unknown> | null> {
  const metaUrl = build28DayReportUrl(options);

  try {
    const meta = await fetchReportMeta(metaUrl, headers);
    if (!meta?.download_links?.length) {
      return null;
    }

    const lines = await downloadReportFromMeta(meta, logger);
    if (!lines.length) {
      return null;
    }

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i] as Record<string, unknown>;
      if (extractAdoptionPhaseTotals(line).length) {
        return line;
      }
    }

    return lines[lines.length - 1] as Record<string, unknown>;
  } catch (error: unknown) {
    const statusCode = error && typeof error === 'object' && 'statusCode' in error
      ? (error as { statusCode?: number }).statusCode
      : undefined;

    if (statusCode === 404) {
      logger.warn('No 28-day rollup report available for adoption phases.');
      return null;
    }

    throw error;
  }
}

export async function fetch28DayAdoptionPhases(
  options: Options,
  headers: HeadersInit,
  logger: Console
): Promise<AiAdoptionPhaseAggregate[]> {
  const rollup = await fetch28DayRollupRecord(options, headers, logger);
  return extractAdoptionPhaseTotals(rollup);
}

export async function fetchNdjsonReport(
  metaUrl: string,
  headers: HeadersInit,
  logger: Console
): Promise<Record<string, unknown>[]> {
  try {
    const meta = await fetchReportMeta(metaUrl, headers);
    return downloadReportFromMeta(meta, logger);
  } catch (error: unknown) {
    const statusCode = error && typeof error === 'object' && 'statusCode' in error
      ? (error as { statusCode?: number }).statusCode
      : undefined;

    if (statusCode === 404) {
      logger.warn(`Report not found: ${metaUrl}`);
      return [];
    }

    throw error;
  }
}
