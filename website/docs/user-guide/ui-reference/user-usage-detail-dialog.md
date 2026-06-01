---
title: דיאלוג פירוט משתמש
---

# דיאלוג פירוט שימוש למשתמש (User usage detail)

![דיאלוג פירוט שימוש למשתמש](/img/ui/user-usage-detail-dialog.png)

> **איפה לפתוח:** לשונית **Usage & billing** → לחיצה על שם המשתמש או כפתור **שימוש** בשורה.

חלון מודאלי (dialog) עם פירוט למשתמש בודד בטווח הדוח.

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

## קרדיט פרימיום ועלות

| רכיב | הסבר |
|------|------|
| **Premium credits** | תמיד מוצג; **בקרוב** כש-`NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false` |
| **PRU cost** | `pruNetAmount` — רק כש-PRU מופעל בדגל **וגם** billing זמין |

## צוותים

רשימת `team_slug` מדוח `user-teams-1-day` האחרון (snapshot).

## צ'יפים Agent / Chat / CLI

שימוש בוליאני ב-Agent, Chat, ו-CLI (אם הופיע בדוח).

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
