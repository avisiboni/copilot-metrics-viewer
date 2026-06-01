---
title: Usage & billing
---

# Usage & billing tab

![Usage & billing tab](/img/ui/usage-billing-tab.png)

Combines **Copilot metrics** reports (activity) with **GitHub Billing Usage** (costs / PRU) when the API is available.

## Top KPIs (examples)

| KPI | Tooltip (summary) |
|-----|-------------------|
| Premium requests (PRU) | Total PRU units in period — billable premium usage |
| Models (premium) | Models that incurred PRU billing |
| Users with PRU | Users with PRU usage in report |

When `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false`, PRU KPI cards and the premium-by-model chart are hidden; **Net spend** (SKU) remains when billing is available.

## User table

Similar to Users but with:

| Extra column | Explanation |
|--------------|-------------|
| **Usage** (button) | Opens [user usage detail dialog](./user-usage-detail-dialog) |
| **PRU cost** | Net cost for period (from billing; hidden when PRU fetch disabled) |

Clicking the user name also opens the dialog.

## Charts

- Premium requests by model (when PRU fetch enabled)  
- Additional model/user breakdowns when billing data exists

## Data sources (footer)

| Billing | Text |
|---------|------|
| Yes | `users-28-day`, `user-teams-1-day`, `billing/usage`, `premium_request/usage` |
| No | Metrics only — no billing endpoints |

---

When `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false`:

- Info banner at top (same as Users).
- **Premium credits** column — **Coming soon** chip.
- **PRU cost** column hidden; **Net spend** (SKU) remains when billing is available.

See [Premium credits](./premium-credits).
