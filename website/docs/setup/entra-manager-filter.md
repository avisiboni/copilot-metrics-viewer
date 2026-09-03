---
title: סינון לפי מנהל (Entra ID)
---

# סינון לפי מנהל — Microsoft Entra ID

מאפשר לסנן את לוח המדדים ל**דוחות ישירים** של מנהל ב-Azure AD / Entra ID, באמצעות Microsoft Graph.

## הפעלה

```env
NUXT_PUBLIC_ENTRA_CLIENT_ID=<app-registration-client-id>
NUXT_PUBLIC_ENTRA_TENANT_ID=<tenant-id>   # אופציונלי; common לרב-דיירים
```

ללא משתנים אלה — רכיב הסינון לא יוצג (או יוצג רק במצב mock).

## זרימת משתמש

1. המשתמש לוחץ **התחברות עם Microsoft** (MSAL).
2. מחפש מנהל לפי שם/UPN (`GET /api/org-search`).
3. בוחר מנהל → הלוח מסתנן לעובדים שמדווחים אליו (`reports-to:` scope).

## כתובות URL

```
/orgs/<org>/reportsto/<encoded-upn>
/enterprises/<ent>/reportsto/<encoded-upn>
```

## API פנימי

| נתיב | תפקיד |
|------|--------|
| `GET /api/org-search` | חיפוש משתמשים/מנהלים |
| `GET /api/org-reports` | רשימת דוחות ישירים למנהל |
| `GET /api/msal/callback` | הפניה אחרי MSAL |

## הרשאות Graph

ב-App Registration ב-Azure Portal — הרשאות מתאימות לקריאת מבנה ארגון (למשל `User.Read`, `User.Read.All` לפי מדיניות הארגון). התאימו ל-least privilege שלכם.

## קישורים

- [אימות](./authentication)
- [משתני סביבה](../reference/environment-variables)
