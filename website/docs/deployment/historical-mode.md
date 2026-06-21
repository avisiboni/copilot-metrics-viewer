---
title: מצב היסטורי (PostgreSQL)
---

# מצב היסטורי — PostgreSQL וסנכרון

מצב היסטורי שומר מדדי Copilot יומיים ב-PostgreSQL ומאפשר ניתוח מעבר ל-28 יום, היסטוריית משתמשים, ומושבים לפי חודש מצילומי מצב.

## רכיבים

| רכיב | תפקיד |
|------|--------|
| **Web** | לוח Nuxt — קורא מ-DB (עם sync-on-miss אופציונלי) |
| **PostgreSQL** | אחסון `user_day_metrics`, צילומי מושבים וכו' |
| **Sync** | הורדה יומית מ-GitHub API → DB (`Dockerfile.sync`, CronJob ב-K8s) |

## משתני סביבה

```env
DATABASE_URL=postgresql://metrics_user:metrics_password@db:5432/copilot_metrics
ENABLE_HISTORICAL_MODE=true
NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=true
SYNC_ENABLED=false          # true רק בתהליך sync נפרד
NUXT_GITHUB_TOKEN=...
```

:::tip
ב-Docker Compose הגדירו **גם** `ENABLE_HISTORICAL_MODE` (שרת) **וגם** `NUXT_PUBLIC_ENABLE_HISTORICAL_MODE` (ממשק).
:::

## Docker Compose

```bash
export NUXT_GITHUB_TOKEN=github_pat_...
export NUXT_PUBLIC_GITHUB_ORG=your-org
export NUXT_PUBLIC_IS_DATA_MOCKED=false
export ENABLE_HISTORICAL_MODE=true
export NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=true

docker compose up db web
docker compose run --rm sync   # מילוי ראשוני
```

פתחו `http://localhost:3000/orgs/your-org`.

## API סנכרון ידני

`POST /api/admin/sync` — פעולות: `sync-date`, `sync-last-28`, `sync-range`, `sync-gaps`.

דוגמה:

```bash
curl -X POST http://localhost:3000/api/admin/sync \
  -H "Content-Type: application/json" \
  -d '{"action":"sync-last-28","scope":"organization","githubOrg":"your-org"}'
```

סטטוס: `GET /api/admin/sync-status`.

פרטים מלאים: [DEPLOYMENT.md](https://github.com/github-copilot-resources/copilot-metrics-viewer/blob/main/DEPLOYMENT.md#admin-sync-api) ב-repo.

## Kubernetes

- `k8s/deployment.yaml` — אפליקציה
- `k8s/cronjob.yaml` — sync יומי (ברירת מחדל 02:00 UTC)

## תכונות שתלויות במצב היסטורי

- `GET /api/seats-history` — מגמות מושבים חודשיות
- `GET /api/user-metrics-history` — מגמות לפי משתמש
- מקטע **מושבים לפי חודש** בלשונית Seat analysis (סה״כ בסוף חודש)

## קישורים

- [מצבי הפעלה](../setup/operating-modes)
- [Docker](./docker)
- [משתני סביבה](../reference/environment-variables)
