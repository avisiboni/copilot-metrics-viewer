---
title: עמודות Users
---

# עמודות — לשונית Users

![לשונית Users](/img/ui/users-tab.png)

| עמודה (עברית / EN) | מפתח נתונים | הסבר (כמו Tooltip) |
|---------------------|-------------|---------------------|
| **משתמש / User** | `user_login`, `name`, `email` | לוגין GitHub; שם ואימייל מוצגים אם ספריית הארגון (GraphQL) החזירה אותם |
| **קרדיט פרימיום / Premium credits** | `premium_credits` | מכסת **Premium Request Units (PRU)** לחודש — נטען מ-GitHub Billing API כשמופעל. פס התקדמות: אחוז שנותר, שימוש/מכסה. **בקרוב** כשהדגל `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false` |
| **אינטראקציות / Interactions** | `user_initiated_interaction_count` | מספר אינטראקציות שיוזם המשתמש (דוח metrics) |
| **יצירות / Generations** | `code_generation_activity_count` | פעילויות יצירת קוד (הצעות/השלמות) |
| **קבלת הצעת קוד / Acceptances** | `code_acceptance_activity_count` | ספירת קבלת הצעת קוד |
| **שורות שנוספו / Lines added** | `loc_added_sum` | סכום שורות קוד שנוספו לקוד (מדד שורות) |
| **סוכן / Agent** | `used_agent` | האם השתמש ב-Copilot Agent בטווח (כן/לא) |
| **צ'אט / Chat** | `used_chat` | האם השתמש ב-Copilot Chat (כן/לא) |
| **שלב AI adoption** | `ai_adoption_phase` | צ'יפ לכל משתמש (למשל **Code first** = בעיקר השלמות קוד / IDE agent). ⓘ בכותרת העמודה + ריחוף על הצ'יפ — [קוהורטות AI adoption](./ai-adoption-cohorts) |

## עמודת Premium credits — מצבים

| תצוגה | משמעות |
|--------|--------|
| **מושבת (IP allowlist)** | Billing API חסום מרשת הפריסה — ריחוף על התא להסבר מלא |
| תג **בקרוב** | שליפת billing מושבתת בדגל סביבה |
| פס טעינה + «טוען…» | טעינה ברקע מאצוות `/api/user-premium-credits` |
| פס + «X% · N left · used/quota» | נתוני PRU מחיוב |
| **N/A** | Billing לא זמין או אין נתונים למשתמש |

**Tooltip בכותרת העמודה (כש-PRU פעיל):** נתונים נשמרים במטמון שרת 10 דקות לכל משתמש וטווח.

## הבדל מייצוא CSV

ייצוא בלשונית **API response** מבוסס על **מדדי Copilot** (`/api/metrics`) — **ללא** עמודת PRU.  
PRU דורש Billing API או ייבוא CSV מ-GitHub (עתידי).
