---
title: שינויים אחרונים
---

# שינויים אחרונים בלוח הבקרה

סיכום יכולות שהתווספו לאחרונה. לפרטים מלאים — [מדריך רכיבי ממשק](../user-guide/ui-reference/overview).

## קוהורטות AI adoption (מאי 2026)

- **מקור:** [GitHub Changelog — Copilot usage metrics API cohorts](https://github.blog/changelog/2026-05-29-copilot-usage-metrics-api-adds-cohorts-for-ai-adoption/)
- **משתמש:** `ai_adoption_phase` — שלבים 0–3 (No cohort → Multi-agent) + `version` (למשל `v1`)
- **ארגון:** `totals_by_ai_adoption_phase` — משתמשים מעורבים + ממוצעי אינטראקציות, generations, acceptances, LOC, PR לפי שלב
- **בלוח:** פאנל KPI/גרף/טבלה; עמודת שלב ב-Users וב-Usage & billing; צ'יפ + גרסה בדיאלוג משתמש
- **תיעוד מלא (מיפוי API, מגבלות, צילומי מסך):** [קוהורטות AI adoption](../user-guide/ui-reference/ai-adoption-cohorts)

## דיאלוג פירוט שימוש למשתמש (User usage detail)

- **איפה:** לשונית **Usage & billing** — לחיצה על שורת משתמש או כפתור **Usage**.
- **מה מוצג:** KPIs (אינטראקציות, generations, acceptances, שורות שנוספו), תרשימי מודלים/תכונות, צ'יפים Agent/Chat/CLI, קרדיט פרימיום (כשה-API זמין).
- **תיעוד:** [דיאלוג פירוט משתמש](../user-guide/ui-reference/user-usage-detail-dialog).

## טעינת קרדיט פרימיום (PRU) — אצווה + מטמון

- טעינה ברקע בקבוצות של 10 משתמשים (`POST /api/user-premium-credits`).
- מטמון שרת 10 דקות לכל משתמש/טווח.
- אינדיקטור טעינה בעמודה **Premium credits** בלשונית Users.

## דגל סביבה: השבתת שליפת PRU זמנית

```bash
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false
```

- מבטל קריאות ל-GitHub Billing API לשליפת PRU **לפי משתמש**.
- מציג תג **בקרוב** בעמודת Premium credits והודעה בלשוניות **Users** ו-**Usage & billing**.
- מדדי שימוש (דוחות `users-28-day` / `users-1-day`) **ממשיכים** לעבוד.

ראו [קרדיט פרימיום](../user-guide/ui-reference/premium-credits).

## תמיכת RTL ועברית באפליקציה

- `dir=rtl` על המסמך בעברית.
- `v-locale-provider` ל-Vuetify.
- Cookie locale ל-SSR (`copilot-metrics-viewer-locale`).
- ממשק Assistant + תרגומים מלאים ב-`shared/i18n`.

## שיפורי לשונית Users

- סינון לפי יום / משתמש.
- העשרת שם ואימייל מספריית חברי הארגון (GraphQL).
- כרטיס סטטוס חיוב (כש-PRU מופעל).

## תיעוד

- מדריך רכיבי UI מפורט תחת [ui-reference](../user-guide/ui-reference/overview).
- הסבר על שני האתרים: [אפליקציה ותיעוד](./app-and-docs-site).
