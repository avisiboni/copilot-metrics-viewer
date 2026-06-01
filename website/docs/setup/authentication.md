---
title: אימות
---

# אימות

## PAT (Personal Access Token)

הטוקן נשמר **בשרת בלבד** (`NUXT_GITHUB_TOKEN`). הדפדפן לא רואה אותו.

## GitHub App / OAuth

כאשר `NUXT_PUBLIC_USING_GITHUB_AUTH=true`:

- `NUXT_OAUTH_GITHUB_CLIENT_ID`
- `NUXT_OAUTH_GITHUB_CLIENT_SECRET`
- אופציונלי: `NUXT_OAUTH_GITHUB_CLIENT_SCOPE`

לאחר פריסה — עדכנו **Redirect URI** ל-`https://<host>/auth/github`.

## הרשאות

ראו [רשימת scopes](../reference/scopes).

:::warning
רק משתמשים עם הרשאות מתאימות ב-GitHub יראו נתונים — ה-API משתמש בהרשאות המשתמש המחובר.
:::
