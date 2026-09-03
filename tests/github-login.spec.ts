import { describe, expect, test } from 'vitest'
import { filterValidGitHubLogins, isValidGitHubLogin } from '../shared/utils/github-login'

describe('github-login validation', () => {
  test('accepts valid logins', () => {
    expect(isValidGitHubLogin('octocat')).toBe(true)
    expect(isValidGitHubLogin('my-org-user')).toBe(true)
  })

  test('rejects invalid logins', () => {
    expect(isValidGitHubLogin('')).toBe(false)
    expect(isValidGitHubLogin('-bad')).toBe(false)
    expect(isValidGitHubLogin('a'.repeat(40))).toBe(false)
    expect(isValidGitHubLogin('../../etc/passwd')).toBe(false)
    expect(isValidGitHubLogin('<script>')).toBe(false)
  })

  test('filterValidGitHubLogins drops invalid entries', () => {
    expect(filterValidGitHubLogins(['octocat', '', '-x', 'valid-user'])).toEqual([
      'octocat',
      'valid-user',
    ])
  })
})
