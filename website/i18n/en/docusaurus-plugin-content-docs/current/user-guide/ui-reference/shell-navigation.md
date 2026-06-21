---
title: Shell & navigation
---

# Dashboard shell: sidebar, header, dates

## Navigation sidebar (left)

![Sidebar](/img/ui/sidebar.png)

| Item | Tab (`?tab=`) | Description |
|------|---------------|-------------|
| Organization | `organization` | Daily / 28-day org metrics |
| Teams | `teams` | Usage by team |
| Languages | `languages` | Language breakdown |
| Editors | `editors` | Editor breakdown |
| Copilot Chat | `copilot-chat` | Chat metrics |
| Usage insights | `usage-insights` | Extended usage insights |
| Users | `users` | User table |
| Usage & billing | `usage-billing` | Billing + leaderboard |
| Seat analysis | `seat-analysis` | Seat analysis |
| API response | `api-response` | JSON view and export |

**Tooltip (behavior):** Active tab has a light purple background; click updates the URL for a shareable link.

## Top header

![Header](/img/ui/header.png)

| Element | Explanation |
|---------|-------------|
| Org / Enterprise name | From `NUXT_PUBLIC_GITHUB_ORG` / `GITHUB_ENT` |
| Language selector | Hebrew / English — saved in `localStorage` and cookie |
| Mock data | Shown when `NUXT_PUBLIC_IS_DATA_MOCKED=true` |

## Date range picker

![Date panel](/img/ui/date-range-open.png)

| Field | Explanation |
|-------|-------------|
| Since / Until | Range for daily reports and summaries; affects most tabs |
| Apply | Reloads data for selected range |
| Last 28 days (default) | `organization-28-day/latest` and `users-28-day/latest` |

**Note:** On Users, **Filter by day** switches to `users-1-day` for a single day (overrides the 28-day window).

## AI assistant (FAB)

Floating robot button — opens the [AI assistant](../ai-chat). Disable with `NUXT_PUBLIC_ENABLE_AI_CHAT=false`.

## Footer

Link to Copilot Metrics Viewer on GitHub, version, and **Documentation** when `NUXT_PUBLIC_DOCS_URL` is set.
