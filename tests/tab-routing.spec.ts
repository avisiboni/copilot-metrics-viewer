import { describe, expect, it } from 'vitest'
import { resolveTabFromSlug, tabToSlug } from '../shared/utils/tab-routing'

describe('tab-routing', () => {
  const tabs = ['organization', 'usage & billing', 'copilot chat', 'seat analysis'] as const

  it('converts tab labels to URL slugs', () => {
    expect(tabToSlug('usage & billing')).toBe('usage-billing')
    expect(tabToSlug('copilot chat')).toBe('copilot-chat')
  })

  it('resolves slugs back to tab labels', () => {
    expect(resolveTabFromSlug('usage-billing', tabs)).toBe('usage & billing')
    expect(resolveTabFromSlug('unknown', tabs)).toBeNull()
  })
})
