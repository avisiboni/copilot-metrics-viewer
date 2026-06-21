---
title: Authentication
---

# Authentication

The app supports several modes — selected **only** via environment variables.

## PAT (default)

```env
NUXT_GITHUB_TOKEN=ghp_...
NUXT_SESSION_PASSWORD=<32+ chars>
```

- Token stays **on the server** — the browser never sees it.
- All visitors see the same metrics (no sign-in).
- Scopes: Copilot metrics, `read:org`, `manage_billing:copilot` (billing), and more — [scopes](../reference/scopes).

## OAuth — multiple providers

```env
NUXT_PUBLIC_AUTH_PROVIDERS=github,microsoft,google
NUXT_PUBLIC_REQUIRE_AUTH=true
NUXT_OAUTH_GITHUB_CLIENT_ID=...
NUXT_OAUTH_GITHUB_CLIENT_SECRET=...
# + keys for each active provider
```

Supported: **GitHub**, **Google**, **Microsoft Entra ID**, **Auth0**, **Keycloak**.

After deploy — update Redirect URI (e.g. `https://<host>/auth/github`).

### Restrict access

```env
NUXT_AUTHORIZED_USERS=user1,user2@company.com
NUXT_AUTHORIZED_EMAIL_DOMAINS=company.com
```

## GitHub OAuth only (legacy)

```env
NUXT_PUBLIC_USING_GITHUB_AUTH=true
NUXT_OAUTH_GITHUB_CLIENT_ID=...
NUXT_OAUTH_GITHUB_CLIENT_SECRET=...
```

Prefer `NUXT_PUBLIC_AUTH_PROVIDERS=github` instead.

## GitHub App (installation token)

Alternative to PAT — no long-lived server token:

```env
NUXT_GITHUB_APP_ID=...
NUXT_GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
```

See [GitHub App Registration](https://github.com/github-copilot-resources/copilot-metrics-viewer/blob/main/DEPLOYMENT.md#github-app-registration).

## Microsoft Entra — manager filter

Separate from sign-in OAuth — MSAL for direct-reports filter:

```env
NUXT_PUBLIC_ENTRA_CLIENT_ID=...
NUXT_PUBLIC_ENTRA_TENANT_ID=...
```

[Filter by manager](./entra-manager-filter)

## Links

- [Getting started](./getting-started)
- [Environment variables](../reference/environment-variables)
