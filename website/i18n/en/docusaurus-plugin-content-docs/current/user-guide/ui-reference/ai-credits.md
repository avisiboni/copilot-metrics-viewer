---
title: AI credits
---

# AI credits

**AI credits** — GitHub billing metric for Copilot consumption beyond included quota (premium models, Agent, etc.). Available via [Budget and usage management APIs](https://github.blog/changelog/2026-06-04-budget-and-usage-management-apis-now-generally-available/) (GA, June 2026).

## Two different GitHub sources

| Source | API | What you get |
|--------|-----|--------------|
| **Usage metrics** | `/copilot/metrics/reports/users-*` | Interactions, lines, Agent/Chat — **no AI credits** |
| **Billing** | `/settings/billing/ai_credit/usage` | Credits by model / user + net USD |

The app uses both separately. CSV export **does not** include AI credits.

## Where to see it in the dashboard

| Location | Display |
|----------|---------|
| **Usage & billing** — **AI credits** column | Quantity + USD (when available) per user |
| **Users** — **AI credits** column | Same; background batch load |
| **Usage detail dialog** | **AI credits (billing period)** card |

## Flag: disable

```bash
NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=false
```

| When `false` | When `true` (default) |
|--------------|----------------------|
| No `ai_credit/usage?user=` calls | Per-user fetch |
| Column shows em dash | Credit count + cost |
| No billing errors in terminal | May 403 if enterprise blocks |

## Why 403 / “not in org API”

1. **Enterprise-owned org** — GitHub blocks `?user=` on org billing API.  
   Message: *Organization admins for enterprise owned organizations cannot filter usage by user*.
2. **Fix:** Enterprise API `enterprises/{ent}/.../ai_credit/usage?organization=&user=`.
3. **Network:** Enterprise **IP allow list** — even with a full PAT.

See [Billing API troubleshooting](../../troubleshooting/billing-api).

## Enabling

1. Allow caller IP on enterprise (or run from allowed network).
2. Set `NUXT_PUBLIC_GITHUB_ENT`.
3. PAT with `manage_billing:copilot` (org) or `manage_billing:enterprise` / `admin:enterprise` (enterprise).
4. `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true` (default).
5. Restart the server.

## Cache and batches

- Batches of **10** users per request (`POST /api/user-ai-credits`).
- Server cache **10 minutes** per key (org + range + user).
- **Usage & billing** — server fetch with `/api/usage-insights` load.
- **Users** — background load after billing check.

## Difference from PRU

| | **AI credits** | **PRU (Premium credits)** |
|---|----------------|---------------------------|
| API | `.../ai_credit/usage` | `.../premium_request/usage` |
| Flag | `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED` | `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED` |
| Display | Count + USD | Monthly quota progress bar |

Both metrics may appear together depending on org billing. See [Premium credits (PRU)](./premium-credits).

## Links

- [Usage & billing columns](./usage-billing-table-columns)
- [Users columns](./users-table-columns)
- [User usage detail dialog](./user-usage-detail-dialog)
- [Environment variables — AI credits](../../reference/environment-variables#ai-credits)
