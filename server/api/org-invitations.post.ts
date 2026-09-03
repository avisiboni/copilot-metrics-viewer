/**
 * POST /api/org-invitations
 *
 * Invite one or more users to a GitHub organization by email.
 * Requires an org owner / admin:org token.
 *
 * Body: { org: string, emails: string[], role?: 'direct_member' | 'admin' | 'billing_manager' | 'reinstate_member' }
 */
import type { H3Event, EventHandlerRequest } from 'h3'
import { isValidInviteEmail } from '../../shared/utils/org-invite-excel'
import type {
  OrgInviteRole,
  OrgInviteResultItem,
  OrgInvitationsResponse,
} from '../../shared/types/org-invitations'

export type { OrgInviteRole, OrgInviteResultItem, OrgInvitationsResponse }

const MAX_EMAILS = 200
const INVITE_ROLES = new Set([
  'direct_member',
  'admin',
  'billing_manager',
  'reinstate_member',
])

function authHeaderFromEvent(event: H3Event): string | null {
  if (!(event.context.headers instanceof Headers)) return null
  return event.context.headers.get('Authorization')
}

function tokenKind(authorization: string | null): string {
  if (!authorization) return 'none'
  const raw = authorization.replace(/^Bearer\s+/i, '')
  if (raw.startsWith('ghp_')) return 'pat_classic'
  if (raw.startsWith('github_pat_')) return 'pat_fine_grained'
  if (raw.startsWith('gho_')) return 'oauth'
  if (raw.startsWith('ghs_')) return 'app_installation'
  if (/^[a-f0-9]{40}$/i.test(raw)) return 'pat_classic_hex'
  return `unknown(len=${raw.length})`
}

function formatGitHubError(status: number, data: unknown): string {
  if (!data || typeof data !== 'object') {
    return `HTTP ${status}`
  }
  const d = data as {
    message?: string
    errors?: Array<{ message?: string; code?: string; field?: string }>
    documentation_url?: string
  }
  const parts: string[] = []
  if (d.message) parts.push(d.message)
  if (Array.isArray(d.errors) && d.errors.length) {
    for (const err of d.errors) {
      const bit = [err.field, err.code, err.message].filter(Boolean).join(': ')
      if (bit) parts.push(bit)
    }
  }
  return parts.join(' — ') || `HTTP ${status}`
}

async function inviteOne(
  apiBaseUrl: string,
  authorization: string,
  org: string,
  email: string,
  role: OrgInviteRole,
  log: (line: string) => void
): Promise<OrgInviteResultItem> {
  const url = `${apiBaseUrl}/orgs/${encodeURIComponent(org)}/invitations`
  const body = JSON.stringify({ email, role })
  log(`→ POST ${url} email=${email} role=${role}`)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: authorization,
        'Content-Type': 'application/json',
        'User-Agent': 'copilot-metrics-viewer',
      },
      body,
    })

    const text = await res.text()
    let data: unknown = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text.slice(0, 300) }
      }
    }

    if (!res.ok) {
      const message = formatGitHubError(res.status, data)
      log(`← ${res.status} FAIL ${email}: ${message}`)
      return {
        email,
        success: false,
        status: res.status,
        message,
        errors: (data as { errors?: unknown })?.errors,
      }
    }

    const parsed = data as { id?: number } | null
    log(`← ${res.status} OK ${email} invitationId=${parsed?.id ?? '?'}`)
    return {
      email,
      success: true,
      status: res.status,
      invitationId: parsed?.id,
      message: 'Invitation created',
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    log(`← network error ${email}: ${message}`)
    return { email, success: false, status: 0, message }
  }
}

export default defineEventHandler(
  async (event: H3Event<EventHandlerRequest>): Promise<OrgInvitationsResponse> => {
    const logger = console
    const config = useRuntimeConfig(event)
    const apiBaseUrl = config.githubApiBaseUrl || 'https://api.github.com'
    const logs: string[] = []
    const log = (line: string) => {
      logs.push(line)
      logger.info(`[org-invitations] ${line}`)
    }

    const body = await readBody<{
      org?: string
      emails?: string[]
      role?: string
      isDataMocked?: boolean
    }>(event)

    const org = String(body?.org || config.public.githubOrg || '').trim()
    if (!org) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Organization slug is required (body.org)',
      })
    }

    const roleRaw = String(body?.role || 'direct_member').trim()
    if (!INVITE_ROLES.has(roleRaw)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid role. Allowed: ${[...INVITE_ROLES].join(', ')}`,
      })
    }
    const role = roleRaw as OrgInviteRole

    const rawEmails = Array.isArray(body?.emails) ? body.emails : []
    const emails: string[] = []
    const seen = new Set<string>()
    for (const item of rawEmails) {
      if (typeof item !== 'string') continue
      const email = item.trim()
      if (!email || !isValidInviteEmail(email)) continue
      const key = email.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      emails.push(email)
    }

    if (emails.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'emails must contain at least one valid email address',
      })
    }

    if (emails.length > MAX_EMAILS) {
      throw createError({
        statusCode: 400,
        statusMessage: `Maximum ${MAX_EMAILS} emails per request`,
      })
    }

    const mocked =
      body?.isDataMocked === true ||
      config.public.isDataMocked === true ||
      String(config.public.isDataMocked).toLowerCase() === 'true'

    log(
      `start org=${org} role=${role} count=${emails.length} mocked=${mocked} token=${tokenKind(authHeaderFromEvent(event))}`
    )

    if (mocked) {
      const results: OrgInviteResultItem[] = emails.map((email, i) => ({
        email,
        success: true,
        status: 201,
        invitationId: 1000 + i,
        message: 'Invitation created (mock)',
      }))
      log(`mock complete invited=${results.length}`)
      return {
        org,
        role,
        invited: results.length,
        failed: 0,
        results,
        logs,
      }
    }

    const authorization = authHeaderFromEvent(event)
    if (!authorization) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No Authentication provided',
      })
    }

    const results: OrgInviteResultItem[] = []

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i]!
      log(`progress ${i + 1}/${emails.length}`)
      const result = await inviteOne(apiBaseUrl, authorization, org, email, role, log)
      results.push(result)
      if (emails.length > 1 && i < emails.length - 1) {
        await new Promise((r) => setTimeout(r, 150))
      }
    }

    const invited = results.filter((r) => r.success).length
    const failed = results.length - invited
    log(`done invited=${invited} failed=${failed}`)

    return { org, role, invited, failed, results, logs }
  }
)
