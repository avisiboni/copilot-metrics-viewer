/** When false, skip GitHub Billing API calls for per-user premium credits (PRU). */
export function isPremiumCreditsFetchEnabled(
  publicConfig: { premiumCreditsFetchEnabled?: boolean }
): boolean {
  return publicConfig.premiumCreditsFetchEnabled !== false
}

/**
 * Temporary: leaderboard shows a disabled note instead of live PRU data
 * (Billing API blocked by deployment IP allowlist).
 */
export const PREMIUM_CREDITS_TABLE_DISABLED = true
