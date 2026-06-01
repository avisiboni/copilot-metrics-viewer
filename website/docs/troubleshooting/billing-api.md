---
title: API חיוב
---

# תקלות Billing API

## תסמינים

- עמודת **Premium credits** = `N/A`
- הודעה: **Billing API data not loaded** (ניתן לפתיחה)

## השבתה זמנית (ללא שגיאות 403 בטרמינל)

```bash
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false
```

האפליקציה תציג **בקרוב** בעמודת Premium credits; מדדי Users ימשיכו לעבוד.

## סיבות נפוצות

1. חסר scope `manage_billing:copilot` בטוקן / OAuth
2. המשתמש אינו admin עם גישה לחיוב
3. HTTP **404** — הארגון לא בפלטפורמת חיוב מתקדמת
4. HTTP **403** — אין הרשאה

## פתרון

1. הוסיפו `manage_billing:copilot` ל-PAT או ל-OAuth scopes
2. התנתקו והתחברו מחדש
3. בלשונית Users — **Check now** בכרטיס Billing status
4. ודאו admin org + enhanced billing ב-GitHub

## Scopes בדוגמה

```
copilot, manage_billing:copilot, read:org
```

שמות משתני סביבה ונתיבי API: [התייחסות](../reference/scopes).
