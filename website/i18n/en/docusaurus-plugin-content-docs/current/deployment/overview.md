---
title: Deployment overview
---

# Deployment

The app runs in **Docker** (port 80 in container). Requires a **server** (Nuxt + Nitro) — not static hosting alone.

## Architecture

### Direct API

```text
User → Nuxt (web) → GitHub Copilot Usage Metrics API
```

### Historical mode

```text
User → Nuxt (web) → PostgreSQL
              ↑
         Sync (CronJob / compose) ← GitHub API
```

[Historical mode →](./historical-mode) · [Operating modes](../setup/operating-modes)

## Embedded docs

In production docs are built to `public/docs/` and served at `/docs` on the same host.

```bash
npm run build    # includes docs:embed
```

## Deployment options

| Environment | Doc |
|-------------|-----|
| Docker Compose | [Docker](./docker) |
| Historical + sync | [Historical mode](./historical-mode) |
| OpenShift | [OpenShift](./openshift) |
| Azure (one-click / azd) | [Azure](./azure) |
| Health probes | [Health checks](./health-checks) |
| Kubernetes | `k8s/` in repo + DEPLOYMENT.md |

## Security

- PAT mode: protect ingress (Azure EasyAuth, IP allowlist, private networking).
- OAuth: `NUXT_PUBLIC_REQUIRE_AUTH` + allow lists.

[Authentication](../setup/authentication)
