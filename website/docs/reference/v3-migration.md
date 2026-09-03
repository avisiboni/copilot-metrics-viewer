---
title: מעבר ל-v3 (Usage Metrics API)
---

# מעבר לגרסה 3.0

גרסה 3.0 משתמשת ב-[Copilot Usage Metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage-metrics) במקום ב-API הישן של Copilot Metrics.

## מה השתנה?

| לפני (legacy) | אחרי (v3) |
|---------------|-----------|
| `GET /orgs/{org}/copilot/metrics` | Usage Metrics API (אסינכרוני, דוחות יומיים) |
| מדדי צוות ברמת API | מדדי צוות **נגזרים** מנתוני משתמש + Teams API |
| חלון 28 יום בלבד | + מצב היסטורי עם PostgreSQL |

ה-API הישן הושבת ב-**2 באפריל 2026**.

## דרישות הרשאה

ב-GitHub App או PAT נדרשת הרשאה:

- **Organization Copilot metrics: Read** (או מקבילה ב-fine-grained PAT)

ראו [GitHub App Registration](https://github.com/github-copilot-resources/copilot-metrics-viewer/blob/main/DEPLOYMENT.md#github-app-registration) ב-DEPLOYMENT.md.

## `USE_LEGACY_API`

```env
USE_LEGACY_API=false   # ברירת מחדל — אל תפעילו אלא אם יש סיבה מיוחדת
```

ה-endpoint הישן אינו זמין ב-GitHub; השארירו `false`.

## תכונות חדשות ב-v3

- **Per-user metrics** — לשונית Users עם פירוט ודיאלוג שימוש
- **Historical mode** — PostgreSQL + sync יומי
- **Team metrics** — נגזרות מנתוני משתמש (Direct + Historical)
- **AI adoption cohorts** — שלבי אימוץ מ-API
- **Usage & billing** — PRU, מודלים, תכונות

## קישורים

- [מצבי הפעלה](../setup/operating-modes)
- [רשימת endpoints ב-GitHub](./github-network-endpoints)
- [שינויים אחרונים](./recent-features)
