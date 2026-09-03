/** Daily seat snapshot summary (matches server/storage/seats-storage). */
export interface SeatHistorySnapshot {
  snapshot_date: string
  total_seats: number
  never_active?: number
  inactive_7d?: number
  inactive_30d?: number
}

export interface MonthlySeatCount {
  /** `YYYY-MM` */
  month: string
  total_seats: number
  /** Last daily snapshot used for this month (historical mode only). */
  snapshot_date?: string
}

/**
 * End-of-month seat totals from daily historical snapshots.
 * Uses the latest snapshot in each calendar month.
 */
export function aggregateSeatHistoryByMonth(
  entries: SeatHistorySnapshot[]
): MonthlySeatCount[] {
  const latestInMonth = new Map<string, SeatHistorySnapshot>()

  for (const entry of entries) {
    const month = entry.snapshot_date.slice(0, 7)
    const prev = latestInMonth.get(month)
    if (!prev || entry.snapshot_date > prev.snapshot_date) {
      latestInMonth.set(month, entry)
    }
  }

  return [...latestInMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, entry]) => ({
      month,
      total_seats: entry.total_seats,
      snapshot_date: entry.snapshot_date,
    }))
}

/**
 * Count new seat assignments per month from `created_at` on currently assigned seats.
 * Does not include seats removed before the snapshot.
 */
export function aggregateSeatsAssignedByMonth(
  seats: Array<{ created_at?: string | null }>
): MonthlySeatCount[] {
  const counts = new Map<string, number>()

  for (const seat of seats) {
    const raw = seat.created_at
    if (!raw) continue
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) continue
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    counts.set(month, (counts.get(month) || 0) + 1)
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total_seats]) => ({ month, total_seats }))
}

/** Invoice-style row: new assignments + seats already assigned (existing) = total for the month. */
export interface MonthlySeatInvoiceRow {
  month: string
  new_seats: number
  existing_seats: number
  total_seats: number
  snapshot_date?: string
}

/**
 * Split monthly counts into new vs existing for invoice reconciliation.
 * - Historical: `total_seats` is end-of-month assigned count; new = month-over-month delta.
 * - Assignments: each row's count is new that month; existing = running total before this month.
 */
export function buildMonthlySeatInvoiceRows(
  monthlyCounts: MonthlySeatCount[],
  mode: 'historical' | 'assignments'
): MonthlySeatInvoiceRow[] {
  if (monthlyCounts.length === 0) return []

  if (mode === 'assignments') {
    let cumulative = 0
    return monthlyCounts.map((row) => {
      const new_seats = row.total_seats
      const existing_seats = cumulative
      cumulative += new_seats
      return {
        month: row.month,
        new_seats,
        existing_seats,
        total_seats: cumulative,
        snapshot_date: row.snapshot_date,
      }
    })
  }

  return monthlyCounts.map((row, index) => {
    const prevTotal = index > 0 ? monthlyCounts[index - 1].total_seats : 0
    const total_seats = row.total_seats
    const new_seats = Math.max(0, total_seats - prevTotal)
    const existing_seats = total_seats - new_seats
    return {
      month: row.month,
      new_seats,
      existing_seats,
      total_seats,
      snapshot_date: row.snapshot_date,
    }
  })
}

export function formatSeatMonthLabel(monthKey: string, locale: string): string {
  const [year, month] = monthKey.split('-').map((part) => Number(part))
  if (!year || !month) return monthKey
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(
    new Date(year, month - 1, 1)
  )
}

/** Calendar months strictly between two `YYYY-MM` keys (exclusive of endpoints). */
export function calendarMonthsBetween(startMonth: string, endMonth: string): string[] {
  const [y1, m1] = startMonth.split('-').map((part) => Number(part))
  const [y2, m2] = endMonth.split('-').map((part) => Number(part))
  if (!y1 || !m1 || !y2 || !m2) return []
  const gaps: string[] = []
  let year = y1
  let month = m1
  while (true) {
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
    if (year === y2 && month === m2) break
    gaps.push(`${year}-${String(month).padStart(2, '0')}`)
  }
  return gaps
}

/**
 * Insert months with no new assignments so invoice rows include carry-forward totals
 * (e.g. March with 0 new but 20 seats still assigned).
 */
export function fillMonthlyCountGaps(monthlyCounts: MonthlySeatCount[]): MonthlySeatCount[] {
  if (monthlyCounts.length < 2) return [...monthlyCounts]
  const sorted = [...monthlyCounts].sort((a, b) => a.month.localeCompare(b.month))
  const out: MonthlySeatCount[] = []
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i])
    if (i >= sorted.length - 1) continue
    for (const gapMonth of calendarMonthsBetween(sorted[i].month, sorted[i + 1].month)) {
      out.push({ month: gapMonth, total_seats: 0 })
    }
  }
  return out
}

/** For historical snapshots: carry end-of-month seat count into gap months with no snapshot. */
export function fillMonthlyCountGapsHistorical(
  monthlyCounts: MonthlySeatCount[]
): MonthlySeatCount[] {
  const withGaps = fillMonthlyCountGaps(monthlyCounts)
  if (withGaps.length === 0) return []
  let lastTotal = 0
  return withGaps.map((row) => {
    if (row.total_seats === 0 && lastTotal > 0) {
      return { month: row.month, total_seats: lastTotal, snapshot_date: row.snapshot_date }
    }
    lastTotal = row.total_seats
    return row
  })
}

export interface MonthlySeatInvoiceRowWithCost extends MonthlySeatInvoiceRow {
  existing_cost: number
  new_cost: number
  monthly_cost: number
}

export function applyMonthlySeatUnitPrice(
  rows: MonthlySeatInvoiceRow[],
  unitPrice: number
): MonthlySeatInvoiceRowWithCost[] {
  const price = unitPrice > 0 ? unitPrice : 0
  return rows.map((row) => ({
    ...row,
    existing_cost: row.existing_seats * price,
    new_cost: row.new_seats * price,
    monthly_cost: row.total_seats * price
  }))
}
