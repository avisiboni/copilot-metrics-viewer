import { isEnvTruthy, isMockQueryParam } from './env-boolean'

type MockQuery = { mock?: unknown; isDataMocked?: unknown }

/** Mock data enabled in `.env` via NUXT_PUBLIC_IS_DATA_MOCKED (build-time / server env). */
export function isEnvMockModeConfigured(): boolean {
  return isEnvTruthy(process.env.NUXT_PUBLIC_IS_DATA_MOCKED)
}

/**
 * @deprecated Prefer {@link isEnvMockModeConfigured} for global mock — `config.public.isDataMocked`
 * may be toggled at runtime from `?mock=` in development and must not be treated as env config.
 */
export function isMockModeConfigured(configPublic: { isDataMocked?: boolean }): boolean {
  return isEnvMockModeConfigured() || isEnvTruthy(configPublic.isDataMocked)
}

/**
 * Local development may opt in with ?mock=true when public mock mode is off.
 * NUXT_MOCK_QUERY_DEV_OVERRIDE=true|false forces behaviour in tests.
 */
export function isDevelopmentRuntime(): boolean {
  const override = process.env.NUXT_MOCK_QUERY_DEV_OVERRIDE
  if (override === 'true') return true
  if (override === 'false') return false
  return import.meta.dev === true
}

/** Whether mock query parameters are permitted for this deployment. */
export function isMockQueryAllowed(_configPublic?: { isDataMocked?: boolean }): boolean {
  return isEnvMockModeConfigured() || isDevelopmentRuntime()
}

export function isMockRequestedInQuery(query: MockQuery): boolean {
  return isMockQueryParam(query.mock) || isEnvTruthy(query.isDataMocked)
}

/**
 * Use mock data / mock-token auth only when mock is configured globally or explicitly
 * requested in development. Prevents ?mock=true auth bypass in production.
 */
export function shouldUseMockData(
  _configPublic?: { isDataMocked?: boolean },
  query?: MockQuery
): boolean {
  if (isEnvMockModeConfigured()) {
    return true
  }
  if (!query) {
    return false
  }
  return isMockQueryAllowed() && isMockRequestedInQuery(query)
}
