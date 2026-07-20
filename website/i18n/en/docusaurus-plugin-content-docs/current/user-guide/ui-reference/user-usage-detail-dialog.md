---
title: User usage detail dialog
---

# User usage detail dialog

![User usage detail dialog](/img/ui/user-usage-detail-dialog.png)

> **Where to open:** **Users** or **Usage & billing** tab → **Usage** button on a row (or click user name on Usage & billing).

Modal dialog with per-user detail for the active report range.

## Usage pattern & scores

**Usage pattern & scores** panel (`UserUsageInsightPanel`) — below top KPIs when data exists:

| Element | Explanation |
|---------|-------------|
| **Pattern chip** | Label (e.g. Balanced, Volume adopter) — [Usage patterns](../usage-patterns) |
| **Confidence** | Low / medium / high — from total activity |
| **Engagement score** | 0–100 vs most active user in cohort |
| **Derived rates table** | Value, org median, percentile, **formula** |
| **Raw totals** | Interactions, generations, acceptances, LoC — with percentile and median |

:::info
Usage patterns are computed in the dashboard — not from GitHub API. For coaching, not performance ratings.
:::

## Dialog header

| Element | Explanation |
|---------|-------------|
| Avatar + login | User identity |
| Name · email | From org directory enrichment (if available) |
| **AI adoption phase** | Cohort chip + classification `version` (e.g. `v1`) — [AI adoption cohorts](./ai-adoption-cohorts) |
| Report range | Active report dates |

![Dialog with AI adoption phase](/img/ui/ai-adoption-user-detail-dialog.png)

## Top KPIs (4 cards)

| KPI | Key | Tooltip (summary) |
|-----|-----|-------------------|
| **Interactions** | `user_initiated_interaction_count` | User-initiated interactions in period |
| **Generations** | `code_generation_activity_count` | Code generation activities |
| **Acceptances** | `code_acceptance_activity_count` | Accepted suggestions |
| **LoC added** | `loc_added_sum` | Lines of code added |

Each card has ⓘ with full text (`userDetail.kpi*`).

## Premium credits, AI credits, and cost

| Element | Explanation |
|---------|-------------|
| **AI credits (billing period)** | `ai_credits_used` from users report immediately; USD from billing when available — `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true` (default) · [AI credits](./ai-credits) |
| **Premium credits** | Always shown; **Coming soon** when `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false` |
| **PRU cost** | `pruNetAmount` — only when PRU fetch is enabled **and** billing is available |

## Teams

List of `team_slug` from latest `user-teams-1-day` snapshot.

## Agent / Chat / CLI / Coding agent chips

| Chip | Field | Meaning |
|------|-------|---------|
| **Agent** | `used_agent` | Agent mode **in the IDE** |
| **Chat** | `used_chat` | Copilot Chat |
| **CLI** | `used_cli` | Copilot CLI (if present) |
| **Coding agent** | `used_copilot_coding_agent` | Copilot agent **on GitHub** (issue / `@copilot` on PR) — not IDE agent mode |

## Server-side telemetry (June 2026)

If a user has interactions/generations but **no** model/feature breakdown, an info banner explains GitHub detected activity from server-side telemetry; breakdown may stay empty until richer telemetry is available.

[Changelog — more active users](https://github.blog/changelog/2026-06-15-copilot-usage-metrics-now-include-more-of-your-active-users/)

## Charts

| Chart | Tooltip (summary) |
|-------|---------------------|
| **Top models** | Top models by interactions |
| **Activity mix** | Generations / acceptances / interactions mix |
| **Features** | Usage by feature |
| **Model × feature** | Model–feature matrix |

If no breakdown in report: *No model or feature breakdown for this user in the report window*.

## Relation to Users tab

| Users tab | This dialog |
|-----------|-------------|
| All users table | Deep dive for one user |
| Daily filters | Same global report range |
| Usage & billing only | Open button |

---

Component: `app/components/UserUsageDetailDialog.vue`
