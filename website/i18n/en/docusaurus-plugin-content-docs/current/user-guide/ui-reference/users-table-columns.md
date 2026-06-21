---
title: Users columns
---

# Columns — Users tab

![Users tab](/img/ui/users-tab.png)

| Column (Hebrew / EN) | Data key | Explanation (like tooltip) |
|----------------------|----------|----------------------------|
| **User** | `user_login`, `name`, `email` | GitHub login; name and email when org directory (GraphQL) returns them |
| **AI adoption phase** | `ai_adoption_phase` | Per-user chip — [AI adoption cohorts](./ai-adoption-cohorts) |
| **Usage pattern** | (computed in dashboard) | Heuristic label from rates vs org cohort — **not** a GitHub field. Hover chip; full detail in **Usage** dialog. [Usage patterns](../usage-patterns) |
| **Usage** | (button) | Opens [user usage detail dialog](./user-usage-detail-dialog) |
| **Premium credits** | `premium_credits` | Hidden when `PREMIUM_CREDITS_TABLE_DISABLED` or PRU disabled — [Premium credits](./premium-credits) |
| **Interactions** | `user_initiated_interaction_count` | User-initiated interactions (metrics report) |
| **Generations** | `code_generation_activity_count` | Code generation activities |
| **Acceptances** | `code_acceptance_activity_count` | Accepted code suggestions |
| **Lines added** | `loc_added_sum` | Sum of lines of code added |
| **Agent** | `used_agent` | Used Copilot Agent in range (yes/no) |
| **Chat** | `used_chat` | Used Copilot Chat (yes/no) |

:::info Premium credits column
In the current UI the **Premium credits** column is hidden on the Users tab; **Usage** (dialog button) is shown instead. PRU — [Premium credits](./premium-credits).
:::

## Premium credits column — states

| Display | Meaning |
|---------|---------|
| **Disabled (IP allowlist)** | Billing API blocked from this deployment — hover cell for details |
| **Coming soon** chip | Billing fetch disabled via env flag |
| Progress + “Loading…” | Background batches from `/api/user-premium-credits` |
| Bar + “X% · N left · used/quota” | PRU from billing |
| **N/A** | Billing unavailable or no data for user |

**Column header tooltip (when PRU enabled):** Server cache 10 minutes per user and range.

## CSV export difference

Export on **API response** uses **Copilot metrics** (`/api/metrics`) — **no** PRU column.  
PRU requires Billing API or future GitHub CSV import.
