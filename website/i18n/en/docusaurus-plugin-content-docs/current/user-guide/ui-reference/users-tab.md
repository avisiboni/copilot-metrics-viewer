---
title: Users tab
---

# Users tab — Copilot usage by user

![Users tab](/img/ui/users-tab.png)

Data source: GitHub **Copilot usage metrics** report  
`GET .../copilot/metrics/reports/users-28-day/latest` (or `users-1-day?day=`).

This is **not** the same API as Premium request billing — see [Metrics vs billing](../../reference/app-and-docs-site).

## Screen areas

### Title

**Copilot usage by user** — summary for the report window (28 days or a single day).

### “Premium credits — coming soon” banner

Shown when `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false`:

- No Billing API calls for per-user PRU.
- **Premium credits** column shows a **Coming soon** chip.
- Other columns load normally.

Details: [Premium credits](./premium-credits).

### Billing status card (when PRU fetch is enabled)

| Element | Explanation |
|---------|-------------|
| **Billing status** | Checks GitHub Billing Usage API availability for the current range |
| **Check now** | Calls `/api/billing-status` and refreshes the column |

**Tooltip:** Requires `manage_billing:copilot` and billing admin permissions.

### Filters

| Filter | Explanation |
|--------|-------------|
| Filter by day | `users-1-day` report for one date; empty = latest rolling 28 days |
| Filter by user | Limits the table to one login |
| Apply filters | Reloads from `/api/user-metrics` |

### Table

Title **Users**, free-text search, 15 rows per page.

Columns — [Users table columns](./users-table-columns).

## Data flow (short)

```text
/api/user-metrics → users-28-day (metrics API)
                 → (optional) /api/user-premium-credits in batches of 10
```

---

Next: [Table columns](./users-table-columns) · [User detail dialog](./user-usage-detail-dialog) (on Usage & billing)
