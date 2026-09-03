import type { H3Event, EventHandlerRequest } from 'h3'
import { currentUtcMonthRange } from '../../shared/utils/premium-credits'
import { fetchOrganizationBilling } from '../../shared/utils/billing-api'

function utcMonthRangeForDay(day: string): { since: string; until: string; label: string } {
  // `day` is YYYY-MM-DD; treat it as midnight UTC to derive the month window.
  const d = new Date(`${day}T00:00:00.000Z`)
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth()
  const start = new Date(Date.UTC(year, month, 1))
  const end = new Date(Date.UTC(year, month + 1, 0))
  const fmt = (x: Date) => x.toISOString().slice(0, 10)
  const monthName = start.toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  })
  return { since: fmt(start), until: fmt(end), label: monthName }
}

export default defineEventHandler(async (event: H3Event<EventHandlerRequest>) => {
  const query = getQuery(event)
  const config = useRuntimeConfig(event)
  const logger = console

  if (!event.context.headers || !event.context.headers.has('Authorization')) {
    return new Response('No Authentication provided', { status: 401 })
  }

  const org = config.public.githubOrg
  const ent = config.public.githubEnt
  if (!org) {
    return new Response('GitHub organization is not configured for billing status.', { status: 422 })
  }

  const day = typeof query.day === 'string' ? query.day.trim() : undefined
  const sinceFromQuery = typeof query.since === 'string' ? query.since.trim() : ''
  const untilFromQuery = typeof query.until === 'string' ? query.until.trim() : ''

  const window =
    day
      ? utcMonthRangeForDay(day)
      : sinceFromQuery && untilFromQuery
        ? { since: sinceFromQuery, until: untilFromQuery, label: `${sinceFromQuery} → ${untilFromQuery}` }
        : currentUtcMonthRange()

  const billing = await fetchOrganizationBilling(org, event.context.headers, window.since, window.until, logger, {
    enterprise: ent || undefined
  })

  return {
    since: window.since,
    until: window.until,
    label: window.label,
    billing
  }
})

