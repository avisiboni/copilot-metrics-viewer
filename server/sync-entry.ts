/**
 * Standalone entry point for sync job
 * This can be run as a separate container or cron job
 * 
 * Usage:
 *   node server/sync-entry.ts
 * 
 * Environment variables:
 *   - NUXT_PUBLIC_SCOPE: organization or enterprise
 *   - NUXT_PUBLIC_GITHUB_ORG: GitHub organization slug
 *   - NUXT_PUBLIC_GITHUB_ENT: GitHub enterprise slug
 *   - NUXT_GITHUB_TOKEN: GitHub personal access token (alternative to GitHub App)
 *   - NUXT_GITHUB_APP_ID: GitHub App ID (alternative to PAT)
 *   - NUXT_GITHUB_APP_PRIVATE_KEY: GitHub App private key (alternative to PAT)
 *   - NUXT_GITHUB_API_BASE_URL: Optional API base URL override for GHE.com (e.g. https://api.SUBDOMAIN.ghe.com)
 *   - SYNC_DAYS_BACK: Number of days to sync (default: 28, uses bulk download)
 *   - SYNC_SINCE / SYNC_UNTIL: Optional YYYY-MM-DD range for long backfill
 *     (uses bulk for the latest 28 days, then 1-day API for older dates).
 *     When both are set they take precedence over SYNC_DAYS_BACK.
 *   - DATABASE_URL: PostgreSQL connection string (or use PG* env vars)
 *   - HTTP_PROXY: Optional HTTP/HTTPS proxy URL (e.g. http://proxy:8080)
 *   - CUSTOM_CA_PATH: Optional path to a custom CA certificate file
 */

// Initialize proxy agent before any fetch calls
import { initializeProxyAgent } from './utils/proxy-agent';
initializeProxyAgent(true /* exitOnError */);

import { syncBulk, syncMetricsForDateRange } from './services/sync-service';
import { initSchema } from './storage/db';
import { closePool } from './storage/db';
import { getSyncAuthHeaders } from './utils/sync-auth';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export async function runSync() {
  const logger = console;

  // Get configuration from environment
  const rawScope = process.env.NUXT_PUBLIC_SCOPE || 'organization';
  const scope = (rawScope === 'team-organization' ? 'organization'
    : rawScope === 'team-enterprise' ? 'enterprise'
    : rawScope) as 'organization' | 'enterprise';
  const githubOrg = process.env.NUXT_PUBLIC_GITHUB_ORG;
  const githubEnt = process.env.NUXT_PUBLIC_GITHUB_ENT;
  const daysBack = parseInt(process.env.SYNC_DAYS_BACK || '28', 10);
  const syncSince = process.env.SYNC_SINCE?.trim();
  const syncUntil = process.env.SYNC_UNTIL?.trim();
  const useRange = Boolean(syncSince && syncUntil);

  const identifier = githubOrg || githubEnt || '';
  if (!identifier) {
    logger.error('NUXT_PUBLIC_GITHUB_ORG or NUXT_PUBLIC_GITHUB_ENT must be set');
    process.exit(1);
    return; // guard: allows tests to mock process.exit without continuing
  }

  if (useRange) {
    if (!ISO_DAY.test(syncSince!) || !ISO_DAY.test(syncUntil!)) {
      logger.error('SYNC_SINCE and SYNC_UNTIL must be YYYY-MM-DD');
      process.exit(1);
      return;
    }
    if (syncSince! > syncUntil!) {
      logger.error(`SYNC_SINCE (${syncSince}) must be on or before SYNC_UNTIL (${syncUntil})`);
      process.exit(1);
      return;
    }
  }

  // Get authentication headers (supports both PAT and GitHub App)
  let headers: Headers;
  try {
    headers = await getSyncAuthHeaders(logger, identifier);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
    return; // guard: allows tests to mock process.exit without continuing
  }

  try {
    // Initialize database schema
    logger.info('Initializing database schema...');
    await initSchema();

    logger.info(`Starting sync for ${scope}:${identifier}`);

    if (useRange) {
      logger.info(`Syncing range ${syncSince} → ${syncUntil} (bulk for recent days, 1-day API for older)`);
      const results = await syncMetricsForDateRange(
        scope,
        identifier,
        syncSince!,
        syncUntil!,
        headers
      );
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      logger.info(`Sync completed: ${successCount} ok, ${failureCount} failed (${results.length} days)`);
      for (const r of results.filter(r => !r.success)) {
        logger.error(`  ${r.date}: ${r.error}`);
      }
    } else {
      logger.info(`Syncing last ${daysBack} day(s) via bulk download`);
      // Use bulk download — one API call for up to 28 days
      const result = await syncBulk(
        scope,
        identifier,
        headers,
        undefined,
        daysBack
      );

      logger.info(`Sync completed: ${result.savedDays} saved, ${result.skippedDays} skipped`);

      if (result.errors.length > 0) {
        logger.error('Some days failed:');
        result.errors.forEach(e => logger.error(`  ${e.date}: ${e.error}`));
      }
    }

    logger.info('Sync job completed successfully');

  } catch (error) {
    logger.error('Sync job failed:', error);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

// Run the sync only when executed as the main entry point (not when imported for testing).
// Using fileURLToPath(import.meta.url) is the standard ESM way to detect the main module —
// it works correctly with tsx (.ts), compiled output (.js), and bundled builds alike.
import { fileURLToPath } from 'node:url';
const _isMain = fileURLToPath(import.meta.url) === process.argv[1];
if (_isMain) {
  runSync();
}
