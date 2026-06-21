---
title: קרדיט פרימיום (PRU)
---

# Premium credits (PRU)

**Premium Request Units (PRU)** — מדד חיוב לשימוש במודלים פרימיום מעבר למכסה הכלולה ברישיון Copilot.

## שני מקורות שונים ב-GitHub

| מקור | API | מה מקבלים |
|------|-----|-----------|
| **מדדי שימוש** | `/copilot/metrics/reports/users-*` | אינטראקציות, שורות, Agent/Chat — **ללא PRU** |
| **חיוב** | `/settings/billing/premium_request/usage` | PRU לפי מודל / משתמש |

האפליקציה משתמשת בשניהם בנפרד. ייצוא CSV **אינו** כולל PRU. לקרדיטי AI (מדד חיוב נפרד) ראו [קרדיטי AI](./ai-credits).

## דגל: השבתה זמנית

```bash
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false
```

| כשהדגל `false` | כשהדגל `true` (ברירת מחדל) |
|----------------|----------------------------|
| אין קריאות `?user=` ל-org billing | ניסיון שליפה לפי משתמש |
| תג **בקרוב** בעמודה | פס התקדמות / N/A |
| אין שגיאות 403 בטרמינל | עלולות שגיאות אם enterprise חוסם |

## למה 403 מופיע (כשהדגל `true`)

1. **ארגון בבעלות Enterprise** — GitHub חוסם `?user=` ב-org API.  
   הודעה: *Organization admins for enterprise owned organizations cannot filter usage by user*.
2. **פתרון:** API ברמת `enterprises/{ent}/.../premium_request/usage?organization=&user=`.
3. **מגבלת רשת:** Enterprise עם **IP allow list** — גם עם PAT מלא.

ראו [תקלות Billing API](../../troubleshooting/billing-api).

## הפעלה מחדש

1. הוסיפו IP מורשה ב-enterprise (או הריצו מהרשת המורשית).
2. הגדירו `NUXT_PUBLIC_GITHUB_ENT`.
3. PAT קלאסי עם `manage_billing:enterprise` / `admin:enterprise`.
4. `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=true`
5. הפעילו מחדש את השרת.

## מטמון

- אצוות של **10** משתמשים לבקשה.
- מטמון שרת **10 דקות** למפתח (ארגון + טווח + משתמש).
