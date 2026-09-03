import { describe, expect, test } from 'vitest'
import { isEnvTruthy, isMockQueryParam } from '../shared/utils/env-boolean'

describe('env-boolean', () => {
  test('isEnvTruthy treats string false as false', () => {
    expect(isEnvTruthy('false')).toBe(false)
    expect(isEnvTruthy(false)).toBe(false)
    expect(isEnvTruthy('true')).toBe(true)
    expect(isEnvTruthy(true)).toBe(true)
    expect(isEnvTruthy(undefined)).toBe(false)
  })

  test('isMockQueryParam only enables explicit mock values', () => {
    expect(isMockQueryParam('true')).toBe(true)
    expect(isMockQueryParam('1')).toBe(true)
    expect(isMockQueryParam('false')).toBe(false)
    expect(isMockQueryParam(undefined)).toBe(false)
  })
})
