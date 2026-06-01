---
title: OpenShift
---

# OpenShift / Kubernetes

## Recommended: one app, docs at `/docs`

When your organization requires documentation on a **path** (not a separate subdomain), deploy only the root Nuxt image. Docs are embedded at build time (`npm run docs:embed`, part of `npm run build`):

| Path | Content |
|------|---------|
| `/` | Metrics dashboard |
| `/docs/...` | Documentation (Hebrew) |
| `/docs/en/...` | Documentation (English) |

### Steps

1. Build from root `Dockerfile` with your public app URL:

   ```bash
   docker build \
     --build-arg DOCUSAURUS_URL=https://metrics.apps.cluster.example.com \
     -t copilot-metrics-viewer .
   ```

2. Push to registry, deploy with env from Secret, expose **one Route** (no separate docs Route).
3. Use `/api/live` and `/api/ready` probes.

| Variable | Recommended |
|----------|-------------|
| `NUXT_PUBLIC_DOCS_URL` | `/docs` (default, same host) |
| `DOCUSAURUS_URL` | build-arg only — same as Route host |

You do **not** need `website/openshift/docs-deployment.yaml` for this layout.

## Optional separate docs host

`website/Dockerfile` and `website/openshift/docs-deployment.yaml` are only for environments that allow a dedicated docs hostname. Not required when docs live under `/docs` on the app Route.
