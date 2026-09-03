---
title: משתמשים
---

# לשונית Users

טבלת **שימוש לפי משתמש** מהדוח users-28-day (או users-1-day ליום בודד).

:::info מדריך מפורט
[לשונית Users (מלא)](./ui-reference/users-tab) · [5 המובילים בשימוש יעיל](#5-המובילים-בשימוש-יעיל-ב-copilot) · [עמודות הטבלה](./ui-reference/users-table-columns) · [קרדיטי AI](./ui-reference/ai-credits) · [Premium credits / בקרוב](./ui-reference/premium-credits) · [דפוסי שימוש](./usage-patterns) · [קוהורטות AI adoption](./ui-reference/ai-adoption-cohorts) (מוסתר כברירת מחדל)
:::

![צילום מסך של לשונית Users](/img/ui/users-tab.png)

## 5 המובילים בשימוש יעיל ב-Copilot

מעל המסננים מופיע שורת **5 כרטיסי KPI** — המשתמשים עם **ציון היעילות** הגבוה ביותר בטווח הדוח (דפוס שימוש + קבלה + נפח פעילות אמיתי, לא רק «הכי הרבה קליקים»).

| בכרטיס | משמעות |
|--------|---------|
| דירוג (#1–#5) | מיקום לפי ציון יעילות |
| ציון יעילות | 0–100 — `computeCopilotQualityScore` (ראו [דפוסי שימוש](./usage-patterns#ציון-יעילות-מול-ציון-מעורבות)) |
| פירוט פעילות | אינטראקציות · יצירות · קבלות |
| דפוס שימוש | אותו צ'יפ כמו בטבלה |

לחיצה על כרטיס פותחת את [דיאלוג פירוט השימוש](./ui-reference/user-usage-detail-dialog). זה **לא** ציון איכות קוד או דירוג ביצועים — ראו [דפוסי שימוש](./usage-patterns).

:::info
אם אין משתמש עם ציון יעילות &gt; 0, השורה לא מוצגת. סינון «משתמש אחד» בטבלה **לא** משנה את חמשת המובילים — הם תמיד מחושבים מול **כל** המשתמשים בטווח.
:::

## עמודות הטבלה

טבלה עם 9 עמודות (User, שימוש, דפוס שימוש, אינטראקציות, יצירות, קבלות, שורות, Agent, Chat).

**תיעוד מלא לכל עמודה:** [עמודות Users](./ui-reference/users-table-columns).

שלב **AI adoption** ו-**Premium credits** — בדיאלוג שימוש / Usage & billing, לא בעמודות הטבלה ב-Users (ראו קישור למעלה).

## בדיקת סטטוס חיוב

כרטיס **Billing status** + **Check now** בודקים את GitHub Billing Usage API לטווח הנוכחי.

## מסננים

- **Filter by day** — דוח יומי (השאירו ריק ל-28 יום גלגוליים).
- **Filter by user** — התמקדות במשתמש אחד.
- חיפוש בטבלה.

:::info
אם Premium credits מציג **N/A** — ראו [תקלות Billing API](../troubleshooting/billing-api).
:::
