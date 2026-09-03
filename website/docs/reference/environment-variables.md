---
title: משתני סביבה
---

# משתני סביבה

מקור מלא: `.env.example` ו-[DEPLOYMENT.md](https://github.com/github-copilot-resources/copilot-metrics-viewer/blob/main/DEPLOYMENT.md).

## ליבה (`NUXT_PUBLIC_*`)

| משתנה | תיאור |
|--------|--------|
| `NUXT_PUBLIC_SCOPE` | `organization` או `enterprise` (ערכי `team-*` ישנים מנורמלים אוטומטית) |
| `NUXT_PUBLIC_GITHUB_ORG` | שם ארגון |
| `NUXT_PUBLIC_GITHUB_ENT` | שם enterprise |
| `NUXT_PUBLIC_GITHUB_TEAM` | סינון צוות קבוע (אופציונלי) |
| `NUXT_PUBLIC_IS_DATA_MOCKED` | `true` לנתוני דמה |
| `NUXT_PUBLIC_HIDDEN_TABS` | רשימה מופרדת בפסיקים — לשוניות להסתרה (למשל `languages,editors`) |

## מצב היסטורי ו-API

| משתנה | תיאור |
|--------|--------|
| `ENABLE_HISTORICAL_MODE` | שרת: קריאה מ-PostgreSQL, sync, `seats-history` |
| `NUXT_PUBLIC_ENABLE_HISTORICAL_MODE` | ממשק: תכונות תלויות היסטוריה |
| `DATABASE_URL` | חיבור PostgreSQL |
| `SYNC_ENABLED` | `true` בתהליך sync בלבד |
| `SYNC_SCHEDULE` / `SYNC_DAYS_BACK` | לוח sync (ראו DEPLOYMENT) |
| `USE_LEGACY_API` | `false` — API ישן הושבת (2026) |
| `NUXT_GITHUB_API_BASE_URL` | בסיס API ל-GitHub Enterprise (GHE.com) |

## אימות

| משתנה | תיאור |
|--------|--------|
| `NUXT_GITHUB_TOKEN` | PAT (מצב ללא התחברות משתמש) |
| `NUXT_SESSION_PASSWORD` | ≥32 תווים |
| `NUXT_PUBLIC_USING_GITHUB_AUTH` | OAuth GitHub בלבד (legacy) |
| `NUXT_PUBLIC_AUTH_PROVIDERS` | `github,google,microsoft,auth0,keycloak` |
| `NUXT_PUBLIC_REQUIRE_AUTH` | חובת התחברות |
| `NUXT_OAUTH_*` | מפתחות לכל ספק |
| `NUXT_GITHUB_APP_ID` / `NUXT_GITHUB_APP_PRIVATE_KEY` | GitHub App (חלופה ל-PAT) |
| `NUXT_AUTHORIZED_USERS` | רשימת משתמשים מורשים |
| `NUXT_AUTHORIZED_EMAIL_DOMAINS` | דומיינים מורשים |

## תכונות ממשק

| משתנה | תיאור |
|--------|--------|
| `NUXT_PUBLIC_ENABLE_AI_CHAT` | עוזר AI (ברירת מחדל `true`) |
| `NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS` | פאנל קוהורטות AI adoption + צ'יפים (ברירת מחדל **מוסתר**) |
| `NUXT_PUBLIC_ADOPTION_IDE_ONLY` | כש-cohorts מופעלים: רק שלבים 0+1 (IDE) |
| `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED` | שליפת PRU לפי משתמש |
| `NUXT_PUBLIC_ENTERPRISE_PREMIUM_QUOTA` | מכסת פרימיום Enterprise (תצוגה) |
| `NUXT_PUBLIC_ENTRA_CLIENT_ID` / `TENANT_ID` | סינון מנהל Entra |
| `NUXT_PUBLIC_DOCS_URL` | קישור תיעוד (ברירת מחדל `/docs`) |

## מיתוג

| משתנה | תיאור |
|--------|--------|
| `NUXT_PUBLIC_BRAND_LOGO_PATH` | לוגו |
| `NUXT_PUBLIC_BRAND_LOGO_ALT` | alt |
| `NUXT_PUBLIC_BRAND_APP_NAME` | שם אפליקציה |
| `NUXT_PUBLIC_BRAND_META_DESCRIPTION` | meta description |
| `NUXT_PUBLIC_BRAND_FOOTER_PROJECT_URL` | קישור פוטר |
| `NUXT_PUBLIC_BRAND_FAVICON_PATH` | favicon |

ראו [מיתוג](../setup/branding).

## רשת

| משתנה | תיאור |
|--------|--------|
| `HTTP_PROXY` / `CUSTOM_CA_PATH` | פרוקסי / CA ארגוני |
| `NITRO_PORT` | פורט (80 ב-Docker) |

## Premium credits

```bash
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false
```

מבטל קריאות billing ל-PRU לפי משתמש; מציג **בקרוב**. מדדי שימוש ממשיכים.

## AI credits

```bash
# ברירת מחדל — מופעל
NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true
```

| `true` (ברירת מחדל) | `false` |
|---------------------|---------|
| עמודת **קרדיטי AI** ב-Users וב-Usage & billing | עמודה מציגה מקף; אין קריאות `ai_credit/usage` |

דורש `manage_billing:copilot` (org) או enterprise billing + `NUXT_PUBLIC_GITHUB_ENT` לארגונים בבעלות enterprise.

ראו [קרדיטי AI](../user-guide/ui-reference/ai-credits).

## קוהורטות AI adoption

```bash
# ברירת מחדל — מוסתר (מתאים ל-Copilot ב-IDE בלבד)
NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS=false

# להצגה מחדש:
NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS=true
NUXT_PUBLIC_ADOPTION_IDE_ONLY=true   # אופציונלי: רק ללא cohort / Code first
```

ראו [קוהורטות AI adoption](../user-guide/ui-reference/ai-adoption-cohorts).

ראו [קרדיט פרימיום](../user-guide/ui-reference/premium-credits) · [קרדיטי AI](../user-guide/ui-reference/ai-credits).
