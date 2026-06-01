import type { CopilotMetrics } from '@/model/Copilot_Metrics';
import type { Options } from '@/model/Options';
import { convertToMetrics } from '@/model/MetricsToUsageConverter';
import type { Metrics } from '@/model/Metrics';
import type { UserTeamRecord, UserUsageRecord, UsageDayRecord } from '../types/copilot-usage';
import { usageNumber } from '../types/copilot-usage';
import {
  buildUserTeamsReportUrl,
  buildUsersOneDayReportUrl,
  convertUsageRecordToLegacyMetric,
  fetchNdjsonReport,
  getRequestedDays
} from './usage-metrics-report';

export interface TeamMetricsResult {
  slug: string;
  metrics: Metrics[];
  usage: CopilotMetrics[];
}

function aggregateUserRecordsToDayRecord(
  day: string,
  userRecords: UserUsageRecord[]
): UsageDayRecord {
  const totals_by_feature: UsageDayRecord['totals_by_feature'] = [];
  const featureMap = new Map<string, Record<string, number>>();

  let daily_active_users = 0;

  for (const user of userRecords) {
    if (
      user.used_agent ||
      user.used_chat ||
      user.used_cli ||
      user.used_copilot_code_review_active ||
      user.used_copilot_code_review_passive ||
      (user.code_acceptance_activity_count || 0) > 0 ||
      (user.user_initiated_interaction_count || 0) > 0
    ) {
      daily_active_users += 1;
    }

    for (const featureTotal of user.totals_by_feature || []) {
      const key = featureTotal.feature;
      if (!featureMap.has(key)) {
        featureMap.set(key, {
          user_initiated_interaction_count: 0,
          code_generation_activity_count: 0,
          code_acceptance_activity_count: 0,
          loc_suggested_to_add_sum: 0,
          loc_added_sum: 0,
          loc_deleted_sum: 0
        });
      }
      const bucket = featureMap.get(key)!;
      bucket.user_initiated_interaction_count += usageNumber(featureTotal.user_initiated_interaction_count);
      bucket.code_generation_activity_count += usageNumber(featureTotal.code_generation_activity_count);
      bucket.code_acceptance_activity_count += usageNumber(featureTotal.code_acceptance_activity_count);
      bucket.loc_suggested_to_add_sum += usageNumber(featureTotal.loc_suggested_to_add_sum);
      bucket.loc_added_sum += usageNumber(featureTotal.loc_added_sum);
      bucket.loc_deleted_sum += usageNumber(featureTotal.loc_deleted_sum);
    }
  }

  for (const [feature, totals] of featureMap.entries()) {
    totals_by_feature.push({ feature, ...totals });
  }

  return {
    day,
    daily_active_users,
    totals_by_feature
  };
}

export async function fetchTeamMetrics(
  options: Options,
  headers: HeadersInit,
  teamSlugs: string[],
  logger: Console
): Promise<TeamMetricsResult[]> {
  if (!teamSlugs.length) {
    return [];
  }

  const scope = options.scope === 'enterprise' ? 'enterprise' : 'organization';
  const orgOptions = new Options({
    since: options.since,
    until: options.until,
    isDataMocked: options.isDataMocked,
    githubOrg: options.githubOrg,
    githubEnt: options.githubEnt,
    scope,
    excludeHolidays: options.excludeHolidays,
    locale: options.locale
  });

  const days = getRequestedDays(orgOptions);
  const slugSet = new Set(teamSlugs.map((slug) => slug.toLowerCase()));
  const recordsByTeamDay = new Map<string, Map<string, UserUsageRecord[]>>();

  for (const slug of teamSlugs) {
    recordsByTeamDay.set(slug, new Map());
  }

  for (const day of days) {
    const [teamRows, userRows] = await Promise.all([
      fetchNdjsonReport(buildUserTeamsReportUrl(orgOptions, day), headers, logger),
      fetchNdjsonReport(buildUsersOneDayReportUrl(orgOptions, day), headers, logger)
    ]);

    const userById = new Map<number, UserUsageRecord>();
    for (const row of userRows) {
      const userId = usageNumber(row.user_id);
      if (!userId) continue;
      userById.set(userId, row as UserUsageRecord);
    }

    const teamMembers = new Map<string, Set<number>>();
    for (const row of teamRows) {
      const teamRow = row as UserTeamRecord;
      const slug = String(teamRow.slug || '').toLowerCase();
      if (!slugSet.has(slug)) continue;

      if (!teamMembers.has(slug)) {
        teamMembers.set(slug, new Set());
      }
      teamMembers.get(slug)!.add(usageNumber(teamRow.user_id));
    }

    for (const slug of teamSlugs) {
      const normalizedSlug = slug.toLowerCase();
      const memberIds = teamMembers.get(normalizedSlug);
      if (!memberIds?.size) continue;

      const teamUsers: UserUsageRecord[] = [];
      for (const userId of memberIds) {
        const userRecord = userById.get(userId);
        if (userRecord) {
          teamUsers.push({ ...userRecord, day });
        }
      }

      if (teamUsers.length) {
        recordsByTeamDay.get(slug)!.set(day, teamUsers);
      }
    }
  }

  return teamSlugs.map((slug) => {
    const dayMap = recordsByTeamDay.get(slug)!;
    const usageRecords = Array.from(dayMap.entries())
      .sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
      .map(([day, users]) => convertUsageRecordToLegacyMetric(aggregateUserRecordsToDayRecord(day, users)));

    return {
      slug,
      usage: usageRecords,
      metrics: convertToMetrics(usageRecords)
    };
  });
}
