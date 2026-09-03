---
title: Teams
---

# Teams tab

![Teams tab](/img/ui/teams-tab.png)

Shows Copilot metrics for **one team** (deep dive) or **comparison** across teams.

## How metrics are computed

GitHub does **not** provide dedicated team metrics endpoints. The app:

1. Downloads **daily per-user** metrics (org/enterprise).
2. Resolves team membership via the **GitHub Teams API**.
3. Filters and aggregates per team.

Works in **Direct API** (up to 28 days) and **Historical mode** (full history).

## Usage

1. Select **one team** — KPIs, charts (acceptance, active users, models, languages, editors), user table.
2. Select **two or more teams** — side-by-side comparison.
3. Use the global date range.

## Direct team URL

Full dashboard filtered to one team (all tabs):

```
/orgs/<org>/teams/<team>
```

[Details →](./team-scoped-views)

## GitHub limit

A team needs **at least 5 members with active Copilot licenses** at end of day — otherwise data may be empty.

## Historical mode

Analyze team trends beyond 28 days. Setup: [Historical mode](../deployment/historical-mode).

:::info
The Teams tab is shown for **organization** and **enterprise** scopes. It is **not** hidden in Direct API mode.
:::
