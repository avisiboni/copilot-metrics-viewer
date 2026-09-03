---
title: סקירת ממשק
---

# מדריך רכיבי ממשק (UI reference)

מדריך זה משלים את [מדריך המשתמש](../overview): לכל רכיב יש הסבר כמו ב-Tooltip של האפליקציה, עם צילומי מסך.

## מבנה הלוח

![מבט כללי על הלוח](/img/ui/dashboard-overview.png)

| נושא | עמוד |
|------|------|
| סרגל צד, כותרת, טווח תאריכים, שפה | [מעטפת וניווט](./shell-navigation) |
| לשונית Organization — KPI ותרשימים | [Organization](./organization-metrics) |
| קוהורטות AI adoption (שלבי אימוץ) | [AI adoption cohorts](./ai-adoption-cohorts) |
| לשונית Users — טבלה ועמודות | [Users](./users-tab) · [עמודות Users](./users-table-columns) |
| **דפוסי שימוש** — סיווג, ציון יעילות, נוסחאות | [דפוסי שימוש](../usage-patterns) |
| קרדיט פרימיום / PRU / דגל בקרוב | [Premium credits](./premium-credits) |
| **קרדיטי AI** לפי משתמש | [AI credits](./ai-credits) |
| דיאלוג פירוט משתמש | [דיאלוג שימוש](./user-usage-detail-dialog) |
| Usage & billing | [Usage & billing](./usage-billing-tab) · [עמודות](./usage-billing-table-columns) |
| Seat analysis — טבלאות | [ניתוח מושבים](../seat-analysis) · [עמודות](./seat-analysis-table-columns) |
| Languages / Editors | [עמודות פירוט](./breakdown-table-columns) |
| Usage insights — טבלאות מודל | [עמודות](./usage-insights-table-columns) |
| ייצוא CSV | [ייצוא](../export) |

## לשוניות נוספות

| לשונית | תוכן עיקרי | צילום מסך |
|--------|------------|-----------|
| Teams | השוואת צוותים לפי דוח `user-teams-1-day` | [teams-tab.png](/img/ui/teams-tab.png) |
| Languages | פילוח לפי שפת תכנות | [languages-tab.png](/img/ui/languages-tab.png) |
| Editors | פילוח לפי עורך IDE | [editors-tab.png](/img/ui/editors-tab.png) |
| Copilot Chat | מדדי צ'אט | [copilot-chat-tab.png](/img/ui/copilot-chat-tab.png) |
| Usage insights | מודלים, תכונות, DAU/WAU/MAU | [usage-insights-tab.png](/img/ui/usage-insights-tab.png) · [תיעוד](../usage-insights) |
| Seat analysis | מושבים מוקצים / לא בשימוש | [seat-analysis-tab.png](/img/ui/seat-analysis-tab.png) · [תיעוד](../seat-analysis) |
| API response | JSON גולמי + הורדת CSV/NDJSON | [api-response-tab.png](/img/ui/api-response-tab.png) |

## אייקון מידע (ⓘ)

ברחבי האפליקציה, אייקון **mdi-information-outline** פותח Tooltip. הטקסטים מגיעים מ-`shared/i18n` (מפתחות `metrics.*`, `billing.*`, `userDetail.*`, `charts.*`).

---

המשך: בחרו עמוד מהטבלה לפי הלשונית שבה אתם עובדים.
