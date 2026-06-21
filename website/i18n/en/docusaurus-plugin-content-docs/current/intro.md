---
sidebar_position: 1
title: Welcome
---

# Copilot Metrics Viewer

This project provides a **dashboard** for GitHub Copilot usage metrics at organization, team, or enterprise level — charts, tables, CSV export, billing insights, AI adoption cohorts, and an AI assistant.

> **v3.0** — Uses the [Copilot Usage Metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage-metrics). See [v3 migration](./reference/v3-migration).

## Who is this for?

| Audience | Start here |
|----------|------------|
| **Dashboard users** | [User guide](./user-guide/overview) |
| **Admins / DevOps** | [Operating modes](./setup/operating-modes) · [Deployment](./deployment/overview) |
| **Developers** | [Local development](./setup/local-development) · [Translations](./contributing/translations) |

## Languages

- **Hebrew (default)** — RTL documentation at `/docs/...`.
- **English** — choose **English** in the locale menu; paths start with `/en/docs/...`.

## Requirements

- **GitHub Organization** or **Enterprise** with Copilot.
- **Token** (PAT), **GitHub App**, or **OAuth** — [Authentication](./setup/authentication).
- For **Premium credits** and **Usage & billing**: `manage_billing:copilot` and advanced billing platform.

## Operating modes

| Mode | Summary |
|------|---------|
| **Direct API** | No DB — 28-day rolling window from API |
| **Historical** | PostgreSQL + sync — full history, user/seat trends |

[Details →](./setup/operating-modes)

## Dashboard tabs (typical order)

| Tab | Content |
|-----|---------|
| Organization / Enterprise | KPIs, AI adoption cohorts, org charts |
| Copilot Chat | Chat metrics |
| Users | Per-user usage, **usage patterns**, adoption phase |
| Usage & billing | Billing, models, user detail dialog, **usage patterns** |
| Seat analysis | Seats, monthly trends, usage KPIs |
| Usage insights | Models, Agent, features |
| Teams | Single team or comparison (org/enterprise) |
| Languages / Editors | Breakdowns |
| API response | Raw export / CSV |
| [AI assistant](./user-guide/ai-chat) | Chat about metrics (FAB) |

Hide tabs: `NUXT_PUBLIC_HIDDEN_TABS=languages,editors`

## Quick links

- [Usage patterns](./user-guide/usage-patterns)
- [Team-scoped URLs](./user-guide/team-scoped-views)
- [Branding](./setup/branding)
- [Recent features](./reference/recent-features)
- [UI reference](./user-guide/ui-reference/overview)

:::tip
To change the date range — click **Last 28 days** at the top and press **Apply**.
:::
