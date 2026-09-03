---
title: Getting started
sidebar_position: 1
---

# Getting started

From clone to a running dashboard.

## 1. Clone

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. Configure `.env`

```bash
cp .env.example .env
```

### Organization or Enterprise

```env
NUXT_PUBLIC_SCOPE=organization
NUXT_PUBLIC_GITHUB_ORG=your-org-name
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name
NUXT_PUBLIC_GITHUB_TEAM=
```

> Legacy `team-organization` / `team-enterprise` values are normalized to `organization` / `enterprise`.

### Authentication — PAT

```env
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

Scopes: Copilot metrics, `read:org`, `manage_billing:copilot` (for billing).

:::tip
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### Optional

```env
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false
NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=false
NUXT_PUBLIC_ENABLE_AI_CHAT=true
NUXT_PUBLIC_HIDDEN_TABS=
```

## 3. Branding

Prefer `NUXT_PUBLIC_BRAND_*` and files in `public/brand/` — do not edit `nuxt.config.ts` for title/logo.

[Full branding →](./branding)

## 4. Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` (or `/orgs/your-org`).

:::tip Mock data
```env
NUXT_PUBLIC_IS_DATA_MOCKED=true
```
or `?mock=true` in the URL.
:::

## 5. Verify

1. Dashboard loads
2. Charts show data
3. **Seat analysis** — KPIs + seats per month (if data exists)
4. Docs: `npm run docs:dev` → `http://localhost:3001`

## Next steps

| Topic | Link |
|-------|------|
| Direct vs Historical | [Operating modes](./operating-modes) |
| OAuth / GitHub App | [Authentication](./authentication) |
| Docker | [Docker](../deployment/docker) |
| Environment variables | [Reference](../reference/environment-variables) |
| v3.0 | [v3 migration](../reference/v3-migration) |
