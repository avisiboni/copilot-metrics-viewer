---
title: Recent changes
---

# Recent dashboard changes

Summary of capabilities added recently. Full detail — [UI reference](../user-guide/ui-reference/overview).

## AI adoption cohorts (May 2026)

- **Source:** [GitHub Changelog — Copilot usage metrics API cohorts](https://github.blog/changelog/2026-05-29-copilot-usage-metrics-api-adds-cohorts-for-ai-adoption/)
- **User reports:** `ai_adoption_phase` — phases 0–3 (No cohort → Multi-agent) + `version` (e.g. `v1`)
- **Org reports:** `totals_by_ai_adoption_phase` — engaged users + per-phase averages (interactions, code activity, LOC, PRs)
- **Dashboard:** KPI/chart/table panel; phase column on Users and Usage & billing; chip + version in user dialog
- **Full docs (API mapping, limitations, screenshots):** [AI adoption cohorts](../user-guide/ui-reference/ai-adoption-cohorts)

## User usage detail dialog

- **Where:** **Usage & billing** tab — click a user row or **Usage** button.
- **Shows:** KPIs (interactions, generations, acceptances, lines added), model/feature charts, Agent/Chat/CLI chips, premium credits (when API available or Coming soon when disabled).
- **Docs:** [User usage detail dialog](../user-guide/ui-reference/user-usage-detail-dialog).

## Premium credits (PRU) — batch load + cache

- Background load in groups of 10 users (`POST /api/user-premium-credits`).
- 10-minute server cache per user/range.
- Loading indicator on **Premium credits** column (Users tab).

## Environment flag: temporarily disable PRU fetch

```bash
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false
```

- Skips GitHub Billing API calls for **per-user** PRU.
- Shows **Coming soon** on Premium credits column and info banner on **Users** and **Usage & billing**.
- Usage metrics (`users-28-day` / `users-1-day`) **still work**.

See [Premium credits](../user-guide/ui-reference/premium-credits).

## RTL and Hebrew in the app

- `dir=rtl` on document for Hebrew.
- `v-locale-provider` for Vuetify.
- Locale cookie for SSR (`copilot-metrics-viewer-locale`).
- Assistant UI + full translations in `shared/i18n`.

## Users tab improvements

- Filter by day / user.
- Name and email enrichment from org directory (GraphQL).
- Billing status card (when PRU fetch enabled).

## Documentation

- Detailed UI reference under [ui-reference](../user-guide/ui-reference/overview).
- Two-site architecture: [App and documentation](./app-and-docs-site).
