---
title: Users columns
---

# Columns — Users tab

![Users tab](/img/ui/users-tab.png)

| Column (Hebrew / EN) | Data key | Explanation (like tooltip) |
|----------------------|----------|----------------------------|
| **User** | `user_login`, `name`, `email` | GitHub login; name and email when org directory (GraphQL) returns them |
| **Premium credits** | `premium_credits` | Monthly **Premium Request Units (PRU)** quota — from GitHub Billing API when enabled. Progress bar: % remaining, used/quota. **Coming soon** when `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false` |
| **Interactions** | `user_initiated_interaction_count` | User-initiated interactions (metrics report) |
| **Generations** | `code_generation_activity_count` | Code generation activities |
| **Acceptances** | `code_acceptance_activity_count` | Accepted code suggestions |
| **Lines added** | `loc_added_sum` | Sum of lines of code added |
| **Agent** | `used_agent` | Used Copilot Agent in range (yes/no) |
| **Chat** | `used_chat` | Used Copilot Chat (yes/no) |
| **AI adoption phase** | `ai_adoption_phase` | Per-user chip (e.g. **Code first** = mainly IDE completions/agent mode). ⓘ on column header + hover chip — [AI adoption cohorts](./ai-adoption-cohorts) |

## Premium credits column — states

| Display | Meaning |
|---------|---------|
| **Disabled (IP allowlist)** | Billing API blocked from this deployment — hover cell for details |
| **Coming soon** chip | Billing fetch disabled via env flag |
| Progress + “Loading…” | Background batches from `/api/user-premium-credits` |
| Bar + “X% · N left · used/quota” | PRU from billing |
| **N/A** | Billing unavailable or no data for user |

**Column header tooltip (when PRU active):** Server cache 10 minutes per user and date range.

## Difference from CSV export

Export on **API response** uses **Copilot metrics** (`/api/metrics`) — **no** PRU column.  
PRU requires the Billing API or a future GitHub CSV import.
