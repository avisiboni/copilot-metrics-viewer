import { describe, expect, test } from 'vitest'
import {
  COPILOT_USAGE_METRICS_API_VERSION,
  withCopilotMetricsApiHeaders
} from '../shared/utils/github-api-headers'

describe('github-api-headers', () => {
  test('sets Copilot usage metrics API version', () => {
    const headers = withCopilotMetricsApiHeaders({
      Authorization: 'Bearer test',
      Accept: 'application/vnd.github+json'
    })
    expect(headers.get('X-GitHub-Api-Version')).toBe(COPILOT_USAGE_METRICS_API_VERSION)
    expect(headers.get('Authorization')).toBe('Bearer test')
  })
})
