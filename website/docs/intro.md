---
sidebar_position: 1
title: ברוכים הבאים
---

# Copilot Metrics Viewer

מערכת זו מציגה **לוח בקרה** למדדי שימוש ב-GitHub Copilot ברמת ארגון, צוות או Enterprise — גרפים, טבלאות, ייצוא CSV, תובנות חיוב, קוהורטות AI adoption ועוזר AI.

> **גרסה 3.0** — משתמשת ב-[Copilot Usage Metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage-metrics). ראו [מעבר ל-v3](./reference/v3-migration).

## למי מיועד התיעוד?

| קהל | התחילו כאן |
|-----|------------|
| **משתמשי לוח הבקרה** | [מדריך למשתמש](./user-guide/overview) |
| **מנהלי מערכת / DevOps** | [מצבי הפעלה](./setup/operating-modes) · [פריסה](./deployment/overview) |
| **מפתחים** | [התקנה מקומית](./setup/local-development) · [תרגומים](./contributing/translations) |

## שפות

- **עברית (ברירת מחדל)** — ממשק התיעוד מימין לשמאל (RTL).
- **English** — בחרו **English** בתפריט השפה; הנתיב יתחיל ב-`/en/docs/...`.

## דרישות בסיסיות

- חשבון **GitHub Organization** או **Enterprise** עם Copilot.
- **טוקן** (PAT), **GitHub App**, או **OAuth** — [אימות](./setup/authentication).
- לעמודות **Premium credits** ו-**Usage & billing**: `manage_billing:copilot` ופלטפורמת חיוב מתקדמת.

## מצבי הפעלה

| מצב | תיאור קצר |
|-----|-----------|
| **Direct API** | ללא DB — חלון 28 יום מה-API |
| **Historical** | PostgreSQL + sync — היסטוריה, מגמות משתמש/מושבים |

[פרטים →](./setup/operating-modes)

## לשוניות בלוח (סדר טיפוסי)

| לשונית | תוכן |
|--------|------|
| Organization / Enterprise | KPI, קוהורטות AI adoption, גרפים כלליים |
| Copilot Chat | מדדי צ'אט |
| Users | שימוש לפי משתמש, **דפוסי שימוש**, שלב אימוץ |
| Usage & billing | חיוב, מודלים, דיאלוג פירוט משתמש, **דפוסי שימוש** |
| Seat analysis | מושבים, מגמות חודשיות, KPI שימוש |
| Usage insights | מודלים, Agent, תכונות |
| Teams | צוות בודד או השוואה (ארגון/Enterprise) |
| Languages / Editors | פילוח |
| API response | ייצוא גולמי / CSV |
| [עוזר AI](./user-guide/ai-chat) | צ'אט על המדדים (FAB) |

ניתן להסתיר לשוניות: `NUXT_PUBLIC_HIDDEN_TABS=languages,editors`

## קישורים מהירים

- [דפוסי שימוש](./user-guide/usage-patterns)
- [תצוגה לפי צוות (URL)](./user-guide/team-scoped-views)
- [מיתוג](./setup/branding)
- [שינויים אחרונים](./reference/recent-features)
- [רכיבי UI](./user-guide/ui-reference/overview)

:::tip
לשינוי טווח תאריכים — לחצו על **Last 28 days** בראש העמוד ולחצו **Apply**.
:::
