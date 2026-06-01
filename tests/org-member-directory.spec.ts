import { describe, expect, it } from 'vitest'
import {
  enrichWithOrgDirectory,
  formatUserLabel,
  pickEmail
} from '../shared/utils/org-member-directory'

describe('org-member-directory', () => {
  it('pickEmail ignores null and empty strings', () => {
    expect(pickEmail(null, '', '  ', 'a@b.com')).toBe('a@b.com')
    expect(pickEmail(null, undefined)).toBeNull()
  })

  it('enriches users from directory by login', () => {
    const directory = new Map([
      ['alice', { login: 'alice', userId: 1, name: 'Alice A', email: 'alice@example.com' }]
    ])

    const enriched = enrichWithOrgDirectory(
      [{ user_login: 'alice', user_id: 1 }],
      directory
    )

    expect(enriched[0].email).toBe('alice@example.com')
    expect(enriched[0].name).toBe('Alice A')
  })

  it('formats display labels', () => {
    expect(
      formatUserLabel({
        user_login: 'bob',
        name: 'Bob',
        email: 'bob@corp.com'
      })
    ).toBe('bob · Bob · <bob@corp.com>')
  })
})
