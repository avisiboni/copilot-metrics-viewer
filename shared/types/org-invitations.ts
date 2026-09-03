export type OrgInviteRole =
  | 'direct_member'
  | 'admin'
  | 'billing_manager'
  | 'reinstate_member'

export interface OrgInviteResultItem {
  email: string
  success: boolean
  status?: number
  message?: string
  invitationId?: number
  /** GitHub error details when available */
  errors?: unknown
}

export interface OrgInvitationsResponse {
  org: string
  role: OrgInviteRole
  invited: number
  failed: number
  results: OrgInviteResultItem[]
  /** Server-side log lines for this request (also printed to console) */
  logs?: string[]
}
