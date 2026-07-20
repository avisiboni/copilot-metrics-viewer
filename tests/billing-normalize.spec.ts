import { describe, expect, test } from 'vitest'
import {
  canonicalBillingSkuKey,
  displayBillingSkuLabel,
  isCopilotBillingSku,
  isGithubEnterpriseLicenseSku,
  isPremiumRequestSku,
  normalizeBillingSku,
  normalizeBillingUsageLineItem,
  normalizePremiumRequestUsageItem
} from '../shared/utils/billing-normalize'
import { aggregatePremiumCreditsByUser } from '../shared/utils/premium-credits'

describe('billing-normalize', () => {
  test('matches premium SKU from REST', () => {
    expect(isPremiumRequestSku('Copilot Premium Request')).toBe(true)
    expect(isPremiumRequestSku('copilot_premium_request')).toBe(true)
    expect(normalizeBillingSku('Copilot Enterprise')).toBe('copilot_enterprise')
    expect(canonicalBillingSkuKey('enterprise')).toBe('copilot_enterprise')
    expect(canonicalBillingSkuKey('Copilot Enterprise')).toBe('copilot_enterprise')
    expect(displayBillingSkuLabel('copilot_enterprise', 'enterprise')).toBe(
      'Copilot Enterprise'
    )
    expect(canonicalBillingSkuKey('premium request')).toBe('copilot_premium_request')
    expect(canonicalBillingSkuKey('Copilot Premium Request')).toBe('copilot_premium_request')
    expect(canonicalBillingSkuKey('ai unit')).toBe('copilot_ai_credits')
    expect(canonicalBillingSkuKey('Copilot AI Credits')).toBe('copilot_ai_credits')
    expect(canonicalBillingSkuKey('actions linux')).toBe('actions_linux')
    expect(canonicalBillingSkuKey('Actions Linux')).toBe('actions_linux')
    expect(normalizeBillingSku('actions-linux')).toBe('actions_linux')
    expect(canonicalBillingSkuKey('ghec_licenses')).toBe('ghec_licenses')
    expect(displayBillingSkuLabel('ghec_licenses')).toBe('GitHub Enterprise Cloud licenses')
  })

  test('separates GitHub Enterprise licenses from Copilot SKUs', () => {
    expect(isGithubEnterpriseLicenseSku('ghec_licenses', 'ghec')).toBe(true)
    expect(isGithubEnterpriseLicenseSku('GitHub Enterprise Cloud licenses', 'ghec')).toBe(true)
    expect(isGithubEnterpriseLicenseSku('Copilot Enterprise', 'copilot')).toBe(false)
    expect(isCopilotBillingSku('Copilot Enterprise', 'copilot')).toBe(true)
    expect(isCopilotBillingSku('Copilot Premium Request')).toBe(true)
    expect(isCopilotBillingSku('copilot ai unit')).toBe(true)
    expect(isCopilotBillingSku('Actions Linux', 'actions')).toBe(false)
    expect(isCopilotBillingSku('ghec_licenses', 'ghec')).toBe(false)
  })

  test('normalizes REST usage line with camelCase', () => {
    const item = normalizeBillingUsageLineItem({
      product: 'copilot',
      sku: 'Copilot Premium Request',
      quantity: 47,
      username: 'alice'
    })
    expect(item.sku).toBe('Copilot Premium Request')
    expect(isPremiumRequestSku(item.sku)).toBe(true)
    expect(item.username).toBe('alice')
  })

  test('aggregates from API-shaped premium items without username (org aggregate only)', () => {
    const map = aggregatePremiumCreditsByUser({
      available: true,
      detailedUsage: [],
      summaryUsage: [],
      premiumRequestUsage: [
        normalizePremiumRequestUsageItem({
          product: 'Copilot',
          sku: 'Copilot Premium Request',
          model: 'Claude Opus 4.7',
          grossQuantity: 100
        })
      ]
    })
    expect(map.size).toBe(0)
  })
})
