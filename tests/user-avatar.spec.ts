import { describe, expect, test } from 'vitest'
import {
  avatarColorsFromSeed,
  hashString,
  userInitials,
  userInitialsFromLogin,
} from '../shared/utils/user-avatar'

describe('user-avatar', () => {
  test('hashString is stable for the same input', () => {
    expect(hashString('hgmenor')).toBe(hashString('hgmenor'))
    expect(hashString('hgmenor')).not.toBe(hashString('edwardkes'))
  })

  test('avatarColorsFromSeed is deterministic', () => {
    const a = avatarColorsFromSeed('hgmenor')
    const b = avatarColorsFromSeed('hgmenor')
    expect(a).toEqual(b)
    expect(a.bg).toMatch(/^hsl\(/)
    expect(a.fg).toMatch(/^hsl\(/)
  })

  test('userInitialsFromLogin handles hyphenated logins', () => {
    expect(userInitialsFromLogin('yosef-albo')).toBe('YA')
    expect(userInitialsFromLogin('hgmenor')).toBe('HG')
  })

  test('userInitials prefers display name', () => {
    expect(userInitials('hgmenor', 'Harel G')).toBe('HG')
    expect(userInitials('hgmenor', 'Harel')).toBe('HA')
  })
})
