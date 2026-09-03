import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import {
  findEmailColumnIndex,
  parseInviteEmailsFromRows,
  parseInviteEmailsFromWorkbook,
  isValidInviteEmail,
} from '../shared/utils/org-invite-excel'

function workbookBuffer(rows: unknown[][]): ArrayBuffer {
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Invites')
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

describe('org-invite-excel', () => {
  it('finds email column case-insensitively', () => {
    expect(findEmailColumnIndex(['Name', 'Email', 'IP'])).toBe(1)
    expect(findEmailColumnIndex(['email'])).toBe(0)
    expect(findEmailColumnIndex(['EMAIL'])).toBe(0)
    expect(findEmailColumnIndex(['שם', 'כתובת'])).toBe(-1)
  })

  it('rejects files without an email column', () => {
    const result = parseInviteEmailsFromRows([
      ['שם פרטי', 'שם משפחה', 'כתובת IP'],
      ['אריאל', 'כהן', '1.2.3.4'],
    ])
    expect(result.error).toBe('missing_email_column')
    expect(result.emails).toEqual([])
  })

  it('parses workshop-style Excel with Email column', () => {
    const result = parseInviteEmailsFromRows([
      ['שם תחום', 'שם פרטי', 'שם משפחה', 'Email', 'כתובת IP'],
      ['פלטפורמות', 'אריאל', 'כהן', 'arielc@menora.co.il', '172.22.47.239'],
      ['פלטפורמות', 'עלאא', 'עבדאללה', 'alaaab@menoramivt.co.il', '172.22.94.148'],
      ['פלטפורמות', 'דיפליקט', 'א', 'arielc@menora.co.il', ''],
      ['פלטפורמות', 'ריק', 'ב', '', ''],
      ['פלטפורמות', 'רע', 'ג', 'not-an-email', ''],
    ])
    expect(result.error).toBeUndefined()
    expect(result.emails).toEqual([
      'arielc@menora.co.il',
      'alaaab@menoramivt.co.il',
    ])
    expect(result.invalidRows).toEqual([6])
  })

  it('parses workbook ArrayBuffer', async () => {
    const buf = workbookBuffer([
      ['Email'],
      ['one@example.com'],
      ['TWO@Example.com'],
    ])
    const result = await parseInviteEmailsFromWorkbook(buf)
    expect(result.error).toBeUndefined()
    expect(result.emails).toEqual(['one@example.com', 'TWO@Example.com'])
  })

  it('validates emails', () => {
    expect(isValidInviteEmail('a@b.co')).toBe(true)
    expect(isValidInviteEmail('bad')).toBe(false)
  })
})
