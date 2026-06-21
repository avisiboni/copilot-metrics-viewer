---
title: API routes
---

# Server API routes (Nitro)

Common parameters: `since`, `until`, `githubOrg`, `githubEnt`, `scope`, `githubTeam`.

## Metrics and usage

| Route | Description |
|-------|-------------|
| `GET /api/metrics` | Copilot metrics (org/enterprise) |
| `GET /api/user-metrics` | Per-user usage + billing meta |
| `GET /api/user-metrics-history` | User history (requires `ENABLE_HISTORICAL_MODE`) |
| `GET /api/usage-insights` | Usage insights, models, cohorts |
| `GET /api/team-metrics` | Derived team metrics |
| `GET /api/teams` | Team list |
| `GET /api/github-stats` | GitHub.com stats |

## Seats and billing

| Route | Description |
|-------|-------------|
| `GET /api/seats` | Assigned seats |
| `GET /api/seats-history` | Seat history (historical mode) |
| `GET /api/billing` | Copilot billing settings |
| `GET /api/billing-status` | Billing API availability |
| `POST /api/user-premium-credits` | Per-user PRU (batch) |
| `POST /api/user-ai-credits` | Per-user AI credits (batch) |

## Org / Entra

| Route | Description |
|-------|-------------|
| `GET /api/org-search` | Manager search (Entra) |
| `GET /api/org-reports` | Direct reports for a manager |
| `GET /api/enterprise-orgs` | Orgs in enterprise |
| `GET /api/msal/callback` | MSAL redirect |
| `GET /api/installations` | GitHub App installations |

## AI and admin

| Route | Description |
|-------|-------------|
| `POST /api/ai/chat` | AI assistant → GitHub Models |
| `POST /api/admin/sync` | Manual sync (historical mode) |
| `GET /api/admin/sync-status` | Sync status |

## Health

| Route | Description |
|-------|-------------|
| `GET /api/health` | General health |
| `GET /api/ready` | Readiness |
| `GET /api/live` | Liveness (no GitHub calls) |

See [Authentication](../setup/authentication).
