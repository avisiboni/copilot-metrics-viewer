---
title: App and documentation site
---

# How the app and docs work together

| UI | Technology | Example URL |
|----|------------|-------------|
| **Dashboard** | Nuxt 3 + Vuetify | `https://metrics.company.com/` |
| **Docs** | Docusaurus (static) | `https://metrics.company.com/docs/` |

## Architecture

```text
Route / Ingress (single host)
  ├─ /              → Nuxt
  ├─ /api/*         → Nitro
  └─ /docs/*        → public/docs/ (from docs:embed)
```

`npm run build` → `docs:embed` + `nuxt build`.

## Link from the app

`NUXT_PUBLIC_DOCS_URL=/docs` (default) — footer **Documentation**.

## Languages

| Place | Path |
|-------|------|
| App | Hebrew/English — `shared/i18n`, RTL |
| Docs Hebrew | `/docs/...` |
| Docs English | `/en/docs/...` |

Changing app language does **not** automatically change docs language.

## Developing docs

```bash
npm run docs:dev      # http://localhost:3001
npm run docs:dev:en   # /en
```

## English sync

```bash
cd website && npm run docs:sync-en
```

Source: `website/docs/` (Hebrew). Mirror: `website/i18n/en/docusaurus-plugin-content-docs/current/`.
