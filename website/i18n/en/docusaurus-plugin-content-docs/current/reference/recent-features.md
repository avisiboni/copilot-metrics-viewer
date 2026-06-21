---
title: Recent changes
---

# Recent dashboard changes

Summary of capabilities from recent releases (upstream + extensions). Details: [UI reference](../user-guide/ui-reference/overview).

## v3.0 — Copilot Usage Metrics API

- Migration to [Usage Metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage-metrics)
- [Operating modes](../setup/operating-modes): Direct API / Historical
- Team metrics derived from user data
- [v3 migration](./v3-migration)

## AI adoption cohorts (May 2026)

- **Source:** [GitHub Changelog — cohorts](https://github.blog/changelog/2026-05-29-copilot-usage-metrics-api-adds-cohorts-for-ai-adoption/)
- **Dashboard:** KPI panel, chart, table; chip in user dialog — **hidden by default** (`NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS=true` to enable)
- **Docs:** [AI adoption cohorts](../user-guide/ui-reference/ai-adoption-cohorts)

## Seats per month (Seat analysis)

- Stacked bar chart + invoice-style table (new/existing/total)
- Historical mode: end-of-month totals from snapshots
- [Seat analysis](../user-guide/seat-analysis)

## AI assistant

- Chat FAB, tab-specific questions, GitHub Models
- `NUXT_PUBLIC_ENABLE_AI_CHAT`
- [AI assistant](../user-guide/ai-chat)

## Team-scoped URLs

- `/orgs/.../teams/...` — full filtered dashboard
- [Team-scoped views](../user-guide/team-scoped-views)

## Top 5 effective Copilot users (Users)

- KPI row on the **Users** tab — up to five users with the highest **effectiveness score** (pattern + acceptance + activity; excludes idle / low-keep patterns)
- Card click → usage detail dialog (separate **engagement score** in the dialog); not a performance grade
- [Users](../user-guide/users) · [Usage patterns](../user-guide/usage-patterns#effectiveness-score-vs-engagement-score)

## Usage patterns

- **Usage pattern** column on Users and Usage & billing
- **Usage** dialog panel: derived rates, formulas, org percentiles
- Heuristic — not a GitHub field; for coaching, not ranking
- [Usage patterns](../user-guide/usage-patterns)

## User usage detail dialog

- From **Usage & billing** — KPIs, models, Agent/Chat/CLI, PRU
- [User usage detail](../user-guide/ui-reference/user-usage-detail-dialog)

## Premium credits (PRU)

- Batch load, 10-minute server cache
- `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false` — **Coming soon** mode
- [Premium credits](../user-guide/ui-reference/premium-credits)

## AI credits (June 2026)

- **Source:** [GitHub Changelog — Budget and usage management APIs GA](https://github.blog/changelog/2026-06-04-budget-and-usage-management-apis-now-generally-available/)
- **AI credits** column on Users, Usage & billing, and usage detail dialog
- API: `.../settings/billing/ai_credit/usage?user=`
- `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true` (default)
- [AI credits](../user-guide/ui-reference/ai-credits)

## RTL and Hebrew

- `dir=rtl`, `shared/i18n`, locale cookie for SSR

## Entra — filter by manager

- MSAL + Graph, `reports-to:` URLs
- [Entra manager filter](../setup/entra-manager-filter)

## Branding

- `NUXT_PUBLIC_BRAND_*`, `brand-tokens.css`
- [Branding](../setup/branding)

## Documentation

- [App and docs site](./app-and-docs-site)
- Sync EN: `npm run docs:sync-en` from `website/`
