import { describe, expect, it } from 'vitest'
import {
  aggregateSeatHistoryByMonth,
  aggregateSeatsAssignedByMonth,
  buildMonthlySeatInvoiceRows,
} from '../shared/utils/seats-monthly-aggregate'

describe('seats-monthly-aggregate', () => {
  it('picks the latest snapshot per month for historical totals', () => {
    const rows = aggregateSeatHistoryByMonth([
      { snapshot_date: '2026-03-10', total_seats: 30 },
      { snapshot_date: '2026-03-28', total_seats: 35 },
      { snapshot_date: '2026-04-05', total_seats: 38 },
    ])
    expect(rows).toEqual([
      { month: '2026-03', total_seats: 35, snapshot_date: '2026-03-28' },
      { month: '2026-04', total_seats: 38, snapshot_date: '2026-04-05' },
    ])
  })

  it('counts assignments per month from created_at', () => {
    const rows = aggregateSeatsAssignedByMonth([
      { created_at: '2026-01-15T10:00:00Z' },
      { created_at: '2026-03-02T10:00:00Z' },
      { created_at: '2026-03-20T10:00:00Z' },
    ])
    expect(rows).toEqual([
      { month: '2026-01', total_seats: 1 },
      { month: '2026-03', total_seats: 2 },
    ])
  })

  it('builds invoice rows from assignment months (new + existing + cumulative total)', () => {
    const invoice = buildMonthlySeatInvoiceRows(
      [
        { month: '2026-01', total_seats: 18 },
        { month: '2026-02', total_seats: 2 },
        { month: '2026-05', total_seats: 8 },
      ],
      'assignments'
    )
    expect(invoice).toEqual([
      { month: '2026-01', new_seats: 18, existing_seats: 0, total_seats: 18 },
      { month: '2026-02', new_seats: 2, existing_seats: 18, total_seats: 20 },
      { month: '2026-05', new_seats: 8, existing_seats: 20, total_seats: 28 },
    ])
  })

  it('builds invoice rows from historical month-end totals', () => {
    const invoice = buildMonthlySeatInvoiceRows(
      [
        { month: '2026-03', total_seats: 30, snapshot_date: '2026-03-31' },
        { month: '2026-04', total_seats: 35, snapshot_date: '2026-04-30' },
      ],
      'historical'
    )
    expect(invoice).toEqual([
      {
        month: '2026-03',
        new_seats: 30,
        existing_seats: 0,
        total_seats: 30,
        snapshot_date: '2026-03-31',
      },
      {
        month: '2026-04',
        new_seats: 5,
        existing_seats: 30,
        total_seats: 35,
        snapshot_date: '2026-04-30',
      },
    ])
  })
})
