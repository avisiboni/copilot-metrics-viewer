---
title: Getting started
sidebar_position: 1
---

# Getting started

This guide walks you through cloning the project, configuring your environment, and customising branding — from zero to a live dashboard.

## 1. Clone the repository

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. Configure `.env`

```bash
cp .env.example .env
```

Open `.env` and fill in the values below.

### Organisation or Enterprise

```env
# Choose: organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# Your GitHub organisation slug (e.g. my-company)
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# Enterprise slug — only when SCOPE=enterprise
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# Filter to a specific team (optional)
NUXT_PUBLIC_GITHUB_TEAM=
```

### Authentication — Personal Access Token

```env
# Fine-grained or classic PAT with scopes:
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> Create a token at **GitHub → Settings → Developer settings → Personal access tokens**.  
> See [Scopes](../reference/scopes) for the full required permission list.

### Session password (required)

```env
# Random string, at least 32 characters — used to encrypt session cookies
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip Generate a random password
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### Optional features

```env
# Use GitHub OAuth / GitHub App instead of a PAT
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# Disable per-user premium-credit fetching (recommended for initial setup)
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# Corporate proxy (if required)
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. Branding — logo and company name

### Logo

Replace `public/favicon.svg` with your own icon (SVG recommended).

For the dashboard itself, place your logo under `public/`:

```
public/
  logo.png        ← main logo (PNG, ~200 px wide recommended)
  favicon.svg     ← browser tab icon
```

### Company / org name in the UI

The organisation or enterprise name is displayed automatically from `NUXT_PUBLIC_GITHUB_ORG` / `NUXT_PUBLIC_GITHUB_ENT` — no separate config needed.

To change the browser tab title, edit `nuxt.config.ts`:

```ts
app: {
  head: {
    title: 'Copilot Metrics — My Company'
  }
}
```

## 4. Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

:::tip Quick smoke-test without a token
Set `NUXT_PUBLIC_IS_DATA_MOCKED=true` in `.env` — the dashboard renders with built-in demo data so you can verify the UI before connecting to the GitHub API.
:::

## 5. Verify everything works

1. Dashboard loads at `http://localhost:3000`
2. Your org / enterprise name appears in the header
3. Charts display data (real or mocked)
4. **Seat analysis** tab loads without errors

## Next steps

| Topic | Link |
|-------|-------|
| Advanced auth (OAuth / GitHub App) | [Authentication](./authentication) |
| Deploy with Docker | [Docker](../deployment/docker) |
| Deploy to Azure | [Azure](../deployment/azure) |
| All environment variables | [Reference — Environment variables](../reference/environment-variables) |
