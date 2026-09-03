---
title: Team-scoped views (URL)
---

# Team-scoped dashboard URLs

Open the dashboard **pre-filtered to one team** — all tabs (languages, editors, chat, users, etc.) show only that team's members.

## URL patterns

```
https://<host>/orgs/<org>/teams/<team>
https://<host>/enterprises/<enterprise>/teams/<team>
```

Local examples:

```
http://localhost:3000/orgs/octo-demo-org/teams/the-a-team
http://localhost:3000/orgs/mocked-org/teams/the-a-team?mock=true
```

## UI

- **Blue banner** at the top — team name and **Back to org** link.
- Global date range applies to all tabs.

## How it works

GitHub does not expose dedicated team metrics endpoints. The app:

1. Downloads **per-user** daily metrics (org/enterprise).
2. Resolves team membership via the **Teams API**.
3. Filters and aggregates in memory.

Works in **Direct API** (28-day window) and **Historical mode** (full history).

## vs Teams tab

| | **Team URL** | **Teams tab** |
|---|--------------|---------------|
| Goal | Full dashboard for one team | Compare multiple teams |
| Selection | From URL | Team picker in UI |

See [Teams](./teams).

## GitHub limit

A team needs **at least 5 members with active Copilot licenses** at end of day — otherwise metrics may be empty.
