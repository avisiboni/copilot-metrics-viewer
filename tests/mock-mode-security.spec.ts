import { afterEach, describe, expect, test } from 'vitest'
import {
  isMockQueryAllowed,
  shouldUseMockData,
} from '../shared/utils/mock-mode'

describe('mock-mode security', () => {
  afterEach(() => {
    delete process.env.NUXT_MOCK_QUERY_DEV_OVERRIDE
  })

  test('production config rejects ?mock=true when public mock is off', () => {
    process.env.NUXT_MOCK_QUERY_DEV_OVERRIDE = 'false'
    const config = { isDataMocked: false }
    expect(shouldUseMockData(config, { mock: 'true' })).toBe(false)
    expect(isMockQueryAllowed(config)).toBe(false)
  })

  test('configured mock mode allows data without query', () => {
    process.env.NUXT_MOCK_QUERY_DEV_OVERRIDE = 'false'
    expect(shouldUseMockData({ isDataMocked: true })).toBe(true)
    expect(shouldUseMockData({ isDataMocked: true }, { mock: 'false' })).toBe(true)
  })

  test('development allows ?mock=true when public mock is off', () => {
    process.env.NUXT_MOCK_QUERY_DEV_OVERRIDE = 'true'
    const config = { isDataMocked: false }
    expect(shouldUseMockData(config, { mock: 'true' })).toBe(true)
    expect(isMockQueryAllowed(config)).toBe(true)
  })
})
