---
title: הגדרות
---

# משתני סביבה (סיכום)

פרטים מלאים: [טבלת משתנים](../reference/environment-variables).

## חובה

| משתנה | תיאור |
|--------|--------|
| `NUXT_PUBLIC_SCOPE` | `organization` \| `enterprise` \| `team-*` |
| `NUXT_SESSION_PASSWORD` | מפתח הצפנה (≥32 תווים) |
| `NUXT_PUBLIC_GITHUB_ORG` או `NUXT_PUBLIC_GITHUB_ENT` | יעד API |

## אימות נתונים

| משתנה | תיאור |
|--------|--------|
| `NUXT_GITHUB_TOKEN` | PAT לשרת |
| `NUXT_PUBLIC_USING_GITHUB_AUTH` | OAuth / GitHub App |

## Premium credits (זמני)

```bash
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false
```

משבית שליפת PRU מ-Billing API; מציג **בקרוב** בלשונית Users. ראו [Premium credits](../user-guide/ui-reference/premium-credits).

## AI credits

```bash
NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true
```

ברירת מחדל **מופעלת** — עמודת **קרדיטי AI** ב-Users וב-Usage & billing. ראו [קרדיטי AI](../user-guide/ui-reference/ai-credits).

## דריסה ב-URL

- `/orgs/my-org`
- `/enterprises/my-ent`
- `?mock=true`
