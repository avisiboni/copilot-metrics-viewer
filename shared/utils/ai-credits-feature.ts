/** When false, skip GitHub Billing API calls for per-user AI credits. */
export function isAiCreditsFetchEnabled(
  publicConfig: { aiCreditsFetchEnabled?: boolean }
): boolean {
  return publicConfig.aiCreditsFetchEnabled !== false
}
