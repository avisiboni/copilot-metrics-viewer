---
title: אפליקציה ואתר תיעוד
---

# איך האפליקציה ואתר התיעוד עובדים יחד

Copilot Metrics Viewer מגיש את לוח הבקרה ואת התיעוד **מאותו host**, בתצורת **תיקיית נתיב** (לא subdomain):

| ממשק | טכנולוגיה | כתובת (דוגמה) | תפקיד |
|------|-----------|----------------|--------|
| **לוח הבקרה** | Nuxt 3 + Vuetify | `https://metrics.company.com/` | גרפים, טבלאות, סינון תאריכים |
| **תיעוד** | Docusaurus (סטטי, מוטמע) | `https://metrics.company.com/docs/` | מדריך משתמש, פריסה, API |

## ארכיטקטורה

```text
Route / Ingress (host אחד)
  │
  ├─ /              → Nuxt (אפליקציה + API)
  ├─ /api/*         → Nuxt Nitro
  └─ /docs/*        → קבצים סטטיים מ-public/docs/ (נבנה ב-docs:embed)
```

בזמן `npm run build` רצים `docs:embed` (Docusaurus עם `baseUrl=/docs/`) ואז `nuxt build`.

## קישור מהאפליקציה לתיעוד

- ברירת מחדל: `NUXT_PUBLIC_DOCS_URL=/docs` — קישור **תיעוד** בפוטר, באותו דפדפן (ללא טאב חדש).
- לעקיפה: הגדירו `NUXT_PUBLIC_DOCS_URL` לנתיב אחר או ל-URL מלא (יפתח בטאב חדש רק אם מתחיל ב-`http://` או `https://`).

## שפות (i18n)

| מקום | מנגנון |
|------|--------|
| אפליקציה | `shared/i18n` — עברית/אנגלית, `dir=rtl` לעברית |
| תיעוד | Docusaurus — עברית ב-`/docs/...`, אנגלית ב-`/docs/en/...` |

שינוי שפה באפליקציה **אינו** משנה אוטומטית את שפת התיעוד.

## פריסה (OpenShift / Docker)

1. **Image אחד** — `Dockerfile` בשורש הפרויקט.
2. **Route אחד** — אין Route נפרד ל-`docs.company.com`.
3. Build-arg: `DOCUSAURUS_URL=https://metrics.company.com` (לקישורי canonical בתיעוד).

ראו [OpenShift](../deployment/openshift).

## סנכרון תוכן אנגלית

מקור האמת בעברית: `website/docs/`.  
stubs באנגלית: `npm run docs:sync-en` (מתוך `website/`).
