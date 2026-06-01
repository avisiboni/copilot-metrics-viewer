/** GitHub Billing Usage REST API (enhanced billing platform) */

export interface BillingTimePeriod {
  year: number
  month?: number
  day?: number
}

export interface BillingUsageLineItem {
  date?: string
  product: string
  sku: string
  quantity?: number
  unitType?: string
  pricePerUnit?: number
  grossAmount?: number
  discountAmount?: number
  netAmount?: number
  organizationName?: string
  repositoryName?: string
  username?: string
  model?: string
  exceedsQuota?: boolean
  totalMonthlyQuota?: number
  aicQuantity?: number
  aicGrossAmount?: number
}

export interface BillingSummaryItem {
  product: string
  sku: string
  unitType?: string
  pricePerUnit?: number
  grossQuantity?: number
  grossAmount?: number
  discountQuantity?: number
  discountAmount?: number
  netQuantity?: number
  netAmount?: number
}

export interface PremiumRequestUsageItem extends BillingSummaryItem {
  model: string
  username?: string
  date?: string
  exceedsQuota?: boolean
  totalMonthlyQuota?: number
  aicQuantity?: number
  aicGrossAmount?: number
}

export interface BillingUsageReportResponse {
  usageItems?: BillingUsageLineItem[]
}

export interface BillingSummaryResponse {
  timePeriod?: BillingTimePeriod
  organization?: string
  usageItems?: BillingSummaryItem[]
}

export interface PremiumRequestUsageResponse {
  timePeriod?: BillingTimePeriod
  organization?: string
  user?: string
  product?: string
  model?: string
  usageItems?: PremiumRequestUsageItem[]
}

export interface BillingFetchResult {
  available: boolean
  reason?: string
  /** Last HTTP status when billing was unavailable (e.g. 403, 404). */
  httpStatus?: number
  /** OAuth scopes from GitHub response headers, when present. */
  tokenScopes?: string
  endpointErrors?: string[]
  detailedUsage: BillingUsageLineItem[]
  summaryUsage: BillingSummaryItem[]
  premiumRequestUsage: PremiumRequestUsageItem[]
}
