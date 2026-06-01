---
title: משתני סביבה
---

# משתני סביבה

## ציבוריים (`NUXT_PUBLIC_*`)

| משתנה | תיאור |
|--------|--------|
| `NUXT_PUBLIC_SCOPE` | `organization`, `enterprise`, `team-organization`, `team-enterprise` |
| `NUXT_PUBLIC_GITHUB_ORG` | שם ארגון |
| `NUXT_PUBLIC_GITHUB_ENT` | שם enterprise |
| `NUXT_PUBLIC_GITHUB_TEAM` | סינון צוות (אופציונלי) |
| `NUXT_PUBLIC_IS_DATA_MOCKED` | `true` לנתוני דמה |
| `NUXT_PUBLIC_USING_GITHUB_AUTH` | הפעלת OAuth |
| `NUXT_PUBLIC_DOCS_URL` | נתיב או URL לתיעוד בפוטר (ברירת מחדל: `/docs` — אותו host, תיקיית `/docs`) |
| `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED` | `true` (ברירת מחדל) — שליפת PRU לפי משתמש מ-Billing API. `false` — תג **בקרוב**, ללא קריאות billing ל-PRU |
| `NUXT_PUBLIC_BRAND_LOGO_PATH` | נתיב ב-`public/` או URL מלא ללוגו בסרגל הצד (ברירת מחדל: `/brand/logo.png`) |
| `NUXT_PUBLIC_BRAND_LOGO_ALT` | טקסט `alt` ללוגו |
| `NUXT_PUBLIC_BRAND_APP_NAME` | שם האפליקציה (כותרת דף, פוטר) |
| `NUXT_PUBLIC_BRAND_META_DESCRIPTION` | תיאור `<meta name="description">` |
| `NUXT_PUBLIC_BRAND_FOOTER_PROJECT_URL` | קישור הפרויקט בפוטר |
| `NUXT_PUBLIC_BRAND_FAVICON_PATH` | נתיב או URL ל-favicon (ברירת מחדל: `/brand/logo.png`) |

## שרת

| משתנה | תיאור |
|--------|--------|
| `NUXT_GITHUB_TOKEN` | PAT |
| `NUXT_SESSION_PASSWORD` | ≥32 תווים |
| `NUXT_OAUTH_GITHUB_CLIENT_ID` | OAuth |
| `NUXT_OAUTH_GITHUB_CLIENT_SECRET` | OAuth |
| `NUXT_OAUTH_GITHUB_CLIENT_SCOPE` | scopes נוספים |
| `HTTP_PROXY` / `CUSTOM_CA_PATH` | פרוקסי ארגוני |
| `NITRO_PORT` | פורט (ברירת מחדל 80 ב-Docker) |

## Premium credits (Users tab)

Per-user PRU is loaded from the billing API in batches of 10 (`POST /api/user-premium-credits`), cached on the server for 10 minutes.

כיבוי זמני (מומלץ עד ש-IP allow list / enterprise billing מוכנים):

```bash
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false
```

ראו [קרדיט פרימיום](../user-guide/ui-reference/premium-credits).

| מקור | מה מקבלים |
|------|-----------|
| `GET .../orgs/{org}/.../premium_request/usage` (ללא `user`) | סיכום לפי מודל בלבד |
| אותו endpoint + `?user={login}` | PRU לפי משתמש — **חסום** בארגון בבעלות enterprise |
| `GET .../enterprises/{ent}/.../premium_request/usage?organization=&user=` | PRU לפי משתמש — דורש `NUXT_PUBLIC_GITHUB_ENT` + `admin:enterprise` |
