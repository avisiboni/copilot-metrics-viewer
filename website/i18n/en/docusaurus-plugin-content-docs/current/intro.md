---
sidebar_position: 1
slug: /intro
title: Welcome
---

# Copilot Metrics Viewer

This project provides a **dashboard** for GitHub Copilot usage metrics at organization, team, or enterprise level — charts, tables, CSV export, and billing insights when the API is available.

## Who should read this?

| Audience | Start here |
|----------|------------|
| **Dashboard users** | [User guide](./user-guide/overview) |
| **Technical audience (Admins / DevOps / Developers)** | [Setup overview](./setup/overview) · [Reference](./reference/environment-variables) |

## Languages

- **Hebrew (default)** — RTL documentation at `/docs/...`
- **English** — use the locale switcher; paths are under `/en/docs/...`

## Requirements

- GitHub **Organization** or **Enterprise** with Copilot Metrics.
- Token or OAuth / GitHub App with correct [scopes](./reference/scopes).
- For **Premium credits** and **Usage & billing**: `manage_billing:copilot` and enhanced billing.

## Dashboard tabs

| Tab | Content |
|-----|---------|
| Organization | Acceptance rates, suggestions, active users |
| Teams | Team comparison |
| Languages / Editors | Breakdowns |
| Copilot Chat | Chat metrics |
| Usage insights | Models & features |
| Users | Per-user usage + premium credits |
| Usage & billing | Spend & PRU (when available) |
| Seat analysis | Seat assignment / idle seats |
| API response | Raw export |

:::tip
Change the date range via **Last 28 days** at the top of the app, then **Apply**.
:::
