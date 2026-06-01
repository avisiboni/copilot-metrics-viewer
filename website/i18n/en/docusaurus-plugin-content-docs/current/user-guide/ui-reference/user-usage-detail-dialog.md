---
title: User usage detail dialog
---

# User usage detail dialog

![User usage detail dialog](/img/ui/user-usage-detail-dialog.png)

> **Where to open:** **Usage & billing** tab → click user name or **Usage** button on a row.

Modal dialog with per-user detail for the active report range.

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

## Premium credits and cost

| Element | Explanation |
|---------|-------------|
| **Premium credits** | Always shown; **Coming soon** when `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false` |
| **PRU cost** | `pruNetAmount` — only when PRU fetch is enabled **and** billing is available |

## Teams

List of `team_slug` from latest `user-teams-1-day` snapshot.

## Agent / Chat / CLI chips

Boolean usage for Agent, Chat, and CLI (if present in report).

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
