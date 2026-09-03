---
title: Users tab
---

# Users tab

Per-user table from the users-28-day report (or users-1-day for a single day).

:::info AI adoption cohorts
The **AI adoption cohorts** panel is **hidden by default**. To show it: `NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS=true` — [docs](./ui-reference/ai-adoption-cohorts).
:::

![Users tab screenshot](/img/ui/users-tab.png)

## Top 5 effective Copilot users

Above the filters, up to **five KPI cards** show users with the highest **effectiveness score** in the report window (usage pattern + acceptance + real activity volume — not raw clicks alone).

| On each card | Meaning |
|--------------|---------|
| Rank (#1–#5) | Position by effectiveness score |
| Effectiveness score | 0–100 — `computeCopilotQualityScore` ([Usage patterns](./usage-patterns#effectiveness-score-vs-engagement-score)) |
| Activity line | Interactions · generations · acceptances |
| Usage pattern | Same chip as in the table |

Clicking a card opens the [user usage detail dialog](./ui-reference/user-usage-detail-dialog). The dialog still shows a separate **engagement score**. This is **not** code quality or a performance grade — see [Usage patterns](./usage-patterns).

:::info
The row is hidden when no user has effectiveness score &gt; 0. Filtering the table to one user **does not** change the top five — they are always computed from **all** users in the range.
:::

## Premium credits

Shows PRU quota when Billing Usage API is available; otherwise **N/A**.

Use **Billing status** → **Check now** to probe the API for the current range.

## Filters

Day filter, user autocomplete, and table search.
