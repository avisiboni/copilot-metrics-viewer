---
title: Historical mode (PostgreSQL)
---

# Historical mode — PostgreSQL and sync

Historical mode stores daily Copilot metrics in PostgreSQL for analysis beyond 28 days, user trends, and invoice-style seat breakdowns from snapshots.

## Components

| Component | Purpose |
|-----------|---------|
| **Web** | Nuxt dashboard — reads from DB (optional sync-on-miss) |
| **PostgreSQL** | Stores `user_day_metrics`, seat snapshots, etc. |
| **Sync** | Daily download from GitHub API → DB (`Dockerfile.sync`, K8s CronJob) |

## Environment variables

```env
DATABASE_URL=postgresql://metrics_user:metrics_password@db:5432/copilot_metrics
ENABLE_HISTORICAL_MODE=true
NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=true
SYNC_ENABLED=false          # true only in dedicated sync process
NUXT_GITHUB_TOKEN=...
```

:::tip
In Docker Compose set **both** `ENABLE_HISTORICAL_MODE` (server) and `NUXT_PUBLIC_ENABLE_HISTORICAL_MODE` (UI).
:::

## Docker Compose

```bash
export NUXT_GITHUB_TOKEN=github_pat_...
export NUXT_PUBLIC_GITHUB_ORG=your-org
export NUXT_PUBLIC_IS_DATA_MOCKED=false
export ENABLE_HISTORICAL_MODE=true
export NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=true

docker compose up db web
docker compose run --rm sync
```

Open `http://localhost:3000/orgs/your-org`.

## Manual sync API

`POST /api/admin/sync` — actions: `sync-date`, `sync-last-28`, `sync-range`, `sync-gaps`.

Example:

```bash
curl -X POST http://localhost:3000/api/admin/sync \
  -H "Content-Type: application/json" \
  -d '{"action":"sync-last-28","scope":"organization","githubOrg":"your-org"}'
```

Status: `GET /api/admin/sync-status`.

Full reference: [DEPLOYMENT.md](https://github.com/github-copilot-resources/copilot-metrics-viewer/blob/main/DEPLOYMENT.md#admin-sync-api).

## Kubernetes

- `k8s/deployment.yaml` — web app
- `k8s/cronjob.yaml` — daily sync (default 02:00 UTC)

## Features that require historical mode

- `GET /api/seats-history` — monthly seat trends
- `GET /api/user-metrics-history` — per-user trends
- **Seats per month** on Seat analysis (end-of-month totals)

## Links

- [Operating modes](../setup/operating-modes)
- [Docker](./docker)
- [Environment variables](../reference/environment-variables)
