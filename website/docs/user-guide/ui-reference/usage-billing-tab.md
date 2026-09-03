---
title: Usage & billing
---

# לשונית Usage & billing

![לשונית Usage & billing](/img/ui/usage-billing-tab.png)

משלב **דוחות Copilot metrics** (פעילות) עם **GitHub Billing Usage** (עלויות / PRU) כשה-API זמין.

## KPIs עליונים (דוגמאות)

| KPI | Tooltip (תמצית) |
|-----|------------------|
| Premium requests (PRU) | סך יחידות PRU בתקופה — שימוש חיוב מעבר למכסה |
| Models (premium) | מספר מודלים שגרמו לחיוב PRU |
| Users with PRU | משתמשים עם שימוש PRU בדוח |

## טבלת משתמשים

לוח מובילים עם עמודות נוספות (מודלים, עלות PRU) לעומת Users.

**רשימת עמודות מלאה:** [עמודות Usage & billing](./usage-billing-table-columns).

לחיצה על **שימוש** או על שם המשתמש פותחת את [דיאלוג פירוט משתמש](./user-usage-detail-dialog).

## תרשימים

- Premium requests by model  
- פילוחים נוספים לפי מודל/משתמש (כשיש נתוני billing)

## מקורות נתונים (פוטר)

| זמין | טקסט |
|------|------|
| כן | `users-28-day`, `user-teams-1-day`, `billing/usage`, `premium_request/usage` |
| לא | metrics בלבד — ללא endpoints חיוב |

---

כש-`NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false`:

- באנר מידע בראש הלשונית (כמו ב-Users).
- עמודת **Premium credits** — תג **בקרוב**; ללא KPIs PRU וללא תרשים premium-by-model.
- עמודת **PRU cost** מוסתרת; **Net spend** (SKU) נשאר כש-billing זמין.

ראו [Premium credits](./premium-credits) · [קרדיטי AI](./ai-credits).

## עמודת קרדיטי AI

עמודה **קרדיטי AI** בלוח המובילים (ברירת מחדל מופעלת). כמות + USD לכל משתמש. ראו [קרדיטי AI](./ai-credits).
