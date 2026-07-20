---
title: דיאלוג פירוט משתמש
---

# דיאלוג פירוט שימוש למשתמש (User usage detail)

![דיאלוג פירוט שימוש למשתמש](/img/ui/user-usage-detail-dialog.png)

> **איפה לפתוח:** לשונית **Users** או **Usage & billing** → כפתור **שימוש** בשורה (או לחיצה על שם המשתמש ב-Usage & billing).

חלון מודאלי (dialog) עם פירוט למשתמש בודד בטווח הדוח.

## דפוס שימוש וציונים

פאנל **דפוס שימוש וציונים** (`UserUsageInsightPanel`) — מופיע מתחת ל-KPIs העליונים כשיש נתונים:

| רכיב | הסבר |
|------|------|
| **צ'יפ דפוס** | תווית (למשל מאוזן, אימוץ נרחב) — [דפוסי שימוש](../usage-patterns) |
| **ביטחון** | נמוך / בינוני / גבוה — לפי סך הפעילות |
| **ציון מעורבות** | 0–100 מול המשתמש הפעיל ביותר בקוהורט (נפרד מ**ציון יעילות** בכרטיסי 5 המובילים — [דפוסי שימוש](../usage-patterns#ציון-יעילות-מול-ציון-מעורבות)) |
| **המלצות אימון** | כותרת + רשימת פעולות לפי דפוס ואחוזונים — [דפוסי שימוש](../usage-patterns#המלצות-אימון-חדש) |
| **טבלת שיעורים נגזרים** | ערך, חציון ארגון, אחוזון, **נוסחת חישוב** |
| **סכומים גולמיים** | אינטראקציות, יצירות, קבלות, LoC — עם אחוזון וחציון |

:::info
דפוסי שימוש מחושבים בלוח — לא מ-GitHub API. מיועדים לאימון, לא לדירוג ביצועים.
:::

## כותרת הדיאלוג

| רכיב | הסבר |
|------|------|
| אווטאר + לוגין | זיהוי המשתמש |
| שם · אימייל | מהעשרת ספריית הארגון (אם זמין) |
| **שלב AI adoption** | צ'יפ קוהורטה + גרסת סיווג (`version`, למשל `v1`) — [קוהורטות AI adoption](./ai-adoption-cohorts) |
| טווח דוח | תאריכי הדוח הפעילים |

![דיאלוג עם שלב AI adoption](/img/ui/ai-adoption-user-detail-dialog.png)

## KPIs עליונים (4 כרטיסים)

| KPI | מפתח | Tooltip (תמצית) |
|-----|------|------------------|
| **אינטראקציות** | `user_initiated_interaction_count` | אינטראקציות שיוזם המשתמש בתקופה |
| **Generations** | `code_generation_activity_count` | פעילויות יצירת קוד |
| **Acceptances** | `code_acceptance_activity_count` | קבלת הצעת קוד |
| **LoC added** | `loc_added_sum` | שורות קוד שנוספו |

כל כרטיס כולל אייקון ⓘ עם הסבר מלא (`userDetail.kpi*`).

## קרדיטי AI ועלות PRU

| רכיב | הסבר |
|------|------|
| **AI credits (billing period)** | `ai_credits_used` מדוח users מיד; USD מ-billing כשזמין — `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true` (ברירת מחדל) · [קרדיטי AI](./ai-credits) |
| **Premium credits** | תמיד מוצג; **בקרוב** כש-`NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false` |
| **PRU cost** | `pruNetAmount` — רק כש-PRU מופעל בדגל **וגם** billing זמין |

## צוותים

רשימת `team_slug` מדוח `user-teams-1-day` האחרון (snapshot).

## צ'יפים Agent / Chat / CLI / Coding agent

| צ'יפ | שדה | משמעות |
|------|-----|--------|
| **Agent** | `used_agent` | Agent mode **ב-IDE** |
| **Chat** | `used_chat` | Copilot Chat |
| **CLI** | `used_cli` | Copilot CLI (אם הופיע) |
| **Coding agent** | `used_copilot_coding_agent` | סוכן Copilot **ב-GitHub** (issue / `@copilot` ב-PR) — שונה מ-Agent ב-IDE |

## טלמטריה בצד השרת (יוני 2026)

אם למשתמש יש אינטראקציות/יצירות אבל **אין** פירוט מודל/תכונה, מוצגת הודעה: GitHub זיהה פעילות מטלמטריה בצד השרת; breakdown עשוי להיות ריק עד ש-GitHub יוסיף פירוט עשיר יותר.

[Changelog — more active users](https://github.blog/changelog/2026-06-15-copilot-usage-metrics-now-include-more-of-your-active-users/)

## תרשימים

| תרשים | Tooltip (תמצית) |
|--------|------------------|
| **Top models** | מודלים מובילים לפי אינטראקציות |
| **Activity mix** | תמהיל generations / acceptances / interactions |
| **Features** | שימוש לפי תכונה |
| **Model × feature** | מטריצת מודל-תכונה |

אם אין breakdown בדוח: הודעה *No model or feature breakdown for this user in the report window*.

## קשר ללשונית Users

| לשונית Users | דיאלוג זה |
|--------------|-----------|
| טבלת כל המשתמשים | פירוט עמוק למשתמש אחד |
| מסננים יומיים | אותו טווח דוח כללי |
| Usage & billing בלבד | כפתור פתיחה |

---

רכיב: `app/components/UserUsageDetailDialog.vue`
