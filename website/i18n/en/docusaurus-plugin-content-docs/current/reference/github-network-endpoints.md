---
title: GitHub network endpoints
---

# GitHub / Copilot outgoing endpoints

This page lists all GitHub URLs the app uses to fetch data, and what each endpoint is used for.

## Recommended proxy allowlist

- `https://api.github.com`

## REST endpoints used by the application

| Endpoint pattern | Used for |
|---|---|
| `GET https://api.github.com/user/installations` | Lists GitHub App installations during auth flow to validate app access. |
| `GET https://api.github.com/orgs/{org}/copilot/metrics/reports/organization-1-day?day={yyyy-mm-dd}` | Fetches one-day organization Copilot usage metrics for a specific day. |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/metrics/reports/enterprise-1-day?day={yyyy-mm-dd}` | Fetches one-day enterprise Copilot usage metrics for a specific day. |
| `GET https://api.github.com/orgs/{org}/copilot/metrics/reports/organization-28-day/latest` | Fetches latest 28-day organization Copilot usage summary. |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/metrics/reports/enterprise-28-day/latest` | Fetches latest 28-day enterprise Copilot usage summary. |
| `GET https://api.github.com/orgs/{org}/copilot/metrics/reports/user-teams-1-day?day={yyyy-mm-dd}` | Fetches per-team daily usage metrics for an organization. |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/metrics/reports/user-teams-1-day?day={yyyy-mm-dd}` | Fetches per-team daily usage metrics for an enterprise. |
| `GET https://api.github.com/orgs/{org}/copilot/metrics/reports/users-1-day?day={yyyy-mm-dd}` | Fetches per-user daily usage metrics for an organization. |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/metrics/reports/users-1-day?day={yyyy-mm-dd}` | Fetches per-user daily usage metrics for an enterprise. |
| `GET https://api.github.com/orgs/{org}/copilot/metrics/reports/users-28-day/latest` | Fetches latest 28-day per-user metrics for an organization. |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/metrics/reports/users-28-day/latest` | Fetches latest 28-day per-user metrics for an enterprise. |
| `GET https://api.github.com/orgs/{org}/copilot/billing` | Fetches organization billing settings (Usage & billing panel). |
| `GET https://api.github.com/orgs/{org}/copilot/billing/seats` | Fetches Copilot seat assignments for an organization (Seat analysis). |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/billing/seats` | Fetches Copilot seat assignments for an enterprise (Seat analysis). |
| `GET https://api.github.com/orgs/{org}/teams` | Lists organization teams. |
| `GET https://api.github.com/enterprises/{enterprise}/teams` | Lists enterprise teams. |
| `GET https://api.github.com/orgs/{org}/teams/{team}/members` | Lists members of a specific org team. |
| `GET https://api.github.com/enterprises/{enterprise}/teams/{team}/members` | Lists members of a specific enterprise team. |
| `GET https://api.github.com/orgs/{org}/members` | Lists organization members (member directory enrichment). |
| `GET https://api.github.com/organizations/{org}/settings/billing` | Fetches organization-level billing settings metadata. |
| `GET https://api.github.com/organizations/{org}/settings/billing/usage?year=&month=` | Detailed billing lines (Usage & billing — SKU, net spend). |
| `GET https://api.github.com/organizations/{org}/settings/billing/usage/summary?year=&month=` | Billing usage summary by SKU. |
| `GET https://api.github.com/organizations/{org}/settings/billing/premium_request/usage?year=&month=&user=` | Per-user PRU (Premium credits). |
| `GET https://api.github.com/organizations/{org}/settings/billing/ai_credit/usage?year=&month=&user=` | Per-user AI credits. |
| `GET https://api.github.com/enterprises/{enterprise}/settings/billing/premium_request/usage?organization=&user=` | Per-user PRU (enterprise-owned org). |
| `GET https://api.github.com/enterprises/{enterprise}/settings/billing/ai_credit/usage?organization=&user=` | Per-user AI credits (enterprise-owned org). |
| `GET https://api.github.com/enterprises/{enterprise}/settings/billing` | Fetches enterprise-level billing settings metadata. |

## GraphQL endpoint used by the application

| Endpoint | Used for |
|---|---|
| `POST https://api.github.com/graphql` | Fetches organization member profile enrichment (`membersWithRole`) and SAML identity fields (`externalIdentities`). |

## Notes

- All placeholders (`{org}`, `{enterprise}`, `{team}`) are runtime values from app configuration or route parameters.
- If your proxy is domain-based, allowing `api.github.com` is sufficient for runtime data collection in this app.
