---
title: Docker
---

# Docker ו-Docker Compose

## Image אפליקציה

```bash
docker build -t copilot-metrics-viewer .
docker run -p 8080:80 --env-file .env copilot-metrics-viewer
```

## Compose — Direct API (ללא DB)

```bash
export NUXT_GITHUB_TOKEN=github_pat_...
export NUXT_PUBLIC_GITHUB_ORG=your-org
export NUXT_PUBLIC_IS_DATA_MOCKED=false

docker compose up web
# http://localhost:3000/orgs/your-org
```

## Compose — Historical mode

```bash
export NUXT_GITHUB_TOKEN=github_pat_...
export NUXT_PUBLIC_GITHUB_ORG=your-org
export ENABLE_HISTORICAL_MODE=true
export NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=true

docker compose up db web
docker compose run --rm sync
```

[פרטים →](./historical-mode)

## Mock

```bash
docker compose up web
# http://localhost:3000/orgs/your-org?mock=true
```

## שירותים

| שירות | תפקיד |
|--------|--------|
| `web` | לוח Nuxt |
| `db` | PostgreSQL 15 |
| `sync` | הורדת מדדים ל-DB |
| `playwright` | E2E (profile test) |

## Image תיעוד (נפרד)

```bash
docker build -f website/Dockerfile -t copilot-metrics-docs ./website
docker run -p 8081:8080 copilot-metrics-docs
```

בפריסה משולבת — `npm run docs:embed` בתוך build האפליקציה.

## Sync image

`Dockerfile.sync` — `ghcr.io/github-copilot-resources/copilot-metrics-viewer-sync`

## קישורים

- [DEPLOYMENT.md](https://github.com/github-copilot-resources/copilot-metrics-viewer/blob/main/DEPLOYMENT.md)
- [משתני סביבה](../reference/environment-variables)
