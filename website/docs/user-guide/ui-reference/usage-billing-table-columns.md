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
| 4 | **קרדיטי AI** *(מותנה)* | `ai_credits` | מוצג כש-`NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true` **ו**-Billing זמין — `billing.colAiCreditsHint` · [קרדיטי AI](./ai-credits) |
| 5 | **עלות PRU** *(מותנה)* | `pruNetAmount` | מוצג רק כש-PRU fetch פעיל **ו**-Billing זמין — `billing.colPruCostHint` |
| 6 | **אינטראקציות** | `interactions` | סיכום מתוך דוח משתמשים |
| 7 | **יצירות** | `generations` | `billing.colGenerationsHint` |
| 8 | **קבלת הצעת קוד** | `acceptances` | `billing.colAcceptancesHint` |
| 9 | **שורות שנוספו** | `locAdded` | `billing.colLocAddedHint` |
| 10 | **מודלים** | `modelCount` | מספר מודלים שונים — `billing.colModelsHint` |
| 11 | **מודל מוביל** | `topModel` | מודל עם הכי הרבה אינטראקציות — `billing.colTopModelHint` |
| 12 | **סוכן** | `used_agent` | כן/לא — `billing.colAgentHint` |
| 13 | **צ'אט** | `used_chat` | כן/לא — `billing.colChatHint` |

:::info סדר עמודות
**קרדיטי AI** ו-**עלות PRU** מוכנסים אחרי **דפוס שימוש** רק כשהתנאים מתקיימים; אחרת העמודות הבאות נסגרות למעלה.
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

מקור: GitHub Billing Usage API — ראו [קרדיטי AI](./ai-credits), [Premium credits](./premium-credits) ו-[תקלות Billing](../../troubleshooting/billing-api).

## קישורים

- [לשונית Usage & billing](./usage-billing-tab)
- [עמודות Users](./users-table-columns) (טבלה דומה, ללא מודלים/PRU)
- [דיאלוג משתמש](./user-usage-detail-dialog)
