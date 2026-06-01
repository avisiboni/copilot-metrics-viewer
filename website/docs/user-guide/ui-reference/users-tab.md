---
title: לשונית Users
---

# לשונית Users — שימוש Copilot לפי משתמש

![לשונית Users](/img/ui/users-tab.png)

מקור נתונים: דוח GitHub **Copilot usage metrics**  
`GET .../copilot/metrics/reports/users-28-day/latest` (או `users-1-day?day=`).

זה **לא** אותו API כמו חיוב Premium requests — ראו [הבדל מדדים מול חיוב](../../reference/app-and-docs-site).

## אזורים במסך

### כותרת

**שימוש Copilot לפי משתמש** — סיכום טווח הדוח (28 יום או יום בודד).

### באנר «קרדיט פרימיום — בקרוב»

מוצג כאשר `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false`:

- אין קריאות ל-Billing API.
- עמודת **Premium credits** מציגה תג **בקרוב**.
- שאר העמודות נטענות כרגיל.

פרטים: [Premium credits](./premium-credits).

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
```

---

הבא: [עמודות הטבלה](./users-table-columns) · [דיאלוג פירוט](./user-usage-detail-dialog) (ב-Usage & billing)
