---
title: לשונית Users
---

# לשונית Users — שימוש Copilot לפי משתמש

![לשונית Users](/img/ui/users-tab.png)

מקור נתונים: דוח GitHub **Copilot usage metrics**  
`GET .../copilot/metrics/reports/users-28-day/latest` (או `users-1-day?day=`).

זה **לא** אותו API כמו חיוב Premium requests — ראו [הבדל מדדים מול חיוב](../../reference/app-and-docs-site).

:::info קוהורטות AI adoption
פאנל **קוהורטות AI adoption** מוסתר כברירת מחדל. להצגה: `NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS=true` — [תיעוד](./ai-adoption-cohorts).
:::

## אזורים במסך

### כותרת

**שימוש Copilot לפי משתמש** — סיכום טווח הדוח (28 יום או יום בודד).

### באנר «קרדיט פרימיום — בקרוב»

מוצג כאשר `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false`:

- אין קריאות ל-Billing API.
- עמודת **Premium credits** מציגה תג **בקרוב**.
- שאר העמודות נטענות כרגיל.

פרטים: [Premium credits](./premium-credits).

### עמודת קרדיטי AI (ברירת מחדל)

כאשר `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true` (ברירת מחדל):

- עמודה **קרדיטי AI** בטבלה — כמות + USD לתקופת החיוב.
- טעינה ברקע באצוות של 10 (`/api/user-ai-credits`).
- באנר התקדמות בזמן טעינה.

פרטים: [קרדיטי AI](./ai-credits).

### 5 המובילים בשימוש יעיל ב-Copilot (KPI)

שורת כרטיסים **מעל המסננים** (אחרי פאנל AI adoption, אם מוצג):

| רכיב | הסבר |
|------|------|
| כותרת | **5 המובילים בשימוש יעיל ב-Copilot** + tooltip |
| עד 5 כרטיסים | משתמשים עם **ציון יעילות** (`computeCopilotQualityScore`) הגבוה ביותר בקוהורט |
| ערך מרכזי | **ציון יעילות** 0–100 — דפוס שימוש + שיעור קבלה + נפח פעילות אמיתי (לא נפח בלבד) |
| רמז | אינטראקציות · יצירות · קבלות |
| צ'יפ | דפוס שימוש (אותו רכיב כמו בעמודה בטבלה) |
| לחיצה | פותחת [דיאלוג פירוט שימוש](./user-usage-detail-dialog) |

**חישוב:** `pickTopUsersByCopilotQuality` ב-`shared/utils/users-top-kpi.ts` — ממיין לפי ציון יעילות; משתמשים עם דפוסים «רדומים» (שימוש חלש, הרבה ניסיונות מעט שמירה וכו') **לא** יופיעו. שובר שוויון לפי סך פעילות ואז לוגין. לוגיקה: `shared/utils/copilot-quality-score.ts`.

:::caution לא דירוג ביצועים
הכרטיסים מציגים **שימוש יעיל יחסי** (דפוס + קבלה + פעילות) — לא «מי הכי טוב» ולא ציון איכות קוד. אל תשתמשו בדירוג ל-HR או bonus. בדיאלוג **שימוש** עדיין מוצג **ציון מעורבות** נפרד — ראו [דפוסי שימוש](../usage-patterns#ציון-יעילות-מול-ציון-מעורבות).
:::

השורה מוסתרת כשאין משתמש עם ציון יעילות &gt; 0.

### כרטיס סטטוס חיוב (כש-PRU מופעל)

| רכיב | הסבר |
|------|------|
| **סטטוס חיוב** | בודק זמינות GitHub Billing Usage API לטווח הנוכחי |
| **בדוק עכשיו** | קורא `/api/billing-status` ומרענן את העמודה |

**Tooltip:** דורש `manage_billing:copilot` והרשאות admin לחיוב.

### מסננים

| מסנן | הסבר |
|------|------|
| סינון לפי יום | דוח `users-1-day` לתאריך אחד; ריק = 28 יום אחרונים |
| סינון לפי משתמש | מצמצם את הטבלה ללוגין אחד |
| החל מסננים | טוען מחדש מ-`/api/user-metrics` |

### טבלה

כותרת **משתמשים**, חיפוש טקסט חופשי, 15 שורות בעמוד.

עמודות — [טבלת Users — עמודות](./users-table-columns).

## זרימת נתונים (טכני קצר)

```text
/api/user-metrics → users-28-day (metrics API)
                 → (אופציונלי) /api/user-premium-credits בקבוצות של 10
                 → (אופציונלי) /api/user-ai-credits בקבוצות של 10
```

---

הבא: [עמודות הטבלה](./users-table-columns) · [דיאלוג פירוט](./user-usage-detail-dialog) (ב-Usage & billing)
