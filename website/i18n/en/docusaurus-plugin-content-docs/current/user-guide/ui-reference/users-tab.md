---
title: Users tab
---

# Users tab — Copilot usage by user

![Users tab](/img/ui/users-tab.png)

Data source: GitHub **Copilot usage metrics** report  
`GET .../copilot/metrics/reports/users-28-day/latest` (or `users-1-day?day=`).

This is **not** the same API as Premium request billing — see [Metrics vs billing](../../reference/app-and-docs-site).

:::info AI adoption cohorts
The **AI adoption cohorts** panel is **hidden by default**. To show: `NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS=true` — [docs](./ai-adoption-cohorts).
:::

## Screen areas

### Title

**Copilot usage by user** — summary for the report window (28 days or a single day).

### “Premium credits — coming soon” banner

Shown when `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false`:

- No Billing API calls for per-user PRU.
- **Premium credits** column shows a **Coming soon** chip.
- Other columns load normally.

Details: [Premium credits](./premium-credits).

### Top 5 effective Copilot users (KPI row)

A card row **above the filters** (after the AI adoption panel, when shown):

| Element | Explanation |
|---------|-------------|
| Title | **Top 5 effective Copilot users** + tooltip |
| Up to 5 cards | Users with the highest **effectiveness score** (`computeCopilotQualityScore`) |
| Main value | Effectiveness score 0–100 — pattern + acceptance + real activity (not volume alone) |
| Hint | Interactions · generations · acceptances |
| Chip | Usage pattern (same component as the table column) |
| Click | Opens [user usage detail dialog](./user-usage-detail-dialog) |

**Implementation:** `pickTopUsersByCopilotQuality` in `shared/utils/users-top-kpi.ts`; logic in `shared/utils/copilot-quality-score.ts`. Idle / low-fit patterns are excluded. Ties break on total activity, then login.

:::caution Not a performance ranking
Cards reflect **effective Copilot use** (pattern + acceptance + activity) — not “best developer” or code quality. The usage dialog still shows a separate **engagement score** — [Usage patterns](../usage-patterns#effectiveness-score-vs-engagement-score). Do not use for HR or bonuses.
:::

The row is hidden when no user has effectiveness score &gt; 0.

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
