---
title: מעטפת וניווט
---

# מעטפת הלוח: סרגל, כותרת, תאריכים

## סרגל ניווט (שמאל)

![סרגל צד](/img/ui/sidebar.png)

| פריט | לשונית (`?tab=`) | תיאור |
|------|------------------|--------|
| Organization | `organization` | מדדי ארגון יומיים / 28 יום |
| Teams | `teams` | שימוש לפי צוות |
| Languages | `languages` | פילוח שפות |
| Editors | `editors` | פילוח עורכים |
| Copilot Chat | `copilot-chat` | מדדי צ'אט |
| Usage insights | `usage-insights` | תובנות שימוש מורחבות |
| Users | `users` | טבלת משתמשים |
| Invite members | `invite-members` | הזמנת חברים לארגון (אימייל / Excel) |
| Usage & billing | `usage-billing` | חיוב + לוח מובילים |
| Seat analysis | `seat-analysis` | ניתוח מושבים |
| API response | `api-response` | תצוגת JSON וייצוא |

**Tooltip (התנהגות):** הלשונית הפעילה מסומנת ברקע סגול בהיר; לחיצה מעדכנת את ה-URL לשיתוף קישור ישיר.

## כותרת עליונה

![כותרת](/img/ui/header.png)

| רכיב | הסבר |
|------|------|
| שם ארגון / Enterprise | מגיע מ-`NUXT_PUBLIC_GITHUB_ORG` / `GITHUB_ENT` |
| בורר שפה | עברית / English — שומר ב-`localStorage` וב-cookie |
| Mock data | מוצג כש-`NUXT_PUBLIC_IS_DATA_MOCKED=true` |

## בורר טווח תאריכים

![פאנל תאריכים](/img/ui/date-range-open.png)

| שדה | הסבר |
|-----|------|
| Since / Until | טווח לדוחות יומיים ולסיכומים; משפיע על רוב הלשוניות |
| Apply | טוען מחדש נתונים לטווח שנבחר |
| Last 28 days (ברירת מחדל) | דוח `organization-28-day/latest` ו-`users-28-day/latest` |

**הערה:** בלשונית Users, שדה **סינון לפי יום** מחליף לדוח `users-1-day` ליום בודד (עוקף את חלון ה-28 יום).

## עוזר AI (FAB)

כפתור צף עם אייקון רובוט בפינת המסך — פותח [עוזר AI](../ai-chat). מושבת עם `NUXT_PUBLIC_ENABLE_AI_CHAT=false`.

## פוטר

קישור ל-Copilot Metrics Viewer ב-GitHub, גרסה (`NUXT_PUBLIC` version), וקישור **תיעוד** אם `NUXT_PUBLIC_DOCS_URL` מוגדר.
