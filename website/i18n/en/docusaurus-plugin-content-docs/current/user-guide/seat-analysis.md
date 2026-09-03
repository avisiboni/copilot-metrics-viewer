---
title: Seat analysis
---

# Seat analysis tab

Analyzes **Copilot seats** — assignment, usage, inactivity, and monthly invoice-style trends.

![Seat analysis tab screenshot](/img/ui/seat-analysis-tab.png)

## KPI cards (clickable filters)

| Metric | Meaning |
|--------|---------|
| Total Assigned | Assigned seats |
| Assigned But Never Used | Assigned, never used |
| No Activity (7 / 30 days) | No recent activity |

Clicking a card filters the table below.

## Seats per month

The **Seats per month** section includes:

- **Stacked bar chart** — new + existing seats
- **Table** — invoice breakdown (month, new, existing, total)

### Data source

| Mode | Calculation |
|------|-------------|
| **Historical** (`ENABLE_HISTORICAL_MODE` + `NUXT_PUBLIC_ENABLE_HISTORICAL_MODE` + sync) | **End-of-month** totals from daily snapshots (`/api/seats-history`) |
| **Direct API** | Monthly assignments by `created_at` (still-assigned seats) |

:::info
Without historical mode an in-app message explains how to enable sync for accurate monthly totals.
:::

## Billing card

**Billing** settings when API is available: plan, IDE chat, platform chat, CLI, public suggestions, seat management.

## Seats table

Seat list with login, team, assignment date, last activity — **no** global date filter (current state).

## Links

- [Historical mode](../deployment/historical-mode)
- [Operating modes](../setup/operating-modes)
