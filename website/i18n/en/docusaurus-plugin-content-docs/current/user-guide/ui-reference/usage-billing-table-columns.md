---
# TODO: Translate to English — source of truth is Hebrew in website/docs/
---

---
title: עמודות Usage & billing
---

# עמודות — לוח מובילים (Usage & billing)

![לשונית Usage & billing](/img/ui/usage-billing-tab.png)

טבלת **לוח מובילים משתמשים** בלשונית Usage & billing (`UsageBillingViewer`). לחיצה על **שימוש** או על שם המשתמש פותחת את [דיאלוג פירוט השימוש](./user-usage-detail-dialog).

| # | עמודה | מפתח | הסבר |
|---|--------|------|------|
| 1 | **משתמש** | `user_login` | כמו ב-Users — `billing.colUserHint` |
| 2 | **שימוש** | `usageDetail` | כפתור לדיאלוג — `billing.colUsageHint` |
| 3 | **דפוס שימוש** | `usage_pattern` | צ'יפ היוריסטי — `usagePattern.colPatternHint` · [דפוסי שימוש](../usage-patterns) |
| 4 | **עלות PRU** *(מותנה)* | `pruNetAmount` | מוצג רק כש-PRU fetch פעיל **ו**-Billing זמין — `billing.colPruCostHint` |
| 5 | **אינטראקציות** | `interactions` | סיכום מתוך דוח משתמשים |
| 6 | **יצירות** | `generations` | `billing.colGenerationsHint` |
| 7 | **קבלת הצעת קוד** | `acceptances` | `billing.colAcceptancesHint` |
| 8 | **שורות שנוספו** | `locAdded` | `billing.colLocAddedHint` |
| 9 | **מודלים** | `modelCount` | מספר מודלים שונים — `billing.colModelsHint` |
| 10 | **מודל מוביל** | `topModel` | מודל עם הכי הרבה אינטראקציות — `billing.colTopModelHint` |
| 11 | **סוכן** | `used_agent` | כן/לא — `billing.colAgentHint` |
| 12 | **צ'אט** | `used_chat` | כן/לא — `billing.colChatHint` |

:::info סדר עמודות
**עלות PRU** מוכנסת אחרי **דפוס שימוש** (מיקום 4) רק כשהתנאים מתקיימים; אחרת העמודות 5–12 נסגרות למעלה.
:::

## דיאלוג פירוט SKU (Net spend)

כשלוחצים על KPI **סה״כ הוצאה נטו** — טבלה ב-`BillingSkuDetailDialog`:

| עמודה | מפתח | הסבר |
|--------|------|------|
| **SKU** | `sku` | מזהה שורת חיוב |
| **כמות** | `quantity` | כמות יחידות |
| **ברוטו** | `grossAmount` | סכום ברוטו |
| **נטו** | `netAmount` | סכום נטו |
| **% מהוצאה נטו** | `shareOfSpend` | חלק מההוצאה הכוללת בתקופה |

מקור: GitHub Billing Usage API — ראו [Premium credits](./premium-credits) ו-[תקלות Billing](../../troubleshooting/billing-api).

## קישורים

- [לשונית Usage & billing](./usage-billing-tab)
- [עמודות Users](./users-table-columns) (טבלה דומה, ללא מודלים/PRU)
- [דיאלוג משתמש](./user-usage-detail-dialog)
