/**
 * Data-range API endpoint
 * GET /api/data-range
 *
 * Returns the date range for which Copilot metrics data is available, so the
 * frontend date picker can be clamped accordingly.
 *
 * Behavior by mode:
 *   - Mock mode: returns the min/max `day` across the bundled mock JSON files.
 *   - Historical mode: returns MIN/MAX(metrics_date) across `metrics` and
 *     `user_day_metrics` for the requested scope/identifier. Falls back to the
 *     live window when the storage is empty or unreachable.
 *   - Live mode: returns a rolling 28-day window ending yesterday (the GitHub
 *     metrics API has roughly a 1-day lag, so today is not yet available).
 *
 * Optional:
 *   - BILLING_LOOKBACK_MONTHS: extend `earliest` backward so Usage & billing can
 *     select longer cost windows. GitHub Billing is month-based and often has
 *     more history than Copilot metrics reports (≈28 days).
 */

import { Options } from '@/model/Options';
import { baseScope } from '../storage/user-day-metrics-storage';
import { getPool } from '../storage/db';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import mockOrgMetrics from '../../public/mock-data/new-api/organization-28-day-report.json';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import mockEntMetrics from '../../public/mock-data/new-api/enterprise-28-day-report.json';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import mockOrgUsers from '../../public/mock-data/new-api/organization-users-28-day-report.json';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import mockEntUsers from '../../public/mock-data/new-api/enterprise-users-28-day-report.json';

export interface DataRange {
  /** ISO 8601 YYYY-MM-DD — earliest day with data (inclusive). */
  earliest: string;
  /** ISO 8601 YYYY-MM-DD — latest day with data (inclusive). */
  latest: string;
  /** Which mode produced this range. */
  mode: 'mock' | 'historical' | 'live';
}

/** Format a Date as YYYY-MM-DD (UTC). */
function toIsoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Live-mode default window: the 28 days ending yesterday. */
function liveWindow(): { earliest: string; latest: string } {
  const now = new Date();
  // Yesterday — GitHub metrics have ~1-day lag, today is not ready yet
  const latest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  // 28 days inclusive ending yesterday → start = latest - 27d
  const earliest = new Date(latest.getTime() - 27 * 24 * 60 * 60 * 1000);
  return { earliest: toIsoDay(earliest), latest: toIsoDay(latest) };
}

/**
 * Optional billing lookback: GitHub Billing Usage APIs are monthly and often
 * retain more history than Copilot metrics. Extending earliest lets the date
 * picker select long cost windows without requiring a year of metrics in DB.
 */
export function applyBillingLookback(range: { earliest: string; latest: string }): {
  earliest: string
  latest: string
} {
  const months = parseInt(process.env.BILLING_LOOKBACK_MONTHS || '0', 10)
  if (!Number.isFinite(months) || months <= 0) return range

  const end = new Date(`${range.latest}T00:00:00.000Z`)
  if (Number.isNaN(end.getTime())) return range

  const lookback = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - months, end.getUTCDate()))
  const lookbackDay = toIsoDay(lookback)
  return {
    earliest: lookbackDay < range.earliest ? lookbackDay : range.earliest,
    latest: range.latest,
  }
}

/** Extract every `day` (YYYY-MM-DD) field from a mock JSON `day_totals` array. */
function collectMockDays(mockJson: unknown): string[] {
  const json = mockJson as { day_totals?: Array<{ day?: string }> };
  if (!Array.isArray(json.day_totals)) return [];
  return json.day_totals
    .map(r => r?.day)
    .filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d));
}

function mockRange(scope: string): { earliest: string; latest: string } {
  const isOrg = baseScope(scope || 'organization') === 'organization';
  const days = isOrg
    ? [...collectMockDays(mockOrgMetrics), ...collectMockDays(mockOrgUsers)]
    : [...collectMockDays(mockEntMetrics), ...collectMockDays(mockEntUsers)];

  if (days.length === 0) return liveWindow();
  // YYYY-MM-DD strings sort lexicographically == chronologically
  const sorted = days.slice().sort();
  return { earliest: sorted[0]!, latest: sorted[sorted.length - 1]! };
}

async function historicalRange(
  scope: string,
  identifier: string
): Promise<{ earliest: string; latest: string } | null> {
  if (!identifier) return null;
  const pool = getPool();
  const normalizedScope = baseScope(scope);
  // Union of metrics (aggregated daily) and user_day_metrics (per-user daily)
  const { rows } = await pool.query(
    `SELECT
       LEAST(
         (SELECT MIN(metrics_date) FROM metrics
          WHERE scope = $1 AND identifier = $2),
         (SELECT MIN(metrics_date) FROM user_day_metrics
          WHERE scope = $1 AND identifier = $2)
       ) AS earliest,
       GREATEST(
         (SELECT MAX(metrics_date) FROM metrics
          WHERE scope = $1 AND identifier = $2),
         (SELECT MAX(metrics_date) FROM user_day_metrics
          WHERE scope = $1 AND identifier = $2)
       ) AS latest`,
    [normalizedScope, identifier]
  );
  const row = rows[0];
  if (!row?.earliest || !row?.latest) return null;
  return {
    earliest: new Date(row.earliest).toISOString().slice(0, 10),
    latest: new Date(row.latest).toISOString().slice(0, 10),
  };
}

export default defineEventHandler(async (event): Promise<DataRange> => {
  const logger = console;
  const query = getQuery(event);
  const options = Options.fromQuery(query);
  const scope = options.scope || 'organization';
  const identifier = options.githubOrg || options.githubEnt || '';

  if (options.isDataMocked) {
    return { ...applyBillingLookback(mockRange(scope)), mode: 'mock' };
  }

  const historicalEnabled = process.env.ENABLE_HISTORICAL_MODE === 'true';
  const hasDatabase = !!process.env.DATABASE_URL;

  // Direct API mode: skip PostgreSQL entirely unless historical mode or DATABASE_URL is configured.
  if (historicalEnabled || hasDatabase) {
    try {
      const stored = await historicalRange(scope, identifier);
      if (stored) return { ...applyBillingLookback(stored), mode: 'historical' };
      logger.info('[data-range] No stored data yet, falling back to live window');
    } catch (err) {
      logger.warn('[data-range] Storage lookup failed, falling back to live window:', err);
    }
  }

  return { ...applyBillingLookback(liveWindow()), mode: 'live' };
});
