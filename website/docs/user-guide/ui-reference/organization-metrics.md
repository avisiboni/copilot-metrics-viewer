---
title: Organization — KPI ותרשימים
---

# לשונית Organization — KPIs ותרשימים

![דוגמת לוח](/img/ui/dashboard-example.png)

מקור: דוחות `organization-1-day` / `organization-28-day/latest` (Copilot **usage metrics** API).

## KPIs (כרטיסים עליונים)

| KPI (EN) | הסבר (Tooltip) |
|----------|----------------|
| Acceptance Rate (by count) | אחוז הצעות שאושרו מתוך סך ההצעות (לפי מספר prompts) |
| Total Suggestions Count | נפח הצעות יומי |
| Acceptance Rate (by lines) | אחוז שורות שהוצעו ואושרו |
| Total Lines Suggested | שורות שהוצעו מול שורות שאושרו |
| Total Active Users | משתמשים פעילים יומיים |
| DAU / WAU / MAU | משתמשים ייחודיים יומיים / שבועיים / חודשיים |

אייקון ⓘ בכל כרטיס — `metrics.*` / `aboutKpi` ב-i18n.

## קוהורטות AI adoption

מעל התרשימים מופיע (כשה-API מחזיר נתונים) פאנל **קוהורטות AI adoption** — KPI לפי שלב, גרף משתמשים מעורבים, וטבלת ממוצעים לפי שלב.

![פאנל קוהורטות](/img/ui/ai-adoption-organization-panel.png)

פרטים מלאים: [קוהורטות AI adoption](./ai-adoption-cohorts).

## תרשימים

| תרשים | הסבר (תמצית) |
|--------|----------------|
| Acceptance rate by count (%) | מגמת איכות הצעות לאורך זמן |
| Total Suggestions \| Acceptances | נפח מול קבלת הצעת קוד |
| Acceptance rate by lines (%) | איכות ברמת שורות |
| Total Lines Suggested \| Accepted | נפח שורות קוד |
| Total Active Users | אימוץ — משתמשים פעילים |
| DAU / WAU / MAU | מעורבות לאורך זמן |

טקסטים מלאים: `charts.*` ב-`shared/i18n/locales/he.ts` / `en.ts`.

## מה לא מופיע כאן

- **PRU / Premium credits** — רק ב-Users / Usage & billing (Billing API).
- **עלות כספית** — Usage & billing (כשזמין).
