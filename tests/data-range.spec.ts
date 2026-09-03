/**
 * Tests for the /api/data-range endpoint.
 *
 * The endpoint reports the available data window in three modes:
 *   - mock: derived from the bundled mock JSON
 *   - historical: derived from MIN/MAX(metrics_date) in storage tables
 *   - live: rolling 28-day window ending yesterday
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Nitro global stubs ───────────────────────────────────────────────────────
;(globalThis as any).defineEventHandler = (h: any) => h
;(globalThis as any).createError = ({ statusCode, statusMessage }: { statusCode: number; statusMessage: string }) => {
  const err: any = new Error(statusMessage)
  err.statusCode = statusCode
  return err
}
let _query: Record<string, string> = {}
;(globalThis as any).getQuery = () => _query
function setQuery(q: Record<string, string>) { _query = q }

// ── Storage mock ─────────────────────────────────────────────────────────────
const mockPoolQuery = vi.fn()
vi.mock('../server/storage/db', () => ({
  getPool: () => ({ query: (...args: any[]) => mockPoolQuery(...args) }),
}))

/** Build an empty H3-style event (the handler does not read it directly). */
function makeEvent() {
  return { context: { headers: new Headers() }, node: { req: { url: '/api/data-range' } } }
}

const ORIG_HISTORICAL = process.env.ENABLE_HISTORICAL_MODE
const ORIG_MOCKED = process.env.NUXT_PUBLIC_IS_DATA_MOCKED
const ORIG_LOOKBACK = process.env.BILLING_LOOKBACK_MONTHS
const ORIG_DATABASE_URL = process.env.DATABASE_URL

describe('/api/data-range handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.ENABLE_HISTORICAL_MODE
    delete process.env.NUXT_PUBLIC_IS_DATA_MOCKED
    delete process.env.BILLING_LOOKBACK_MONTHS
    delete process.env.DATABASE_URL
    setQuery({ scope: 'organization', githubOrg: 'test-org' })
  })

  afterEach(() => {
    if (ORIG_HISTORICAL === undefined) delete process.env.ENABLE_HISTORICAL_MODE
    else process.env.ENABLE_HISTORICAL_MODE = ORIG_HISTORICAL
    if (ORIG_MOCKED === undefined) delete process.env.NUXT_PUBLIC_IS_DATA_MOCKED
    else process.env.NUXT_PUBLIC_IS_DATA_MOCKED = ORIG_MOCKED
    if (ORIG_LOOKBACK === undefined) delete process.env.BILLING_LOOKBACK_MONTHS
    else process.env.BILLING_LOOKBACK_MONTHS = ORIG_LOOKBACK
    if (ORIG_DATABASE_URL === undefined) delete process.env.DATABASE_URL
    else process.env.DATABASE_URL = ORIG_DATABASE_URL
  })

  it('mock mode: returns earliest/latest derived from bundled mock JSON', async () => {
    setQuery({ scope: 'organization', githubOrg: 'test-org', isDataMocked: 'true' })

    const { default: handler } = await import('../server/api/data-range')
    const result = await handler(makeEvent() as any)

    expect(result.mode).toBe('mock')
    expect(result.earliest).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result.latest).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result.earliest <= result.latest).toBe(true)
    // mock pool should never be queried in mock mode
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('live mode: skips DB when historical mode is off and DATABASE_URL is unset', async () => {
    const { default: handler } = await import('../server/api/data-range')
    const result = await handler(makeEvent() as any)

    expect(result.mode).toBe('live')
    expect(mockPoolQuery).not.toHaveBeenCalled()
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const earliest = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    expect(result.latest).toBe(yesterday)
    expect(result.earliest).toBe(earliest)
  })

  it('returns DB-derived range when DATABASE_URL is set and storage has data', async () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/copilot_metrics'
    mockPoolQuery.mockResolvedValue({
      rows: [{ earliest: '2026-01-15', latest: '2026-06-14' }],
    })

    const { default: handler } = await import('../server/api/data-range')
    const result = await handler(makeEvent() as any)

    expect(result.earliest).toBe('2026-01-15')
    expect(result.mode).toBe('historical')
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    expect(result.latest).toBe(yesterday > '2026-06-14' ? yesterday : '2026-06-14')
    delete process.env.DATABASE_URL
  })

  it('historical mode: returns DB-derived earliest/latest', async () => {
    process.env.ENABLE_HISTORICAL_MODE = 'true'
    mockPoolQuery.mockResolvedValue({
      rows: [{ earliest: '2026-01-15', latest: '2026-06-14' }],
    })

    const { default: handler } = await import('../server/api/data-range')
    const result = await handler(makeEvent() as any)

    expect(result.earliest).toBe('2026-01-15')
    expect(result.mode).toBe('historical')
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    expect(result.latest).toBe(yesterday > '2026-06-14' ? yesterday : '2026-06-14')
    expect(mockPoolQuery).toHaveBeenCalledTimes(1)
    // organization (not the team-* variant) is forwarded to the query
    const [, params] = mockPoolQuery.mock.calls[0]!
    expect(params).toEqual(['organization', 'test-org'])
  })

  it('historical mode: strips team- prefix to base scope', async () => {
    process.env.ENABLE_HISTORICAL_MODE = 'true'
    setQuery({ scope: 'team-organization', githubOrg: 'test-org', githubTeam: 'a-team' })
    mockPoolQuery.mockResolvedValue({
      rows: [{ earliest: '2026-01-15', latest: '2026-06-14' }],
    })

    const { default: handler } = await import('../server/api/data-range')
    await handler(makeEvent() as any)

    const [, params] = mockPoolQuery.mock.calls[0]!
    expect(params).toEqual(['organization', 'test-org'])
  })

  it('historical mode: falls back to live window when DB has no data', async () => {
    process.env.ENABLE_HISTORICAL_MODE = 'true'
    mockPoolQuery.mockResolvedValue({ rows: [{ earliest: null, latest: null }] })

    const { default: handler } = await import('../server/api/data-range')
    const result = await handler(makeEvent() as any)

    expect(result.mode).toBe('live')
    expect(result.earliest).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result.latest).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('historical mode: falls back to live window when the DB query throws', async () => {
    process.env.ENABLE_HISTORICAL_MODE = 'true'
    mockPoolQuery.mockRejectedValue(new Error('connection refused'))

    const { default: handler } = await import('../server/api/data-range')
    const result = await handler(makeEvent() as any)

    expect(result.mode).toBe('live')
  })

  it('extends earliest when BILLING_LOOKBACK_MONTHS is set', async () => {
    process.env.ENABLE_HISTORICAL_MODE = 'true'
    process.env.BILLING_LOOKBACK_MONTHS = '12'
    mockPoolQuery.mockResolvedValue({
      rows: [{ earliest: '2026-06-21', latest: '2026-07-18' }],
    })

    const { default: handler } = await import('../server/api/data-range')
    const result = await handler(makeEvent() as any)

    expect(result.mode).toBe('historical')
    // latest is extended to at least yesterday so the current month stays selectable
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    expect(result.latest).toBe(yesterday > '2026-07-18' ? yesterday : '2026-07-18')
    expect(result.earliest).toBe('2025-07-18')
  })

  it('extends latest to yesterday when DB sync lags behind', async () => {
    process.env.ENABLE_HISTORICAL_MODE = 'true'
    mockPoolQuery.mockResolvedValue({
      rows: [{ earliest: '2026-06-21', latest: '2026-08-20' }],
    })

    const { default: handler } = await import('../server/api/data-range')
    const result = await handler(makeEvent() as any)

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    expect(result.mode).toBe('historical')
    expect(result.latest).toBe(yesterday)
  })
})
