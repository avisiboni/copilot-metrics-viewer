export interface OrgMemberProfile {
  login: string
  userId: number
  name?: string | null
  email?: string | null
}

interface GitHubMemberUser {
  id: number
  login: string
  name?: string | null
  email?: string | null
}

/** Use email only when GitHub returns a non-empty value. */
export function pickEmail(...candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    const trimmed = (candidate || '').trim()
    if (trimmed) return trimmed
  }
  return null
}

function mergeProfile(
  map: Map<string, OrgMemberProfile>,
  profile: OrgMemberProfile
): void {
  const key = profile.login.toLowerCase()
  const existing = map.get(key)
  if (!existing) {
    map.set(key, {
      ...profile,
      name: pickEmail(profile.name) ?? null,
      email: pickEmail(profile.email)
    })
    return
  }
  const name = pickEmail(existing.name, profile.name)
  if (name) existing.name = name
  const email = pickEmail(existing.email, profile.email)
  if (email) existing.email = email
}

function getAuthHeader(headers: HeadersInit): string | null {
  if (headers instanceof Headers) {
    return headers.get('Authorization')
  }
  if (Array.isArray(headers)) {
    return headers.find(([k]) => k.toLowerCase() === 'authorization')?.[1] ?? null
  }
  return (headers as Record<string, string>).Authorization ?? null
}

export async function fetchOrgMemberDirectory(
  org: string,
  headers: HeadersInit,
  logger: Console
): Promise<Map<string, OrgMemberProfile>> {
  const map = new Map<string, OrgMemberProfile>()

  let page = 1
  while (true) {
    let members: GitHubMemberUser[]
    try {
      members = await $fetch<GitHubMemberUser[]>(
        `https://api.github.com/orgs/${encodeURIComponent(org)}/members`,
        { headers, params: { per_page: 100, page } }
      )
    } catch (error) {
      logger.warn('Could not list organization members:', error)
      break
    }

    if (!Array.isArray(members) || members.length === 0) break

    for (const member of members) {
      mergeProfile(map, {
        login: member.login,
        userId: member.id,
        name: member.name,
        email: member.email
      })
    }

    if (members.length < 100) break
    page += 1
  }

  try {
    const graphMembers = await fetchOrgMembersGraphQL(org, headers, logger)
    for (const profile of graphMembers) {
      mergeProfile(map, profile)
    }
  } catch (error) {
    logger.warn('GraphQL membersWithRole skipped:', error)
  }

  try {
    const samlMembers = await fetchSamlExternalIdentitiesGraphQL(org, headers, logger)
    for (const profile of samlMembers) {
      mergeProfile(map, profile)
    }
  } catch (error) {
    logger.warn('GraphQL SAML externalIdentities skipped:', error)
  }

  const withEmail = countDirectoryEmails(map)
  logger.info(
    `Org member directory for ${org}: ${map.size} members, ${withEmail} with email`
  )

  return map
}

export function countDirectoryEmails(directory: Map<string, OrgMemberProfile>): number {
  let count = 0
  for (const profile of directory.values()) {
    if (pickEmail(profile.email)) count += 1
  }
  return count
}

async function fetchOrgMembersGraphQL(
  org: string,
  headers: HeadersInit,
  logger: Console
): Promise<OrgMemberProfile[]> {
  const authHeader = getAuthHeader(headers)
  if (!authHeader) return []

  const profiles: OrgMemberProfile[] = []
  let cursor: string | null = null

  const query = `
    query OrgMembers($org: String!, $after: String) {
      organization(login: $org) {
        membersWithRole(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              databaseId
              login
              name
              email
            }
          }
        }
      }
    }
  `

  do {
    const response = await graphqlRequest<{
      organization?: {
        membersWithRole?: {
          pageInfo?: { hasNextPage?: boolean; endCursor?: string | null }
          edges?: Array<{
            node?: {
              databaseId?: number | null
              login?: string
              name?: string | null
              email?: string | null
            }
          }>
        }
      }
    }>(authHeader, query, { org, after: cursor })

    const connection = response.data?.organization?.membersWithRole
    for (const edge of connection?.edges || []) {
      const node = edge.node
      if (!node?.login || !node.databaseId) continue
      profiles.push({
        login: node.login,
        userId: node.databaseId,
        name: node.name ?? null,
        email: pickEmail(node.email)
      })
    }

    if (!connection?.pageInfo?.hasNextPage) break
    cursor = connection.pageInfo.endCursor ?? null
  } while (cursor)

  logger.info(`GraphQL membersWithRole: ${profiles.length} rows for ${org}`)
  return profiles
}

/** SAML NameID — same as saml_name_id in org membership CSV export. */
async function fetchSamlExternalIdentitiesGraphQL(
  org: string,
  headers: HeadersInit,
  logger: Console
): Promise<OrgMemberProfile[]> {
  const authHeader = getAuthHeader(headers)
  if (!authHeader) return []

  const profiles: OrgMemberProfile[] = []
  let cursor: string | null = null

  const query = `
    query OrgSamlIdentities($org: String!, $after: String) {
      organization(login: $org) {
        samlIdentityProvider {
          externalIdentities(first: 100, after: $after) {
            pageInfo { hasNextPage endCursor }
            edges {
              node {
                samlIdentity { nameId }
                user {
                  login
                  databaseId
                }
              }
            }
          }
        }
      }
    }
  `

  do {
    const response = await graphqlRequest<{
      organization?: {
        samlIdentityProvider?: {
          externalIdentities?: {
            pageInfo?: { hasNextPage?: boolean; endCursor?: string | null }
            edges?: Array<{
              node?: {
                samlIdentity?: { nameId?: string | null } | null
                user?: { login?: string; databaseId?: number | null } | null
              }
            }>
          }
        } | null
      }
    }>(authHeader, query, { org, after: cursor })

    const provider = response.data?.organization?.samlIdentityProvider
    if (!provider) {
      logger.info(`No SAML identity provider on GraphQL for ${org}`)
      break
    }

    const connection = provider.externalIdentities
    for (const edge of connection?.edges || []) {
      const node = edge.node
      const login = node?.user?.login
      const userId = node?.user?.databaseId
      if (!login || !userId) continue

      profiles.push({
        login,
        userId,
        email: pickEmail(node?.samlIdentity?.nameId)
      })
    }

    if (!connection?.pageInfo?.hasNextPage) break
    cursor = connection.pageInfo.endCursor ?? null
  } while (cursor)

  const withEmail = profiles.filter((p) => pickEmail(p.email)).length
  logger.info(`GraphQL SAML identities: ${profiles.length} rows, ${withEmail} with nameId for ${org}`)
  return profiles
}

async function graphqlRequest<T>(
  authHeader: string,
  query: string,
  variables: Record<string, unknown>
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
  const response = await $fetch<{ data?: T; errors?: Array<{ message: string }> }>(
    'https://api.github.com/graphql',
    {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body: { query, variables }
    }
  )

  if (response.errors?.length) {
    throw new Error(response.errors.map((e) => e.message).join('; '))
  }

  return response
}

export function lookupOrgMember(
  directory: Map<string, OrgMemberProfile>,
  userLogin: string,
  userId?: number
): OrgMemberProfile | undefined {
  const byLogin = directory.get(userLogin.toLowerCase())
  if (byLogin) return byLogin
  if (!userId) return undefined
  for (const profile of directory.values()) {
    if (profile.userId === userId) return profile
  }
  return undefined
}

export function enrichWithOrgDirectory<T extends { user_login: string; user_id?: number }>(
  rows: T[],
  directory: Map<string, OrgMemberProfile>
): Array<T & { name?: string | null; email?: string | null }> {
  return rows.map((row) => {
    const profile = lookupOrgMember(directory, row.user_login, row.user_id)
    const name = pickEmail(profile?.name) ?? null
    const email = pickEmail(profile?.email)
    return {
      ...row,
      name,
      email
    }
  })
}

/** Attach org-directory name/email onto Seat rows (login/id fields). */
export function enrichSeatsWithOrgDirectory<T extends { login: string; id?: number; name?: string | null; email?: string | null }>(
  seats: T[],
  directory: Map<string, OrgMemberProfile>
): T[] {
  return seats.map((seat) => {
    const profile = lookupOrgMember(directory, seat.login, seat.id)
    const name = pickEmail(profile?.name, seat.name) ?? null
    const email = pickEmail(profile?.email, seat.email)
    seat.name = name
    seat.email = email
    return seat
  })
}

export function formatUserLabel(row: {
  user_login: string
  name?: string | null
  email?: string | null
}): string {
  const parts = [row.user_login]
  if (row.name) parts.push(row.name)
  const email = pickEmail(row.email)
  if (email) parts.push(`<${email}>`)
  return parts.join(' · ')
}
