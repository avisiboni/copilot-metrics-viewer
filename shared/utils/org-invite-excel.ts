/** Case-insensitive exact header match for the required email column. */
export const EMAIL_COLUMN_NAME = 'email'

export type OrgInviteExcelErrorCode =
  | 'empty_file'
  | 'missing_email_column'
  | 'no_emails'
  | 'invalid_rows'

export interface OrgInviteExcelParseResult {
  emails: string[]
  /** 1-based Excel row numbers that had a non-empty but invalid email */
  invalidRows: number[]
  emailColumnIndex: number
  sheetName: string
  error?: OrgInviteExcelErrorCode
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

export function isValidInviteEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export function findEmailColumnIndex(headers: unknown[]): number {
  return headers.findIndex(
    (h) => String(h ?? '').trim().toLowerCase() === EMAIL_COLUMN_NAME
  )
}

/**
 * Parse invite emails from a sheet matrix (first row = headers).
 * Requires a column named `email` (case-insensitive), matching workshop Excel exports.
 */
export function parseInviteEmailsFromRows(
  rows: unknown[][],
  sheetName = 'Sheet1'
): OrgInviteExcelParseResult {
  if (!rows.length) {
    return {
      emails: [],
      invalidRows: [],
      emailColumnIndex: -1,
      sheetName,
      error: 'empty_file',
    }
  }

  const headers = rows[0] ?? []
  const emailColumnIndex = findEmailColumnIndex(headers)
  if (emailColumnIndex < 0) {
    return {
      emails: [],
      invalidRows: [],
      emailColumnIndex: -1,
      sheetName,
      error: 'missing_email_column',
    }
  }

  const seen = new Set<string>()
  const emails: string[] = []
  const invalidRows: number[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] ?? []
    const raw = String(row[emailColumnIndex] ?? '').trim()
    if (!raw) continue
    if (!isValidInviteEmail(raw)) {
      invalidRows.push(i + 1) // 1-based Excel row
      continue
    }
    const normalized = raw.toLowerCase()
    if (seen.has(normalized)) continue
    seen.add(normalized)
    emails.push(raw)
  }

  if (emails.length === 0) {
    return {
      emails: [],
      invalidRows,
      emailColumnIndex,
      sheetName,
      error: invalidRows.length ? 'invalid_rows' : 'no_emails',
    }
  }

  return { emails, invalidRows, emailColumnIndex, sheetName }
}

/** Parse first worksheet of an .xlsx / .xls ArrayBuffer (loads SheetJS on demand). */
export async function parseInviteEmailsFromWorkbook(
  data: ArrayBuffer
): Promise<OrgInviteExcelParseResult> {
  if (!data || data.byteLength === 0) {
    return {
      emails: [],
      invalidRows: [],
      emailColumnIndex: -1,
      sheetName: '',
      error: 'empty_file',
    }
  }

  const XLSX = await import('xlsx')
  const workbook = XLSX.read(data, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return {
      emails: [],
      invalidRows: [],
      emailColumnIndex: -1,
      sheetName: '',
      error: 'empty_file',
    }
  }

  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    return {
      emails: [],
      invalidRows: [],
      emailColumnIndex: -1,
      sheetName,
      error: 'empty_file',
    }
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,
  }) as unknown[][]

  return parseInviteEmailsFromRows(rows, sheetName)
}

/** Build a minimal .xlsx template with an Email column (for download). */
export async function buildInviteEmailTemplateWorkbook(): Promise<ArrayBuffer> {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.aoa_to_sheet([
    ['Email'],
    ['user@example.com'],
  ])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Invites')
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}
