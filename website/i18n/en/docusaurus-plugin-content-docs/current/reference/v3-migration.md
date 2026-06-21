---
title: v3 migration (Usage Metrics API)
---

# Migrating to v3.0

v3.0 uses the [Copilot Usage Metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage-metrics) instead of the legacy Copilot Metrics API.

## What changed?

| Before (legacy) | After (v3) |
|-----------------|------------|
| `GET /orgs/{org}/copilot/metrics` | Usage Metrics API (async daily reports) |
| Team-level API metrics | Team metrics **derived** from user data + Teams API |
| 28-day window only | + Historical mode with PostgreSQL |

The legacy API was shut down on **April 2, 2026**.

## Permissions

GitHub App or PAT needs:

- **Organization Copilot metrics: Read** (or equivalent on fine-grained PAT)

See [GitHub App Registration](https://github.com/github-copilot-resources/copilot-metrics-viewer/blob/main/DEPLOYMENT.md#github-app-registration) in DEPLOYMENT.md.

## `USE_LEGACY_API`

```env
USE_LEGACY_API=false   # default — do not enable
```

The old endpoint is unavailable on GitHub; keep this `false`.

## New in v3

- **Per-user metrics** — Users tab and usage detail dialog
- **Historical mode** — PostgreSQL + daily sync
- **Team metrics** — derived from user data (Direct + Historical)
- **AI adoption cohorts** — phases from API
- **Usage & billing** — PRU, models, features

## Links

- [Operating modes](../setup/operating-modes)
- [GitHub endpoints](./github-network-endpoints)
- [Recent features](./recent-features)
