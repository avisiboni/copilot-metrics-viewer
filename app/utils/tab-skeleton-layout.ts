export type BrandPageSkeletonLayout =
  | 'metrics'
  | 'breakdown'
  | 'chat'
  | 'agent-mode'
  | 'users'
  | 'billing'
  | 'seats'
  | 'teams'
  | 'invite'
  | 'api'
  | 'default'

const METRICS_TABS = new Set(['organization', 'enterprise', 'team'])
const BREAKDOWN_TABS = new Set(['languages', 'editors'])

/** Map sidebar tab id to skeleton layout variant. */
export function tabToSkeletonLayout(tab: string | null | undefined): BrandPageSkeletonLayout {
  if (!tab) return 'metrics'

  if (METRICS_TABS.has(tab)) return 'metrics'
  if (BREAKDOWN_TABS.has(tab)) return 'breakdown'
  if (tab === 'copilot chat') return 'chat'
  if (tab === 'usage insights') return 'agent-mode'
  if (tab === 'users') return 'users'
  if (tab === 'usage & billing') return 'billing'
  if (tab === 'seat analysis') return 'seats'
  if (tab === 'teams') return 'teams'
  if (tab === 'invite members') return 'invite'
  if (tab === 'api response') return 'api'

  return 'default'
}

/** Tabs whose primary data comes from MainComponent metrics fetch. */
export function tabUsesMainMetricsLoading(tab: string | null | undefined): boolean {
  if (!tab) return true
  if (tab === 'seat analysis') return false
  if (tab === 'users' || tab === 'usage & billing' || tab === 'invite members') return false
  return true
}

export function tabUsesSeatsLoading(tab: string | null | undefined): boolean {
  return tab === 'seat analysis'
}
