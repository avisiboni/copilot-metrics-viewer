---
title: סקירת פריסה
---

# פריסה

האפליקציה רצה ב-**Docker** (פורט 80 בקונטיינר). דורשת **שרת** (Nuxt + Nitro) — לא static hosting בלבד.

## ארכיטקטורה

### Direct API

```text
משתמש → Nuxt (web) → GitHub Copilot Usage Metrics API
```

### Historical mode

```text
משתמש → Nuxt (web) → PostgreSQL
              ↑
         Sync (CronJob / compose) ← GitHub API
```

[מצב היסטורי →](./historical-mode) · [מצבי הפעלה](../setup/operating-modes)

## תיעוד מוטמע

ב-production התיעוד נבנה ל-`public/docs/` ומוגש ב-`/docs` על אותו host.

```bash
npm run build    # כולל docs:embed
```

## אפשרויות פריסה

| סביבה | מסמך |
|--------|------|
| Docker Compose | [Docker](./docker) |
| מצב היסטורי + sync | [Historical mode](./historical-mode) |
| OpenShift | [OpenShift](./openshift) |
| Azure (one-click / azd) | [Azure](./azure) |
| Health probes | [Health checks](./health-checks) |
| K8s | `k8s/` ב-repo + DEPLOYMENT.md |

## אבטחה

- PAT mode: הגנו ingress (Azure EasyAuth, IP allowlist, private networking).
- OAuth: `NUXT_PUBLIC_REQUIRE_AUTH` + רשימות מורשים.

[אימות](../setup/authentication)
