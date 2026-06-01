/** URL slug for a dashboard tab label (e.g. "usage & billing" → "usage-billing"). */
export function tabToSlug(tab: string): string {
  return tab
    .toLowerCase()
    .trim()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/** Resolve slug from ?tab= query back to a tab label. */
export function resolveTabFromSlug(
  slug: string | undefined | null,
  validTabs: readonly string[]
): string | null {
  if (!slug || typeof slug !== 'string') return null
  const normalized = slug.toLowerCase().trim()
  return validTabs.find((tab) => tabToSlug(tab) === normalized) ?? null
}
