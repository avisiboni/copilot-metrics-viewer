import type { BillingUsageLineItem, PremiumRequestUsageItem } from '../types/billing-usage'
import { usageNumber } from '../types/copilot-usage'

/** Normalize SKU strings from REST (`Copilot Premium Request`) and CSV (`copilot_premium_request`). */
export function normalizeBillingSku(sku: string | undefined): string {
  return String(sku || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

export function isPremiumRequestSku(sku: string | undefined): boolean {
  const n = normalizeBillingSku(sku)
  return n === 'copilot_premium_request' || n === 'premium_request'
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
