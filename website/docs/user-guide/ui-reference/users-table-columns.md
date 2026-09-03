---
title: עמודות Users
---

# עמודות — לשונית Users

![לשונית Users](/img/ui/users-tab.png)

טבלת **משתמשים** בלשונית Users — עמודות כפי שמופיעות ב-`UserMetricsViewer` (סדר משמאל לימין ב-RTL).

| # | עמודה (עברית / EN) | מפתח / שדה | הסבר (כמו Tooltip בכותרת) |
|---|---------------------|------------|---------------------------|
| 1 | **משתמש / User** | `user_login`, `name`, `email` | לוגין GitHub; שם ואימייל מוצגים אם ספריית הארגון (GraphQL) החזירה אותם (`billing.colUserHint`) |
| 2 | **שימוש / Usage** | (כפתור) | פותח [דיאלוג פירוט משתמש](./user-usage-detail-dialog) — מודלים, תכונות, דפוס, המלצות (`billing.colUsageHint`) |
| 3 | **דפוס שימוש / Usage pattern** | (מחושב) | תווית היוריסטית מול קוהורט הארגון — **לא** שדה GitHub (`usagePattern.colPatternHint`). [דפוסי שימוש](../usage-patterns) |
| 4 | **קרדיטי AI / AI credits** *(מותנה)* | `ai_credits`, `ai_credits_used` | מ-**usage metrics** (`ai_credits_used`) מיד; USD מ-billing — `billing.colAiCreditsHint` · [קרדיטי AI](./ai-credits) |
| 5 | **אינטראקציות** | `user_initiated_interaction_count` | אינטראקציות שיוזם המשתמש (`billing.colInteractionsHint`) |
| 6 | **יצירות** | `code_generation_activity_count` | פעילויות יצירת קוד (`billing.colGenerationsHint`) |
| 7 | **קבלת הצעת קוד** | `code_acceptance_activity_count` | קבלת הצעת קוד (`billing.colAcceptancesHint`) |
| 8 | **שורות שנוספו** | `loc_added_sum` | שורות קוד שנוספו (`billing.colLocAddedHint`) |
| 9 | **סוכן / Agent** | `used_agent` | כן/לא — Copilot **Agent mode ב-IDE** (`billing.colAgentHint`) |
| 10 | **צ'אט / Chat** | `used_chat` | כן/לא — Copilot Chat (`billing.colChatHint`) |
| 11 | **סוכן קוד / Coding agent** | `used_copilot_coding_agent` | כן/לא — **Copilot coding agent ב-GitHub** (הקצאת issue, `@copilot` ב-PR) — לא אותו דבר כ-Agent ב-IDE · `billing.colCodingAgentHint` |

## שדות שלא בעמודות הטבלה (אך בדוח / בדיאלוג)

| שדה | איפה רואים | הערה |
|-----|------------|------|
| **שלב AI adoption** | כותרת [דיאלוג שימוש](./user-usage-detail-dialog) | מוסתר כברירת מחדל; `NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS=true` — [קוהורטות](./ai-adoption-cohorts) |
| **Copilot coding agent** | עמודה **Coding agent**; צ'יפ בדיאלוג | `used_copilot_coding_agent` — פעילות סוכן על GitHub.com (לא IDE) · [Changelog](https://github.blog/changelog/2026-03-25-copilot-usage-metrics-now-identify-active-copilot-coding-agent-users/) |
| **קרדיט פרימיום (PRU)** | דיאלוג שימוש; עמודת PRU ב-**Usage & billing** כש-PRU פעיל | ב-Users: באנר **בקרוב** כש-`NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false` — [Premium credits](./premium-credits) |
| **קרדיטי AI** | עמודה ב-Users וב-Usage & billing; כרטיס בדיאלוג שימוש | `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true` (ברירת מחדל) — [קרדיטי AI](./ai-credits) |

## עמודת AI credits — מצבים

| תצוגה | משמעות |
|--------|--------|
| פס טעינה | טעינת billing מאצוות `/api/user-ai-credits` (אחרי שמדדים כבר מוצגים) |
| `X credits · $Y` | נתוני חיוב לפי משתמש |
| `X credits (מדוח מדדי שימוש)` | מ-`ai_credits_used` בדוח users |
| **(per-user AI credits not in org API)** | ארגון בבעלות enterprise — הגדירו `NUXT_PUBLIC_GITHUB_ENT` |
| **N/A** | Billing לא זמין או הדגל `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=false` |

## עמודת Premium credits — מצבים (Usage & billing / עתידי ב-Users)

| תצוגה | משמעות |
|--------|--------|
| **מושבת (IP allowlist)** | Billing API חסום מרשת הפריסה |
| תג **בקרוב** | `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false` |
| פס טעינה | טעינה מאצוות `/api/user-premium-credits` |
| פס + «X% · N left · used/quota» | נתוני PRU מחיוב |
| **N/A** | Billing לא זמין או אין נתונים למשתמש |

מטמון שרת: 10 דקות לכל משתמש וטווח (כש-PRU פעיל).

## הבדל מייצוא CSV

ייצוא בלשונית **API response** מבוסס על **מדדי Copilot** (`/api/metrics`) — **ללא** PRU, **ללא** קרדיטי AI וללא דפוס שימוש.  
PRU וקרדיטי AI דורשים Billing API — [Premium credits](./premium-credits) · [קרדיטי AI](./ai-credits).
