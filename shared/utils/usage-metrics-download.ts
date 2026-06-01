import type { UsageReportMeta } from '../types/copilot-usage';

export async function downloadNdjsonLines(downloadUrl: string): Promise<Record<string, unknown>[]> {
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download report: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

export async function fetchReportMeta(
  metaUrl: string,
  headers: HeadersInit
): Promise<UsageReportMeta | null> {
  const meta = await $fetch<UsageReportMeta | null>(metaUrl, { headers });
  return meta ?? null;
}

export async function downloadReportFromMeta(
  meta: UsageReportMeta | null | undefined,
  logger: Console
): Promise<Record<string, unknown>[]> {
  const downloadUrl = meta?.download_links?.[0];
  if (!meta) {
    logger.warn('Report metadata response was empty; skipping download.');
    return [];
  }
  if (!downloadUrl) {
    logger.warn('No download link in report metadata.');
    return [];
  }

  try {
    return await downloadNdjsonLines(downloadUrl);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('404')) {
      logger.warn('Signed report download missing or expired.');
      return [];
    }
    throw error;
  }
}
