---
title: אימות
---

# אימות

האפליקציה תומכת במספר מצבים — נבחרים **רק** במשתני סביבה.

## PAT (ברירת מחדל)

```env
NUXT_GITHUB_TOKEN=ghp_...
NUXT_SESSION_PASSWORD=<32+ chars>
```

- הטוקן **בשרת בלבד** — הדפדפן לא רואה אותו.
- כל המבקרים רואים את אותם מדדים (ללא התחברות).
- הרשאות: Copilot metrics, `read:org`, `manage_billing:copilot` (לחיוב), ועוד — [scopes](../reference/scopes).

## OAuth — ספקים מרובים

```env
NUXT_PUBLIC_AUTH_PROVIDERS=github,microsoft,google
NUXT_PUBLIC_REQUIRE_AUTH=true
NUXT_OAUTH_GITHUB_CLIENT_ID=...
NUXT_OAUTH_GITHUB_CLIENT_SECRET=...
# + מפתחות לכל ספק פעיל
```

ספקים נתמכים: **GitHub**, **Google**, **Microsoft Entra ID**, **Auth0**, **Keycloak**.

לאחר פריסה — עדכנו Redirect URI (למשל `https://<host>/auth/github`).

### הגבלת גישה

```env
NUXT_AUTHORIZED_USERS=user1,user2@company.com
NUXT_AUTHORIZED_EMAIL_DOMAINS=company.com
```

## GitHub OAuth בלבד (legacy)

```env
NUXT_PUBLIC_USING_GITHUB_AUTH=true
NUXT_OAUTH_GITHUB_CLIENT_ID=...
NUXT_OAUTH_GITHUB_CLIENT_SECRET=...
```

מועדף להשתמש ב-`NUXT_PUBLIC_AUTH_PROVIDERS=github` במקום.

## GitHub App (installation token)

חלופה ל-PAT — ללא טוקן קבוע בשרת:

```env
NUXT_GITHUB_APP_ID=...
NUXT_GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
```

ראו [GitHub App Registration](https://github.com/github-copilot-resources/copilot-metrics-viewer/blob/main/DEPLOYMENT.md#github-app-registration).

## Microsoft Entra — סינון מנהל

נפרד מ-OAuth כניסה — MSAL לסינון דוחות ישירים:

```env
NUXT_PUBLIC_ENTRA_CLIENT_ID=...
NUXT_PUBLIC_ENTRA_TENANT_ID=...
```

[סינון לפי מנהל](./entra-manager-filter)

## קישורים

- [תחילת עבודה](./getting-started)
- [משתני סביבה](../reference/environment-variables)
