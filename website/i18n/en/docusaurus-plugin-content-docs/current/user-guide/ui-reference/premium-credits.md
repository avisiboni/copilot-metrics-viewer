---
title: Premium credits (PRU)
---

# Premium credits (PRU)

**Premium Request Units (PRU)** — billing metric for premium model usage beyond the Copilot license included quota.

## Two different GitHub sources

| Source | API | What you get |
|--------|-----|--------------|
| **Usage metrics** | `/copilot/metrics/reports/users-*` | Interactions, lines, Agent/Chat — **no PRU** |
| **Billing** | `/settings/billing/premium_request/usage` | PRU by model / user |

The app uses both separately. CSV export **does not** include PRU. For AI credits (separate billing metric) see [AI credits](./ai-credits).

## Flag: temporary disable

```bash
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false
```

| When `false` | When `true` (default) |
|--------------|----------------------|
| No `?user=` org billing calls | Per-user fetch attempted |
| **Coming soon** on column (Users + Usage & billing) | Progress bar / N/A |
| No 403 spam in terminal | May error if enterprise blocks access |

## Why 403 appears (when flag is `true`)

1. **Enterprise-owned org** — GitHub blocks `?user=` on org API.  
   Message: *Organization admins for enterprise owned organizations cannot filter usage by user*.
2. **Fix:** Enterprise API `enterprises/{ent}/.../premium_request/usage?organization=&user=`.
3. **Network:** Enterprise **IP allow list** — even with a full PAT.

See [Billing API troubleshooting](../../troubleshooting/billing-api).

## Re-enabling

1. Allow caller IP on enterprise (or run from allowed network).
2. Set `NUXT_PUBLIC_GITHUB_ENT`.
3. Classic PAT with `manage_billing:enterprise` / `admin:enterprise`.
4. `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=true`
5. Restart the server.

## Cache

- Batches of **10** users per request.
- Server cache **10 minutes** per key (org + range + user).
