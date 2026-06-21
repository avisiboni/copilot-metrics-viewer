import type { Options } from '@/model/Options'
import type { UserUsageRecord } from '../types/copilot-usage'
import { consolidateUserRecords, mapFullUserRecord } from './usage-insights-aggregate'
import { downloadReportFromMeta, fetchReportMeta } from './usage-metrics-download'
import {
  buildUsers28DayReportUrl,
  buildUsersOneDayReportUrl,
  fetchNdjsonReport,
  getRequestedDays,
} from './usage-metrics-report'
import { getUserDayMetricsByDateRange } from '../../server/storage/user-day-metrics-storage'

const DAY_FETCH_CONCURRENCY = 8

function scopeIdentifier(options: Options): string {
  return options.scope === 'enterprise'
    ? (options.githubEnt || '')
    : (options.githubOrg || options.githubEnt || '')
}

function isHistoricalStorageEnabled(): boolean {
  return process.env.ENABLE_HISTORICAL_MODE === 'true'
}

async function fetchUsersForSingleDay(
  options: Options,
  headers: HeadersInit,
  day: string,
  logger: Console
): Promise<UserUsageRecord[]> {
  const lines = await fetchNdjsonReport(
    buildUsersOneDayReportUrl(options, day),
    headers,
    logger
  )
  return lines.map((line) => mapFullUserRecord(line as Record<string, unknown>))
}

/**
 * Load per-user usage for the full requested date range (not only the latest 28-day rollup).
 */
export async function fetchUsersForDateRange(
  options: Options,
  headers: HeadersInit,
  logger: Console
): Promise<{
  users: UserUsageRecord[]
  reportStartDay: string
  reportEndDay: string
}> {
  const days = getRequestedDays(options)
  if (!days.length) {
    return { users: [], reportStartDay: '', reportEndDay: '' }
  }

  const startDay = days[0]!
  const endDay = days[days.length - 1]!
  const identifier = scopeIdentifier(options)

  if (isHistoricalStorageEnabled() && identifier && options.scope) {
    try {
      const stored = await getUserDayMetricsByDateRange(
        options.scope,
        identifier,
        startDay,
        endDay
      )
      if (stored.length > 0) {
        const users = consolidateUserRecords(
          stored.map((row) => mapFullUserRecord(row as Record<string, unknown>))
        )
        return { users, reportStartDay: startDay, reportEndDay: endDay }
      }
    } catch (err) {
      logger.warn('Historical user metrics unavailable, falling back to API:', err)
    }
  }

  if (days.length <= 28) {
    try {
      const meta = await fetchReportMeta(buildUsers28DayReportUrl(options), headers)
      if (meta?.download_links?.length) {
        const lines = await downloadReportFromMeta(meta, logger)
        const daySet = new Set(days)
        const raw = lines.map((line) =>
          mapFullUserRecord(line as Record<string, unknown>)
        )
        const inRange = raw.filter((row) => !row.day || daySet.has(row.day))
        const coveredDays = new Set(
          inRange.map((row) => row.day).filter((day): day is string => Boolean(day))
        )
        const hasPerDayRows = raw.some((row) => Boolean(row.day))
        const allRequestedDaysCovered = days.every((day) => coveredDays.has(day))
        const isAggregatedRollup = inRange.length > 0 && !hasPerDayRows
        if (inRange.length > 0 && (isAggregatedRollup || allRequestedDaysCovered)) {
          return {
            users: consolidateUserRecords(inRange),
            reportStartDay: meta.report_start_day || startDay,
            reportEndDay: meta.report_end_day || endDay,
          }
        }
      }
    } catch (err) {
      logger.warn('28-day users report unavailable, falling back to per-day fetch:', err)
    }
  }

  logger.info(
    `Fetching per-user metrics for ${days.length} days (${startDay} to ${endDay})`
  )

  const allRows: UserUsageRecord[] = []
  for (let offset = 0; offset < days.length; offset += DAY_FETCH_CONCURRENCY) {
    const chunk = days.slice(offset, offset + DAY_FETCH_CONCURRENCY)
    const settled = await Promise.allSettled(
      chunk.map((day) => fetchUsersForSingleDay(options, headers, day, logger))
    )
    for (const result of settled) {
      if (result.status === 'fulfilled') {
        allRows.push(...result.value)
      } else {
        logger.warn('Failed to fetch users for one day:', result.reason)
      }
    }
  }

  const actualDays = [...new Set(allRows.map((row) => row.day).filter(Boolean))].sort()
  return {
    users: consolidateUserRecords(allRows),
    reportStartDay: actualDays[0] || startDay,
    reportEndDay: actualDays[actualDays.length - 1] || endDay,
  }
}
