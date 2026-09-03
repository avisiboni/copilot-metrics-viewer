/** Ghost-completion lines inspired by Copilot inline suggestions (generic metrics code). */
export const COPILOT_GHOST_SNIPPETS: readonly string[] = [
  'export async function fetchCopilotMetrics(org: string) {',
  '  return await octokit.copilot.getCopilotMetrics({ org });',
  'const acceptanceRate = accepted / suggested * 100;',
  'const topUsers = pickTopUsersByCopilotQuality(rows);',
  'if (!metrics?.length) return rollingWindow28Days();',
  'usagePattern: refinePatternForActivityVolume(row),',
  'await syncHistoricalMetrics({ since: fromDate });',
  'const cohort = adoptionByPhase.find((p) => p.id === phaseId);',
  '// Copilot: guard empty billing window',
  'premiumCredits.enabled && hasBillingScope(token)',
];

export const COPILOT_GHOST_HINTS = {
  tab: 'Tab',
  accept: 'to accept',
  alt: '⌥] next suggestion',
} as const;
