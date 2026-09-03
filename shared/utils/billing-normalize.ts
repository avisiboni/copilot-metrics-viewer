import type { BillingUsageLineItem, PremiumRequestUsageItem } from '../types/billing-usage'
import { usageNumber } from '../types/copilot-usage'

/** Normalize SKU strings from REST (`Copilot Premium Request`) and CSV (`copilot_premium_request`). */
export function normalizeBillingSku(sku: string | undefined): string {
  return String(sku || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * Short vs long SKU labels for the same charge (common in billing summary + line exports).
 * Keys are normalized via {@link normalizeBillingSku}.
 */
const CANONICAL_BILLING_SKU_KEYS: Record<string, string> = {
  enterprise: 'copilot_enterprise',
  copilot_enterprise: 'copilot_enterprise',
  premium_request: 'copilot_premium_request',
  copilot_premium_request: 'copilot_premium_request',
  ai_unit: 'copilot_ai_credits',
  copilot_ai_unit: 'copilot_ai_credits',
  copilot_ai_credits: 'copilot_ai_credits',
  copilot_for_business: 'copilot_for_business',
  copilot_standalone: 'copilot_standalone',
  actions_linux: 'actions_linux',
  github_actions_linux: 'actions_linux',
  ghec_licenses: 'ghec_licenses',
  github_enterprise_cloud_licenses: 'ghec_licenses',
  github_enterprise_licenses: 'ghec_licenses'
}

const BILLING_SKU_DISPLAY_LABELS: Record<string, string> = {
  copilot_enterprise: 'Copilot Enterprise',
  copilot_premium_request: 'Copilot Premium Request',
  copilot_ai_credits: 'Copilot AI Credits',
  copilot_for_business: 'Copilot for Business',
  copilot_standalone: 'Copilot Standalone',
  actions_linux: 'Actions Linux',
  ghec_licenses: 'GitHub Enterprise Cloud licenses'
}

/** Canonical key for SKU rollups across billing API naming variants. */
export function canonicalBillingSkuKey(sku: string | undefined): string {
  const normalized = normalizeBillingSku(sku)
  if (!normalized) return 'unknown'
  return CANONICAL_BILLING_SKU_KEYS[normalized] ?? normalized
}

/** Human-readable SKU label for tables. */
export function displayBillingSkuLabel(canonicalKey: string, _rawSku?: string): string {
  const label = BILLING_SKU_DISPLAY_LABELS[canonicalKey]
  if (label) return label
  return canonicalKey.replace(/_/g, ' ')
}

export function isPremiumRequestSku(sku: string | undefined): boolean {
  const n = normalizeBillingSku(sku)
  return n === 'copilot_premium_request' || n === 'premium_request'
}

export function isAiCreditsSku(sku: string | undefined): boolean {
  return canonicalBillingSkuKey(sku) === 'copilot_ai_credits'
}

/** GitHub Enterprise Cloud platform seats/licenses (not Copilot). */
export function isGithubEnterpriseLicenseSku(
  sku: string | undefined,
  product?: string
): boolean {
  const productKey = normalizeBillingSku(product)
  if (productKey === 'ghec') return true
  const key = canonicalBillingSkuKey(sku)
  return (
    key === 'ghec_licenses' ||
    key === 'ghec' ||
    key.includes('ghec_license') ||
    (key.includes('github_enterprise') && !key.includes('copilot'))
  )
}

/** Any Copilot product SKU (license seats, premium requests, AI credits, sandboxes, …). */
export function isCopilotBillingSku(sku: string | undefined, product?: string): boolean {
  if (isGithubEnterpriseLicenseSku(sku, product)) return false
  const productKey = normalizeBillingSku(product)
  if (productKey === 'copilot' || productKey === 'sandbox') return true
  const key = canonicalBillingSkuKey(sku)
  if (key.startsWith('copilot_') || key.startsWith('sandbox_')) return true
  const raw = normalizeBillingSku(sku)
  return raw.includes('copilot') || raw.includes('premium_request') || raw === 'ai_unit'
}

function pickString(raw: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = raw[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return undefined
}

function pickNumber(raw: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const v = raw[key]
    if (v === undefined || v === null) continue
    const n = Number(v)
    if (!Number.isNaN(n)) return n
  }
  return undefined
}

function pickBool(raw: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const v = raw[key]
    if (typeof v === 'boolean') return v
    if (typeof v === 'string') {
      const lower = v.toLowerCase()
      if (lower === 'true') return true
      if (lower === 'false') return false
    }
  }
  return undefined
}

/** Map a billing `/usage` line (camelCase from REST or snake_case from exports). */
export function normalizeBillingUsageLineItem(
  raw: Record<string, unknown>
): BillingUsageLineItem {
  const sku = pickString(raw, 'sku', 'SKU') || ''
  return {
    date: pickString(raw, 'date', 'Date'),
    product: pickString(raw, 'product', 'Product') || '',
    sku,
    quantity: pickNumber(raw, 'quantity', 'Quantity'),
    unitType: pickString(raw, 'unitType', 'unit_type', 'UnitType'),
    pricePerUnit: pickNumber(raw, 'pricePerUnit', 'price_per_unit', 'applied_cost_per_quantity'),
    grossAmount: pickNumber(raw, 'grossAmount', 'gross_amount'),
    discountAmount: pickNumber(raw, 'discountAmount', 'discount_amount'),
    netAmount: pickNumber(raw, 'netAmount', 'net_amount'),
    organizationName: pickString(raw, 'organizationName', 'organization', 'Organization'),
    repositoryName: pickString(raw, 'repositoryName', 'repository', 'Repository'),
    username: pickString(raw, 'username', 'userName', 'User', 'user_login'),
    model: pickString(raw, 'model', 'Model'),
    exceedsQuota: pickBool(raw, 'exceedsQuota', 'exceeds_quota'),
    totalMonthlyQuota: pickNumber(raw, 'totalMonthlyQuota', 'total_monthly_quota'),
    aicQuantity: pickNumber(raw, 'aicQuantity', 'aic_quantity'),
    aicGrossAmount: pickNumber(raw, 'aicGrossAmount', 'aic_gross_amount')
  }
}

/** Map a `premium_request/usage` item (camelCase REST or snake_case CSV). */
export function normalizePremiumRequestUsageItem(
  raw: Record<string, unknown>
): PremiumRequestUsageItem {
  const sku = pickString(raw, 'sku', 'SKU') || 'Copilot Premium Request'
  return {
    product: pickString(raw, 'product', 'Product') || 'Copilot',
    sku,
    model: pickString(raw, 'model', 'Model') || 'unknown',
    unitType: pickString(raw, 'unitType', 'unit_type', 'UnitType'),
    pricePerUnit: pickNumber(raw, 'pricePerUnit', 'price_per_unit', 'applied_cost_per_quantity'),
    grossQuantity: pickNumber(raw, 'grossQuantity', 'gross_quantity', 'quantity'),
    grossAmount: pickNumber(raw, 'grossAmount', 'gross_amount'),
    discountQuantity: pickNumber(raw, 'discountQuantity', 'discount_quantity'),
    discountAmount: pickNumber(raw, 'discountAmount', 'discount_amount'),
    netQuantity: pickNumber(raw, 'netQuantity', 'net_quantity'),
    netAmount: pickNumber(raw, 'netAmount', 'net_amount'),
    username: pickString(raw, 'username', 'userName', 'User'),
    date: pickString(raw, 'date', 'Date'),
    exceedsQuota: pickBool(raw, 'exceedsQuota', 'exceeds_quota'),
    totalMonthlyQuota: pickNumber(raw, 'totalMonthlyQuota', 'total_monthly_quota'),
    aicQuantity: pickNumber(raw, 'aicQuantity', 'aic_quantity'),
    aicGrossAmount: pickNumber(raw, 'aicGrossAmount', 'aic_gross_amount')
  }
}

export function premiumQuantityFromUsageLine(item: BillingUsageLineItem): number {
  return usageNumber(item.quantity)
}

export function premiumQuantityFromPremiumItem(item: PremiumRequestUsageItem): number {
  const net = item.netQuantity
  const gross = item.grossQuantity
  if (net !== undefined && net > 0) return usageNumber(net)
  return usageNumber(gross)
}
