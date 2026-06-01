import { describe, expect, test } from 'vitest'
import { assertGitHubApiUrl } from '../shared/utils/github-api-url'

describe('github-api-url', () => {
  test('allows api.github.com URLs', () => {
    expect(() =>
      assertGitHubApiUrl('https://api.github.com/orgs/foo/teams?per_page=100&page=2')
    ).not.toThrow()
  })

  test('blocks non-GitHub hosts (SSRF)', () => {
    expect(() => assertGitHubApiUrl('https://evil.example/steal')).toThrow()
    expect(() => assertGitHubApiUrl('http://api.github.com/orgs/foo')).toThrow()
    expect(() => assertGitHubApiUrl('not-a-url')).toThrow()
  })
})
