/**
 * Development hints for GitHub API credentials (missing or rejected tokens).
 */
export default defineNitroPlugin(async () => {
  if (!import.meta.dev) {
    return
  }

  const config = useRuntimeConfig()
  const token = String(config.githubToken || '').trim()
  const hasApp = Boolean(config.githubAppId && config.githubAppPrivateKey)
  const hasOAuth = Boolean(
    config.public.usingGithubAuth &&
      config.oauth?.github?.clientId &&
      config.oauth?.github?.clientSecret
  )

  if (!token && !hasApp && !hasOAuth) {
    console.warn(
      '[copilot-metrics-viewer] No GitHub API credential configured. ' +
        'Set NUXT_GITHUB_TOKEN in .env (or enable GitHub App / OAuth), then restart the dev server.'
    )
    return
  }

  if (!token || config.public.isDataMocked) {
    return
  }

  const org = String(config.public.githubOrg || '').trim()
  const ent = String(config.public.githubEnt || '').trim()
  const probeUrl = org
    ? `https://api.github.com/orgs/${encodeURIComponent(org)}`
    : ent
      ? `https://api.github.com/enterprises/${encodeURIComponent(ent)}`
      : 'https://api.github.com/user'

  try {
    const response = await fetch(probeUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${token}`
      }
    })
    if (response.status === 401) {
      console.warn(
        '[copilot-metrics-viewer] NUXT_GITHUB_TOKEN was rejected by GitHub (401 Unauthorized). ' +
          'Create a new fine-grained PAT with Copilot metrics (and billing if needed) for this org/enterprise, update .env, and restart npm run dev.'
      )
    } else if (response.status === 403) {
      console.warn(
        '[copilot-metrics-viewer] NUXT_GITHUB_TOKEN is valid but lacks permission for ' +
          `${probeUrl} (403). Check PAT scopes and org SSO authorization.`
      )
    }
  } catch (error) {
    console.warn('[copilot-metrics-viewer] Could not verify GitHub token:', error)
  }
})
