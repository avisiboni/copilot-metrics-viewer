import { describe, expect, test, vi } from 'vitest'
import { downloadReportFromMeta } from '../shared/utils/usage-metrics-download'

describe('downloadReportFromMeta', () => {
  test('returns empty array when metadata is missing', async () => {
    const logger = { warn: vi.fn() } as unknown as Console
    const lines = await downloadReportFromMeta(undefined, logger)
    expect(lines).toEqual([])
    expect(logger.warn).toHaveBeenCalled()
  })

  test('returns empty array when download_links is absent', async () => {
    const logger = { warn: vi.fn() } as unknown as Console
    const lines = await downloadReportFromMeta({}, logger)
    expect(lines).toEqual([])
  })
})
