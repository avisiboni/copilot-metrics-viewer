---
title: App and documentation site
---

# How the app and documentation work together

Copilot Metrics Viewer serves the dashboard and documentation from the **same host**, under a **path folder** (not a subdomain):

| Surface | Technology | Example URL |
|---------|------------|-------------|
| Dashboard | Nuxt 3 + Vuetify | `https://metrics.company.com/` |
| Documentation | Docusaurus (embedded static) | `https://metrics.company.com/docs/` |

## Architecture

```text
Single Route / Ingress
  ├─ /           → Nuxt app + API
  ├─ /api/*      → Nitro
  └─ /docs/*     → static files from public/docs/ (docs:embed at build)
```

`npm run build` runs `docs:embed` then `nuxt build`.

## Footer link

- Default: `NUXT_PUBLIC_DOCS_URL=/docs` — opens in the same tab.
- Override with another path or full URL (external URLs open in a new tab).

## i18n

| Place | Paths |
|-------|--------|
| App | `shared/i18n` |
| Docs | Hebrew `/docs/...`, English `/docs/en/...` |

## Deployment

One image (`Dockerfile` at repo root), one Route. Build-arg `DOCUSAURUS_URL=https://metrics.company.com` for canonical links in docs.

See [OpenShift](../deployment/openshift).
