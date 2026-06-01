---
title: Organization — KPIs and charts
---

# Organization tab — KPIs and charts

![Dashboard example](/img/ui/dashboard-example.png)

Source: `organization-1-day` / `organization-28-day/latest` reports (Copilot **usage metrics** API).

## KPIs (top cards)

| KPI | Explanation (tooltip) |
|-----|------------------------|
| Acceptance Rate (by count) | % of suggestions accepted (by prompt count) |
| Total Suggestions Count | Daily suggestion volume |
| Acceptance Rate (by lines) | % of suggested lines accepted |
| Total Lines Suggested | Suggested vs accepted lines |
| Total Active Users | Daily active users |
| DAU / WAU / MAU | Daily / weekly / monthly unique users |

ⓘ on each card — `metrics.*` / `aboutKpi` in i18n.

## AI adoption cohorts

When the API returns cohort data, an **AI adoption cohorts** panel appears above the charts: KPI cards per phase, engaged-users bar chart, and per-phase averages table.

![Cohort panel](/img/ui/ai-adoption-organization-panel.png)

Full guide: [AI adoption cohorts](./ai-adoption-cohorts).

## Charts

| Chart | Explanation (summary) |
|-------|------------------------|
| Acceptance rate by count (%) | Suggestion quality over time |
| Total Suggestions \| Acceptances | Volume vs acceptance |
| Acceptance rate by lines (%) | Line-level quality |
| Total Lines Suggested \| Accepted | Line volume |
| Total Active Users | Adoption — active users |
| DAU / WAU / MAU | Engagement over time |

Full text: `charts.*` in `shared/i18n/locales/he.ts` / `en.ts`.

## What is not here

- **PRU / Premium credits** — Users / Usage & billing only (Billing API).
- **Dollar cost** — Usage & billing (when available).
