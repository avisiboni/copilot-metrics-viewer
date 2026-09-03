---
title: קרדיטי AI
---

# קרדיטי AI (AI credits)

**קרדיטי AI** — מדד חיוב מ-GitHub לצריכת Copilot מעבר למכסה הכלולה (מודלים פרימיום, Agent וכו'). זמין ב-[Budget and usage management APIs](https://github.blog/changelog/2026-06-04-budget-and-usage-management-apis-now-generally-available/) (GA, יוני 2026).

## שני מקורות (עם שילוב)

| מקור | API / שדה | מה מקבלים |
|------|-----------|-----------|
| **מדדי שימוש** | `/copilot/metrics/reports/users-*` + שדה **`ai_credits_used`** | קרדיטי AI לפי משתמש ליום/28 יום — **מופיע מיד** עם דוח המשתמשים (יוני 2026) |
| **חיוב** | `/settings/billing/ai_credit/usage` | קרדיטים + **עלות נטו USD** לפי מודל/משתמש |

האפליקציה **מעדיפה billing** כשנטען (כולל USD), ומשתמשת ב-`ai_credits_used` מדוח המדדים כ**גיבוי/תצוגה מיידית** — מסומן «מדוח מדדי שימוש».

**מקור GitHub:** [AI credits consumed per user in usage metrics API](https://github.blog/changelog/2026-06-19-ai-credits-consumed-per-user-now-in-the-copilot-usage-metrics-api/)

קריאות לדוחות מדדים שולחות `X-GitHub-Api-Version: 2026-03-10` (דרישת GitHub ל-Copilot usage metrics).

ייצוא CSV **אינו** כולל קרדיטי AI.

## איפה רואים בלוח

| מיקום | מה מוצג |
|--------|---------|
| **Usage & billing** — עמודה **קרדיטי AI** | כמות + USD (כשזמין) לכל משתמש |
| **Users** — עמודה **קרדיטי AI** | מיד מ-`ai_credits_used`; USD מ-billing כשנטען |
| **דיאלוג שימוש** | כרטיס **קרדיטי AI (תקופת חיוב)** |

## דגל: השבתה

```bash
NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=false
```

| כשהדגל `false` | כשהדגל `true` (ברירת מחדל) |
|----------------|----------------------------|
| אין קריאות `ai_credit/usage?user=` | שליפה לפי משתמש |
| עמודה מציגה מקף | כמות קרדיטים + עלות |
| אין שגיאות billing בטרמינל | עלולות 403 אם enterprise חוסם |

## למה 403 / «לא ב-API ארגון»

1. **ארגון בבעלות Enterprise** — GitHub חוסם `?user=` ב-org billing API.  
   הודעה: *Organization admins for enterprise owned organizations cannot filter usage by user*.
2. **פתרון:** API ברמת `enterprises/{ent}/.../ai_credit/usage?organization=&user=`.
3. **מגבלת רשת:** Enterprise עם **IP allow list** — גם עם PAT מלא.

ראו [תקלות Billing API](../../troubleshooting/billing-api).

## הפעלה

1. הוסיפו IP מורשה ב-enterprise (או הריצו מהרשת המורשית).
2. הגדירו `NUXT_PUBLIC_GITHUB_ENT`.
3. PAT עם `manage_billing:copilot` (org) או `manage_billing:enterprise` / `admin:enterprise` (enterprise).
4. `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true` (ברירת מחדל).
5. הפעילו מחדש את השרת.

## מטמון ואצוות

- אצוות של **10** משתמשים לבקשה (`POST /api/user-ai-credits`).
- מטמון שרת **10 דקות** למפתח (ארגון + טווח + משתמש).
- ב-**Usage & billing** — שליפה בשרת עם טעינת `/api/usage-insights`.
- ב-**Users** — `ai_credits_used` מוצג מיד; billing נטען ברקע ל-USD.

## הבדל מ-PRU

| | **קרדיטי AI** | **PRU (Premium credits)** |
|---|---------------|---------------------------|
| API | `.../ai_credit/usage` | `.../premium_request/usage` |
| דגל | `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED` | `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED` |
| תצוגה | כמות + USD | פס מכסה חודשית (PRU left) |

שני המדדים עשויים להופיע במקביל — תלוי בחיוב הארגון. ראו [Premium credits (PRU)](./premium-credits).

## קישורים

- [עמודות Usage & billing](./usage-billing-table-columns)
- [עמודות Users](./users-table-columns)
- [דיאלוג פירוט משתמש](./user-usage-detail-dialog)
- [משתני סביבה — AI credits](../../reference/environment-variables#ai-credits)
