import { isEnvTruthy, isMockQueryParam } from './env-boolean'

type MockQuery = { mock?: unknown; isDataMocked?: unknown }

/** Mock data is enabled via NUXT_PUBLIC_IS_DATA_MOCKED (or equivalent runtime config). */
export function isMockModeConfigured(configPublic: { isDataMocked?: boolean }): boolean {
  return isEnvTruthy(configPublic.isDataMocked)
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
export function isMockQueryAllowed(configPublic: { isDataMocked?: boolean }): boolean {
  return isMockModeConfigured(configPublic) || isDevelopmentRuntime()
}

export function isMockRequestedInQuery(query: MockQuery): boolean {
  return isMockQueryParam(query.mock) || isEnvTruthy(query.isDataMocked)
}

/**
 * Use mock data / mock-token auth only when mock is configured globally or explicitly
 * requested in development. Prevents ?mock=true auth bypass in production.
 */
export function shouldUseMockData(
  configPublic: { isDataMocked?: boolean },
  query?: MockQuery
): boolean {
  if (isMockModeConfigured(configPublic)) {
    return true
  }
  if (!query) {
    return false
  }
  return isMockQueryAllowed(configPublic) && isMockRequestedInQuery(query)
}
