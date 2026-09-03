import type { Seat } from '../../app/model/Seat'

export interface SeatAnalyticsExportLabels {
  serial: string
  login: string
  email: string
  name: string
  githubId: string
  team: string
  assignedAt: string
  planType: string
  lastActivityAt: string
  lastActivityEditor: string
}

export const DEFAULT_SEAT_ANALYTICS_EXPORT_LABELS: SeatAnalyticsExportLabels = {
  serial: 'S.No',
  login: 'Login',
  email: 'Email',
  name: 'Name',
  githubId: 'GitHub ID',
  team: 'Assigning team',
  assignedAt: 'Assigned time',
  planType: 'Plan',
  lastActivityAt: 'Last activity at',
  lastActivityEditor: 'Last activity editor',
}

export interface SeatAnalyticsExportOptions {
  labels?: Partial<SeatAnalyticsExportLabels>
  sheetName?: string
  filterLabel?: string | null
}

export function buildSeatAnalyticsExportRows(
  seats: Seat[],
  options: SeatAnalyticsExportOptions = {}
): (string | number)[][] {
  const labels: SeatAnalyticsExportLabels = {
    ...DEFAULT_SEAT_ANALYTICS_EXPORT_LABELS,
    ...options.labels,
  }

  const rows: (string | number)[][] = [[
    labels.serial,
    labels.login,
    labels.email,
    labels.name,
    labels.githubId,
    labels.team,
    labels.assignedAt,
    labels.planType,
    labels.lastActivityAt,
    labels.lastActivityEditor,
  ]]

  seats.forEach((seat, index) => {
    rows.push([
      index + 1,
      seat.login || '',
      seat.email || '',
      seat.name || '',
      seat.id ?? '',
      seat.team || '',
      seat.created_at || '',
      seat.plan_type || '',
      seat.last_activity_at || '',
      seat.last_activity_editor || '',
    ])
  })

  return rows
}

export function buildSeatAnalyticsFilename(filterLabel?: string | null): string {
  const stamp = new Date().toISOString().slice(0, 10)
  const filterPart = (filterLabel || '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return filterPart
    ? `seat-analysis-${filterPart}-${stamp}.xlsx`
    : `seat-analysis-${stamp}.xlsx`
}

export async function buildSeatAnalyticsWorkbook(
  seats: Seat[],
  options: SeatAnalyticsExportOptions = {}
): Promise<ArrayBuffer> {
  const XLSX = await import('xlsx')
  const sheetName = (options.sheetName || 'Seats').slice(0, 31)
  const matrix = buildSeatAnalyticsExportRows(seats, options)
  const ws = XLSX.utils.aoa_to_sheet(matrix)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  if (options.filterLabel) {
    const meta = XLSX.utils.aoa_to_sheet([
      ['Filter', options.filterLabel],
      ['Exported at (UTC)', new Date().toISOString()],
      ['Seat count', seats.length],
    ])
    XLSX.utils.book_append_sheet(wb, meta, 'Export info')
  }

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

export async function downloadSeatAnalyticsExcel(
  seats: Seat[],
  options: SeatAnalyticsExportOptions = {}
): Promise<void> {
  const buf = await buildSeatAnalyticsWorkbook(seats, options)
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = buildSeatAnalyticsFilename(options.filterLabel)
  a.click()
  URL.revokeObjectURL(url)
}
