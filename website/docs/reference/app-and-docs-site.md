---
title: אפליקציה ואתר תיעוד
---

# איך האפליקציה ואתר התיעוד עובדים יחד

| ממשק | טכנולוגיה | כתובת (דוגמה) |
|------|-----------|----------------|
| **לוח הבקרה** | Nuxt 3 + Vuetify | `https://metrics.company.com/` |
| **תיעוד** | Docusaurus (סטטי) | `https://metrics.company.com/docs/` |

## ארכיטקטורה

```text
Route / Ingress (host אחד)
  ├─ /              → Nuxt
  ├─ /api/*         → Nitro
  └─ /docs/*        → public/docs/ (מ-docs:embed)
```

`npm run build` → `docs:embed` + `nuxt build`.

## קישור מהאפליקציה

`NUXT_PUBLIC_DOCS_URL=/docs` (ברירת מחדל) — פוטר **תיעוד**.

## שפות

| מקום | נתיב |
|------|------|
| אפליקציה | עברית/אנגלית — `shared/i18n`, RTL |
| תיעוד עברית | `/docs/...` |
| תיעוד אנגלית | `/en/docs/...` |

שינוי שפה באפליקציה **אינו** משנה אוטומטית את שפת התיעוד.

## פיתוח תיעוד

```bash
npm run docs:dev      # http://localhost:3001
npm run docs:dev:en   # /en
```

## סנכרון אנגלית

```bash
cd website && npm run docs:sync-en
```

מקור: `website/docs/` (עברית). מראה: `website/i18n/en/docusaurus-plugin-content-docs/current/`.
