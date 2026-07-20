---
title: Users columns
---

# Columns — Users tab

![Users tab](/img/ui/users-tab.png)

User table on the **Users** tab — columns as in `UserMetricsViewer` (left-to-right in LTR).

| # | Column | Data key | Explanation (like header tooltip) |
|---|--------|----------|-----------------------------------|
| 1 | **User** | `user_login`, `name`, `email` | GitHub login; name/email when org directory (GraphQL) returns them |
| 2 | **Usage** | (button) | Opens [user usage detail dialog](./user-usage-detail-dialog) |
| 3 | **Usage pattern** | (computed) | Heuristic label vs org cohort — **not** a GitHub field. [Usage patterns](../usage-patterns) |
| 4 | **AI credits** *(conditional)* | `ai_credits`, `ai_credits_used` | From **usage metrics** (`ai_credits_used`) immediately; USD from billing — [AI credits](./ai-credits) |
| 5 | **Interactions** | `user_initiated_interaction_count` | User-initiated interactions |
| 6 | **Generations** | `code_generation_activity_count` | Code generation activities |
| 7 | **Acceptances** | `code_acceptance_activity_count` | Accepted suggestions |
| 8 | **Lines added** | `loc_added_sum` | Lines of code added |
| 9 | **Agent** | `used_agent` | Yes/no — Copilot **Agent mode in the IDE** (not coding agent) |
| 10 | **Chat** | `used_chat` | Yes/no — Copilot Chat |
| 11 | **Coding agent** | `used_copilot_coding_agent` | Yes/no — **Copilot coding agent on GitHub** (issue assignment, `@copilot` on PR) — [Changelog](https://github.blog/changelog/2026-03-25-copilot-usage-metrics-now-identify-active-copilot-coding-agent-users/) |

## Fields not in table columns (but in report / dialog)

| Field | Where | Note |
|-------|-------|------|
| **AI adoption phase** | User detail dialog header | Hidden by default; `NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS=true` — [cohorts](./ai-adoption-cohorts) |
| **Copilot coding agent** | **Coding agent** column; dialog chip | `used_copilot_coding_agent` — GitHub.com agent, not IDE |
| **Premium credits (PRU)** | Usage & billing column; dialog | [Premium credits](./premium-credits) |

## AI credits column — states

| Display | Meaning |
|---------|---------|
| Loading spinner | Billing batch from `/api/user-ai-credits` (metrics may already show) |
| `X credits · $Y` | Billing per-user data |
| `X credits (from usage metrics)` | From `ai_credits_used` in users report |
| **(per-user AI credits not in org API)** | Enterprise-owned org — set `NUXT_PUBLIC_GITHUB_ENT` |
| **N/A** | Billing unavailable or `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=false` |

## CSV export difference

Export on **API response** uses **Copilot metrics** (`/api/metrics`) — **no** PRU or AI credits.  
Billing metrics require Billing API — [Premium credits](./premium-credits) · [AI credits](./ai-credits).
