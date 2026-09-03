---
title: Branding and customization
---

# Branding (logo, name, colors)

Customize the dashboard for your organization using environment variables — no code changes.

## Files

```
public/brand/
  logo.png          ← sidebar logo (default)
  favicon.svg       ← optional icon
app/assets/brand-tokens.css   ← brand colors
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_BRAND_LOGO_PATH` | Path under `public/` or full URL (default: `/brand/logo.png`) |
| `NUXT_PUBLIC_BRAND_LOGO_ALT` | Logo `alt` text |
| `NUXT_PUBLIC_BRAND_APP_NAME` | App name (title, footer) |
| `NUXT_PUBLIC_BRAND_META_DESCRIPTION` | `<meta name="description">` |
| `NUXT_PUBLIC_BRAND_FOOTER_PROJECT_URL` | Footer project link |
| `NUXT_PUBLIC_BRAND_FAVICON_PATH` | Favicon |

Example:

```env
NUXT_PUBLIC_BRAND_APP_NAME=Copilot Metrics — My Company
NUXT_PUBLIC_BRAND_LOGO_PATH=/brand/my-logo.png
NUXT_PUBLIC_BRAND_LOGO_ALT=My Company logo
```

## Branded UI components

The dashboard uses `Brand*` components (KPI, tables, charts) and Vuetify with `--brand-*` from `brand-tokens.css`.

## Docs on the same host

```env
NUXT_PUBLIC_DOCS_URL=/docs
```

Footer **Documentation** link — see [App and docs site](../reference/app-and-docs-site).

## Links

- [Getting started](./getting-started)
- [Environment variables](../reference/environment-variables)
