---
title: נתיבי API
---

# נתיבי API (שרת Nitro)

פרמטרים נפוצים: `since`, `until`, `githubOrg`, `githubEnt`, `scope`, `githubTeam`.

## מדדים ושימוש

| נתיב | תיאור |
|------|--------|
| `GET /api/metrics` | מדדי Copilot (ארגון/Enterprise) |
| `GET /api/user-metrics` | שימוש לפי משתמש + מטא-חיוב |
| `GET /api/user-metrics-history` | היסטוריית משתמש (דורש `ENABLE_HISTORICAL_MODE`) |
| `GET /api/usage-insights` | תובנות שימוש, מודלים, קוהורטות |
| `GET /api/team-metrics` | מדדי צוות (נגזר) |
| `GET /api/teams` | רשימת צוותים |
| `GET /api/github-stats` | סטטיסטיקות GitHub.com |

## מושבים וחיוב

| נתיב | תיאור |
|------|--------|
| `GET /api/seats` | מושבים מוקצים |
| `GET /api/seats-history` | היסטוריית מושבים (מצב היסטורי) |
| `GET /api/billing` | הגדרות חיוב Copilot |
| `GET /api/billing-status` | זמינות Billing API |
| `POST /api/user-premium-credits` | PRU לפי משתמש (אצווה) |
| `POST /api/user-ai-credits` | קרדיטי AI לפי משתמש (אצווה) |

## ארגון / Entra

| נתיב | תיאור |
|------|--------|
| `GET /api/org-search` | חיפוש מנהלים (Entra) |
| `GET /api/org-reports` | דוחות ישירים למנהל |
| `GET /api/enterprise-orgs` | ארגונים ב-Enterprise |
| `GET /api/msal/callback` | MSAL redirect |
| `GET /api/installations` | התקנות GitHub App |

## AI וניהול

| נתיב | תיאור |
|------|--------|
| `POST /api/ai/chat` | עוזר AI → GitHub Models |
| `POST /api/admin/sync` | סנכרון ידני (מצב היסטורי) |
| `GET /api/admin/sync-status` | סטטוס sync |

## בריאות

| נתיב | תיאור |
|------|--------|
| `GET /api/health` | בריאות כללית |
| `GET /api/ready` | מוכנות |
| `GET /api/live` | liveness (ללא קריאות GitHub) |

אימות: רוב הנתיבים משתמשים ב-PAT/OAuth של השרת או במשתמש המחובר. ראו [אימות](../setup/authentication).
