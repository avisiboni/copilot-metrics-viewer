import type { H3Event, EventHandlerRequest } from 'h3'
import type { UserAiCredits } from '../../shared/types/copilot-usage'
import { fetchAiCreditsForLogins } from '../../shared/utils/fetch-ai-credits-batch'
import { currentUtcMonthRange } from '../../shared/utils/premium-credits'
import { AI_CREDITS_CACHE_TTL_MS } from '../../shared/utils/ai-credits-constants'
import { isAiCreditsFetchEnabled } from '../../shared/utils/ai-credits-feature'
import { filterValidGitHubLogins } from '../../shared/utils/github-login'

function billingWindowFromBody(body: {
  since?: string
  until?: string
  day?: string
}): { since: string; until: string } {
  const day = body.day?.trim()
  if (day) {
    const d = new Date(`${day}T00:00:00.000Z`)
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth()
    const start = new Date(Date.UTC(year, month, 1))
    const end = new Date(Date.UTC(year, month + 1, 0))
    const fmt = (x: Date) => x.toISOString().slice(0, 10)
    return { since: fmt(start), until: fmt(end) }
  }
  const since = body.since?.trim() || ''
  const until = body.until?.trim() || ''
  if (since && until) {
    return { since, until }
  }
  return currentUtcMonthRange()
}

export default defineEventHandler(async (event: H3Event<EventHandlerRequest>) => {
  const logger = console
  const config = useRuntimeConfig(event)

  if (!event.context.headers?.has('Authorization')) {
    return new Response('No Authentication provided', { status: 401 })
  }

  const org = config.public.githubOrg
  if (!org) {
    return new Response('GitHub organization is not configured.', { status: 422 })
  }

  const body = await readBody<{
    logins?: string[]
    since?: string
    until?: string
    day?: string
  }>(event)

  const logins = Array.isArray(body?.logins)
    ? filterValidGitHubLogins(body.logins.filter((l): l is string => typeof l === 'string'))
    : []

  if (logins.length === 0) {
    return new Response('logins array must contain valid GitHub usernames', { status: 400 })
  }

  if (logins.length > 10) {
    return new Response('Maximum 10 logins per request', { status: 400 })
  }

  const { since, until } = billingWindowFromBody(body || {})
  const enterprise = config.public.githubEnt

  if (!isAiCreditsFetchEnabled(config.public)) {
    return {
      since,
      until,
      cacheTtlMinutes: AI_CREDITS_CACHE_TTL_MS / 60_000,
      billingAvailable: false,
      fetchDisabled: true,
      orgUserFilterBlocked: false,
      fromCache: [],
      credits: {} as Record<string, UserAiCredits>
    }
  }

  const result = await fetchAiCreditsForLogins({
    logins,
    org,
    enterprise,
    since,
    until,
    headers: event.context.headers,
    logger
  })

  return {
    since,
    until,
    cacheTtlMinutes: AI_CREDITS_CACHE_TTL_MS / 60_000,
    billingAvailable: result.billingAvailable,
    orgUserFilterBlocked: result.orgUserFilterBlocked,
    fromCache: result.fromCache,
    credits: result.credits as Record<string, UserAiCredits>
  }
})
