---
title: מצבי הפעלה
sidebar_position: 2
---

# מצבי הפעלה

האפליקציה תומכת בשני מצבים עיקריים. בחרו לפי צורך בשמירת היסטוריה, מגמות לפי משתמש/צוות, ומורכבות תשתית.

## השוואה

| | **Direct API** | **Historical (PostgreSQL)** |
|---|----------------|----------------------------|
| **מקור נתונים** | GitHub Copilot Usage Metrics API בכל טעינה | PostgreSQL (מסונכרן יומית) |
| **חלון זמן** | 28 יום גלילים (API) | ללא הגבלה (לפי מה שסונכרן) |
| **מסד נתונים** | לא נדרש | PostgreSQL + שירות sync |
| **מגמות משתמש** | טבלת Users לטווח הנבחר | + תרשימי היסטוריה לפי משתמש |
| **מושבים לפי חודש** | לפי תאריך הקצאה (מושבים פעילים) | סה״כ מושבים בסוף חודש (צילומי מצב) |
| **צוותים** | כן — נגזר מנתוני משתמש (28 יום) | כן — היסטוריה מלאה |
| **כתובות URL לפי צוות** | כן (`/orgs/.../teams/...`) | כן |

## Direct API (ברירת מחדל)

ההתקנה הפשוטה ביותר — רק טוקן GitHub (או OAuth):

```env
NUXT_GITHUB_TOKEN=ghp_...
NUXT_PUBLIC_SCOPE=organization
NUXT_PUBLIC_GITHUB_ORG=your-org
NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=false
```

- אין `DATABASE_URL`.
- מדדי ארגון, משתמשים, חיוב, מושבים וצוותים נטענים מה-API.
- טווח התאריכים בלוח מוגבל ל-28 הימים האחרונים (מגבלת API).

## Historical mode

מאפשר שמירת מדדים יומיים, סנכרון אוטומטי, מילוי פערים, והיסטוריית מושבים/משתמשים.

```env
DATABASE_URL=postgresql://user:pass@host:5432/copilot_metrics
ENABLE_HISTORICAL_MODE=true
NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=true
```

| משתנה | תפקיד |
|--------|--------|
| `ENABLE_HISTORICAL_MODE` | שרת: קריאה מ-DB, `seats-history`, `user-metrics-history`, sync |
| `NUXT_PUBLIC_ENABLE_HISTORICAL_MODE` | ממשק: הודעות, מגמות חודשיות במושבים, תכונות תלויות-היסטוריה |

פרטי פריסה: [מצב היסטורי](../deployment/historical-mode).

## v3.0 — Copilot Usage Metrics API

מגרסה 3.0 האפליקציה משתמשת ב-[Copilot Usage Metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage-metrics). ה-API הישן (`/copilot/metrics`) הושבת באפריל 2026.

ראו [מעבר ל-v3](../reference/v3-migration).

## מה הלאה?

- [תחילת עבודה](./getting-started)
- [Docker](../deployment/docker)
- [מצב היסטורי](../deployment/historical-mode)
