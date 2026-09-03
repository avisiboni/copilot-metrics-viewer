---
title: Environment variables
---

# Environment variables

Full reference: `.env.example` and [DEPLOYMENT.md](https://github.com/github-copilot-resources/copilot-metrics-viewer/blob/main/DEPLOYMENT.md).

## Core (`NUXT_PUBLIC_*`)

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_SCOPE` | `organization` or `enterprise` (legacy `team-*` values are auto-normalized) |
| `NUXT_PUBLIC_GITHUB_ORG` | Organization slug |
| `NUXT_PUBLIC_GITHUB_ENT` | Enterprise slug |
| `NUXT_PUBLIC_GITHUB_TEAM` | Optional fixed team filter |
| `NUXT_PUBLIC_IS_DATA_MOCKED` | `true` for mock data |
| `NUXT_PUBLIC_HIDDEN_TABS` | Comma-separated tabs to hide (e.g. `languages,editors`) |

## Historical mode and API

| Variable | Description |
|----------|-------------|
| `ENABLE_HISTORICAL_MODE` | Server: PostgreSQL reads, sync, `seats-history` |
| `NUXT_PUBLIC_ENABLE_HISTORICAL_MODE` | UI: historical features |
| `DATABASE_URL` | PostgreSQL connection |
| `SYNC_ENABLED` | `true` in sync process only |
| `SYNC_SCHEDULE` / `SYNC_DAYS_BACK` | Sync schedule (see DEPLOYMENT) |
| `USE_LEGACY_API` | `false` — legacy API retired (2026) |
| `NUXT_GITHUB_API_BASE_URL` | API base for GitHub Enterprise (GHE.com) |

## Authentication

| Variable | Description |
|----------|-------------|
| `NUXT_GITHUB_TOKEN` | PAT (no user sign-in) |
| `NUXT_SESSION_PASSWORD` | ≥32 characters |
| `NUXT_PUBLIC_USING_GITHUB_AUTH` | GitHub OAuth only (legacy) |
| `NUXT_PUBLIC_AUTH_PROVIDERS` | `github,google,microsoft,auth0,keycloak` |
| `NUXT_PUBLIC_REQUIRE_AUTH` | Require sign-in |
| `NUXT_OAUTH_*` | Keys per provider |
| `NUXT_GITHUB_APP_ID` / `NUXT_GITHUB_APP_PRIVATE_KEY` | GitHub App (PAT alternative) |
| `NUXT_AUTHORIZED_USERS` | Allowed users |
| `NUXT_AUTHORIZED_EMAIL_DOMAINS` | Allowed email domains |

## UI features

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_ENABLE_AI_CHAT` | AI assistant (default `true`) |
| `NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS` | AI adoption cohort panel + chips (default **hidden**) |
| `NUXT_PUBLIC_ADOPTION_IDE_ONLY` | When cohorts enabled: show only phases 0+1 (IDE) |
| `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED` | Per-user PRU fetch |
| `NUXT_PUBLIC_ENTERPRISE_PREMIUM_QUOTA` | Enterprise premium quota display |
| `NUXT_PUBLIC_ENTRA_CLIENT_ID` / `TENANT_ID` | Entra manager filter |
| `NUXT_PUBLIC_DOCS_URL` | Docs link (default `/docs`) |

## Branding

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_BRAND_LOGO_PATH` | Logo path |
| `NUXT_PUBLIC_BRAND_LOGO_ALT` | alt text |
| `NUXT_PUBLIC_BRAND_APP_NAME` | App name |
| `NUXT_PUBLIC_BRAND_META_DESCRIPTION` | meta description |
| `NUXT_PUBLIC_BRAND_FOOTER_PROJECT_URL` | Footer link |
| `NUXT_PUBLIC_BRAND_FAVICON_PATH` | Favicon |

See [Branding](../setup/branding).

## Network

| Variable | Description |
|----------|-------------|
| `HTTP_PROXY` / `CUSTOM_CA_PATH` | Corporate proxy / CA |
| `NITRO_PORT` | Port (80 in Docker) |

## Premium credits

```bash
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false
```

Disables per-user billing PRU calls; shows **Coming soon**. Usage metrics still work.

## AI credits

```bash
# Default — enabled
NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true
```

| `true` (default) | `false` |
|------------------|---------|
| **AI credits** column on Users and Usage & billing | Column shows em dash; no `ai_credit/usage` calls |

Requires `manage_billing:copilot` (org) or enterprise billing + `NUXT_PUBLIC_GITHUB_ENT` for enterprise-owned orgs.

## AI adoption cohorts

```bash
# Default — hidden (typical for IDE-only Copilot)
NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS=false

# Show cohort UI again:
NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS=true
NUXT_PUBLIC_ADOPTION_IDE_ONLY=true   # optional: only No cohort + Code first
```

See [Premium credits](../user-guide/ui-reference/premium-credits) · [AI credits](../user-guide/ui-reference/ai-credits).

## AI adoption cohorts
