import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
export interface MockUsers28DayPayload {
  report_start_day?: string
  report_end_day?: string
  day_totals: Record<string, unknown>[]
}

/** Load bundled users-28-day mock JSON (day_totals rows) for local / test usage. */
export function loadMockUsers28DayPayload(options: {
  getUserMetricsMockDataPath: () => string
}): MockUsers28DayPayload {
  const path = resolve(options.getUserMetricsMockDataPath())
  const raw = JSON.parse(readFileSync(path, 'utf8')) as MockUsers28DayPayload & {
    user_totals?: Record<string, unknown>[]
  }

  if (Array.isArray(raw.day_totals) && raw.day_totals.length > 0) {
    return {
      report_start_day: raw.report_start_day,
      report_end_day: raw.report_end_day,
      day_totals: raw.day_totals
    }
  }

  if (Array.isArray(raw.user_totals)) {
    return {
      report_start_day: raw.report_start_day,
      report_end_day: raw.report_end_day,
      day_totals: raw.user_totals
    }
  }

  return {
    report_start_day: raw.report_start_day,
    report_end_day: raw.report_end_day,
    day_totals: []
  }
}
