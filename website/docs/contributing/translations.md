---
title: ניהול תרגומים
---

# ניהול תרגומים (מפתחים)

אנו משתמשים ב-**Git-based i18n** של Docusaurus ([המלצה רשמית](https://docusaurus.io/docs/i18n/git)).

## מבנה

| שפה | מיקום |
|-----|--------|
| עברית (ברירת מחדל) | `website/docs/` |
| English | `website/i18n/en/docusaurus-plugin-content-docs/current/` |

- עברית: `/docs/...`
- English: `/en/docs/...`

## כללי עבודה למפתחים

1. **כתבו תחילה בעברית** — זו שפת ברירת המחדל.
2. **שכפלו נתיב** — אותו שם קובץ תחת `i18n/en/.../current/`.
3. **שמרו על אותם `slug`** — אל תשנו front matter slug בין שפות.
4. **קוד ושמות טכניים ב-LTR** — עטפו ב-backticks: `manage_billing:copilot`.
5. **PR checklist**:
   - [ ] עודכן `website/docs/...`
   - [ ] עודכן `website/i18n/en/...` (או סומן TODO באנגלית)
   - [ ] `npm run build` ב-`website/` עובר

## עדכון מחרוזות UI

```bash
cd website
npm run write-translations -- --locale en
```

פקודה זו מעדכנת `i18n/en/code.json` וקבצי theme — **לא** דורסת תרגומים קיימים.

## סנכרון מסמכים חדשים

```bash
npm run docs:sync-en
```

(ראו `website/package.json`) — מעתיק קבצים חסרים לאנגלית עם באנר "TODO: translate".

## עתיד: Crowdin / Lokalise

אם תצטרכו מתרגמים חיצוניים — [Crowdin + Docusaurus](https://docusaurus.io/docs/i18n/crowdin). עד אז: **מפתחי הצוות אחראים על EN**.

## עריכה מקומית

```bash
npm start          # he @ :3000
npm run start:en   # en @ :3000/en
```

`editLocalizedFiles: true` — קישור "Edit this page" מצביע על הקובץ המתורגם הנכון.
