---
title: Translations
---

# Translation workflow (developers)

We use [Docusaurus Git-based i18n](https://docusaurus.io/docs/i18n/git).

| Language | Path |
|----------|------|
| Hebrew (default) | `website/docs/` |
| English | `website/i18n/en/docusaurus-plugin-content-docs/current/` |

## Rules

1. Write Hebrew first in `website/docs/`.
2. Mirror the same path in `website/i18n/en/...`.
3. Keep slugs identical.
4. Use backticks for LTR technical strings.
5. PR checklist: both locales + `npm run build` in `website/`.

## Commands

```bash
npm run write-translations -- --locale en
npm run docs:sync-en
npm start       # Hebrew
npm run start:en
```

Professional translators (Crowdin) can be added later; until then **developers maintain English**.
