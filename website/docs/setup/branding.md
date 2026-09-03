---
title: מיתוג והתאמה אישית
---

# מיתוג (לוגו, שם, צבעים)

התאימו את הלוח לזהות הארגון באמצעות משתני סביבה — ללא שינוי קוד.

## קבצים

```
public/brand/
  logo.png          ← לוגו בסרגל (ברירת מחדל)
  favicon.svg       ← אייקון (אופציונלי)
app/assets/brand-tokens.css   ← צבעי מותג (סגול Menora / ברירת מחדל)
```

## משתני סביבה

| משתנה | תיאור |
|--------|--------|
| `NUXT_PUBLIC_BRAND_LOGO_PATH` | נתיב ב-`public/` או URL מלא (ברירת מחדל: `/brand/logo.png`) |
| `NUXT_PUBLIC_BRAND_LOGO_ALT` | טקסט `alt` ללוגו |
| `NUXT_PUBLIC_BRAND_APP_NAME` | שם האפליקציה (כותרת, פוטר) |
| `NUXT_PUBLIC_BRAND_META_DESCRIPTION` | `<meta name="description">` |
| `NUXT_PUBLIC_BRAND_FOOTER_PROJECT_URL` | קישור GitHub / פרויקט בפוטר |
| `NUXT_PUBLIC_BRAND_FAVICON_PATH` | Favicon |

דוגמה:

```env
NUXT_PUBLIC_BRAND_APP_NAME=Copilot Metrics — My Company
NUXT_PUBLIC_BRAND_LOGO_PATH=/brand/my-logo.png
NUXT_PUBLIC_BRAND_LOGO_ALT=My Company logo
```

## רכיבי UI ממותגים

הלוח משתמש ברכיבי `Brand*` (KPI, טבלאות, תרשימים) ו-Vuetify עם `--brand-*` מ-`brand-tokens.css`.

## תיעוד באותו host

```env
NUXT_PUBLIC_DOCS_URL=/docs
```

קישור **תיעוד** בפוטר — ראו [אפליקציה ואתר תיעוד](../reference/app-and-docs-site).

## קישורים

- [תחילת עבודה](./getting-started)
- [משתני סביבה](../reference/environment-variables)
