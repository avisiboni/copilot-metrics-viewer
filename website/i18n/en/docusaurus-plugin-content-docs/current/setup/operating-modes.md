---
title: Operating modes
sidebar_position: 2
---

# Operating modes

The app supports two main modes. Choose based on history retention, per-user/team trends, and infrastructure complexity.

## Comparison

| | **Direct API** | **Historical (PostgreSQL)** |
|---|----------------|----------------------------|
| **Data source** | GitHub Copilot Usage Metrics API on each load | PostgreSQL (daily sync) |
| **Time window** | Rolling 28 days (API) | Unlimited (within synced range) |
| **Database** | Not required | PostgreSQL + sync service |
| **User trends** | Users table for selected range | + per-user history charts |
| **Seats per month** | By assignment date (active seats) | End-of-month totals (snapshots) |
| **Teams** | Yes — derived from user metrics (28 days) | Yes — full history |
| **Team-scoped URLs** | Yes (`/orgs/.../teams/...`) | Yes |

## Direct API (default)

Simplest setup — GitHub token (or OAuth) only:

```env
NUXT_GITHUB_TOKEN=ghp_...
NUXT_PUBLIC_SCOPE=organization
NUXT_PUBLIC_GITHUB_ORG=your-org
NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=false
```

- No `DATABASE_URL`.
- Org, users, billing, seats, and teams load from the API.
- Date range is limited to the last 28 days (API limit).

## Historical mode

Stores daily metrics, enables sync, gap fill, and seat/user history.

```env
DATABASE_URL=postgresql://user:pass@host:5432/copilot_metrics
ENABLE_HISTORICAL_MODE=true
NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=true
```

| Variable | Role |
|----------|------|
| `ENABLE_HISTORICAL_MODE` | Server: DB reads, `seats-history`, `user-metrics-history`, sync |
| `NUXT_PUBLIC_ENABLE_HISTORICAL_MODE` | UI: historical features and seat monthly messaging |

Deployment: [Historical mode](../deployment/historical-mode).

## v3.0 — Copilot Usage Metrics API

From v3.0 the app uses the [Copilot Usage Metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage-metrics). The legacy Copilot Metrics API was shut down in April 2026.

See [v3 migration](../reference/v3-migration).

## Next steps

- [Getting started](./getting-started)
- [Docker](../deployment/docker)
- [Historical mode](../deployment/historical-mode)
