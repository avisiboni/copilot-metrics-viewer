---
title: שינויים אחרונים
---

# שינויים אחרונים בלוח הבקרה

סיכום יכולות מגרסאות אחרונות (upstream + הרחבות). לפרטים — [מדריך רכיבי ממשק](../user-guide/ui-reference/overview).

## v3.0 — Copilot Usage Metrics API

- מעבר ל-[Usage Metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-usage-metrics)
- [מצבי הפעלה](../setup/operating-modes): Direct API / Historical
- מדדי צוות נגזרים מנתוני משתמש
- [מעבר ל-v3](./v3-migration)

## קוהורטות AI adoption (מאי 2026)

- **מקור:** [GitHub Changelog — cohorts](https://github.blog/changelog/2026-05-29-copilot-usage-metrics-api-adds-cohorts-for-ai-adoption/)
- **בלוח:** KPI, גרף, טבלה; צ'יפ בדיאלוג משתמש — **מוסתר כברירת מחדל** (`NUXT_PUBLIC_SHOW_AI_ADOPTION_COHORTS=true` להפעלה)
- **תיעוד:** [קוהורטות AI adoption](../user-guide/ui-reference/ai-adoption-cohorts)

## מושבים לפי חודש (Seat analysis)

- תרשים עמודות מוערם + טבלת פירוט לחשבונית (חדש/קיים/סה״כ)
- מצב היסטורי: סה״כ בסוף חודש מצילומי מצב
- [ניתוח מושבים](../user-guide/seat-analysis)

## עוזר AI

- FAB צ'אט, שאלות לפי לשונית, GitHub Models
- `NUXT_PUBLIC_ENABLE_AI_CHAT`
- [עוזר AI](../user-guide/ai-chat)

## תצוגה לפי צוות (URL)

- `/orgs/.../teams/...` — דשבורד מלא מסונן לצוות
- [תיעוד](../user-guide/team-scoped-views)

## 5 המובילים בשימוש יעיל ב-Copilot (Users)

- שורת KPI בלשונית **Users** — עד 5 משתמשים עם **ציון יעילות** (`computeCopilotQualityScore`) — דפוס + קבלה + נפח, לא «הכי פעיל» בלבד
- משתמשים עם דפוסים רדומים / בזבוז הצעות לא מדורגים
- לחיצה על כרטיס → דיאלוג פירוט שימוש (שם עדיין מוצג **ציון מעורבות** נפרד); לא דירוג ביצועים
- [משתמשים](../user-guide/users) · [דפוסי שימוש](../user-guide/usage-patterns#ציון-יעילות-מול-ציון-מעורבות)

## הזמנת חברים לארגון (Invite members)

- לשונית **Invite members** — הזמנה בודדת או העלאת Excel מרוכזת
- חובה: עמודת `email` בקובץ (ללא תלות ברישיות); בורר ארגון + תפקיד
- API: `POST /api/org-invitations` → GitHub `POST /orgs/{org}/invitations`
- דורש `admin:org` / Organization members Write
- [הזמנת חברים](../user-guide/invite-members)

## דפוסי שימוש (Usage patterns)

- עמודה **דפוס שימוש** ב-Users וב-Usage & billing
- פאנל בדיאלוג **שימוש**: שיעורים נגזרים, נוסחאות, אחוזונים מול הארגון
- היוריסטי — לא שדה GitHub; לאימון ולא לדירוג
- [דפוסי שימוש](../user-guide/usage-patterns)

## דיאלוג פירוט שימוש למשתמש

- מ-**Usage & billing** — KPIs, מודלים, Agent/Chat/CLI, PRU
- [דיאלוג פירוט משתמש](../user-guide/ui-reference/user-usage-detail-dialog)

## קרדיט פרימיום (PRU)

- טעינה באצווה, מטמון 10 דקות
- `NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false` — מצב **בקרוב**
- [קרדיט פרימיום](../user-guide/ui-reference/premium-credits)

## קרדיטי AI (יוני 2026)

- **מקור billing:** [Budget and usage management APIs GA](https://github.blog/changelog/2026-06-04-budget-and-usage-management-apis-now-generally-available/)
- **מקור metrics:** שדה **`ai_credits_used`** בדוחות users — [Changelog](https://github.blog/changelog/2026-06-19-ai-credits-consumed-per-user-now-in-the-copilot-usage-metrics-api/)
- עמודה **קרדיטי AI** ב-Users, Usage & billing, ודיאלוג שימוש (metrics מיד; billing ל-USD)
- API billing: `.../settings/billing/ai_credit/usage?user=`
- `NUXT_PUBLIC_AI_CREDITS_FETCH_ENABLED=true` (ברירת מחדל)
- [קרדיטי AI](../user-guide/ui-reference/ai-credits)

## Copilot coding agent (מרץ 2026)

- **שדה:** `used_copilot_coding_agent` בדוחות users
- **בלוח:** עמודה **Coding agent** ב-Users; צ'יפ בדיאלוג שימוש
- **משמעות:** שימוש ב-Copilot coding agent ב-GitHub (לא IDE agent mode)
- [Changelog](https://github.blog/changelog/2026-03-25-copilot-usage-metrics-now-identify-active-copilot-coding-agent-users/)

## טלמטריה בצד השרת (יוני 2026)

- GitHub מוסיף משתמשים פעילים מטלמטריה שרתית גם כש-client telemetry חסר
- בדיאלוג שימוש: הודעה כשיש פעילות בלי breakdown מודל/תכונה
- [Changelog](https://github.blog/changelog/2026-06-15-copilot-usage-metrics-now-include-more-of-your-active-users/)

## RTL ועברית

- `dir=rtl`, `shared/i18n`, cookie locale ל-SSR

## Entra — סינון לפי מנהל

- MSAL + Graph, `reports-to:` URLs
- [Entra manager filter](../setup/entra-manager-filter)

## מיתוג

- `NUXT_PUBLIC_BRAND_*`, `brand-tokens.css`
- [מיתוג](../setup/branding)

## תיעוד

- [אפליקציה ואתר תיעוד](./app-and-docs-site)
- סנכרון EN: `npm run docs:sync-en` מתוך `website/`
