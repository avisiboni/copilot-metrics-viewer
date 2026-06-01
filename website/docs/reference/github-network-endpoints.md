---
title: נקודות קצה GitHub
---

# נקודות קצה יוצאות של GitHub / Copilot

בעמוד זה מפורטים כל כתובות ה-URL של GitHub שהאפליקציה משתמשת בהן לשליפת נתונים, ומה כל נקודת קצה משמשת.

## רשימת allowlist מומלצת לפרוקסי

- `https://api.github.com`

## נקודות קצה REST בשימוש האפליקציה

| דפוס נקודת קצה | שימוש |
|---|---|
| `GET https://api.github.com/user/installations` | רשימת התקנות GitHub App במהלך זרימת האימות לאימות גישה. |
| `GET https://api.github.com/orgs/{org}/copilot/metrics/reports/organization-1-day?day={yyyy-mm-dd}` | מדדי שימוש Copilot יומיים ברמת ארגון ליום מסוים. |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/metrics/reports/enterprise-1-day?day={yyyy-mm-dd}` | מדדי שימוש Copilot יומיים ברמת enterprise ליום מסוים. |
| `GET https://api.github.com/orgs/{org}/copilot/metrics/reports/organization-28-day/latest` | סיכום שימוש Copilot ל-28 יום אחרונים ברמת ארגון. |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/metrics/reports/enterprise-28-day/latest` | סיכום שימוש Copilot ל-28 יום אחרונים ברמת enterprise. |
| `GET https://api.github.com/orgs/{org}/copilot/metrics/reports/user-teams-1-day?day={yyyy-mm-dd}` | מדדי שימוש יומיים לפי צוות בארגון. |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/metrics/reports/user-teams-1-day?day={yyyy-mm-dd}` | מדדי שימוש יומיים לפי צוות ב-enterprise. |
| `GET https://api.github.com/orgs/{org}/copilot/metrics/reports/users-1-day?day={yyyy-mm-dd}` | מדדי שימוש יומיים לפי משתמש בארגון. |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/metrics/reports/users-1-day?day={yyyy-mm-dd}` | מדדי שימוש יומיים לפי משתמש ב-enterprise. |
| `GET https://api.github.com/orgs/{org}/copilot/metrics/reports/users-28-day/latest` | מדדי משתמש ל-28 יום אחרונים בארגון. |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/metrics/reports/users-28-day/latest` | מדדי משתמש ל-28 יום אחרונים ב-enterprise. |
| `GET https://api.github.com/orgs/{org}/copilot/billing` | הגדרות חיוב ארגון (לשונית Usage & billing). |
| `GET https://api.github.com/orgs/{org}/copilot/billing/seats` | הקצאות מושבי Copilot בארגון (ניתוח מושבים). |
| `GET https://api.github.com/enterprises/{enterprise}/copilot/billing/seats` | הקצאות מושבי Copilot ב-enterprise (ניתוח מושבים). |
| `GET https://api.github.com/orgs/{org}/teams` | רשימת צוותים בארגון. |
| `GET https://api.github.com/enterprises/{enterprise}/teams` | רשימת צוותים ב-enterprise. |
| `GET https://api.github.com/orgs/{org}/teams/{team}/members` | חברי צוות ספציפי בארגון. |
| `GET https://api.github.com/enterprises/{enterprise}/teams/{team}/members` | חברי צוות ספציפי ב-enterprise. |
| `GET https://api.github.com/orgs/{org}/members` | חברי ארגון (העשרת מדריך משתמשים). |
| `GET https://api.github.com/organizations/{org}/settings/billing` | מטא-דאטה של הגדרות חיוב ברמת ארגון. |
| `GET https://api.github.com/enterprises/{enterprise}/settings/billing` | מטא-דאטה של הגדרות חיוב ברמת enterprise. |

## נקודת קצה GraphQL בשימוש האפליקציה

| נקודת קצה | שימוש |
|---|---|
| `POST https://api.github.com/graphql` | העשרת פרופילי חברי ארגון (`membersWithRole`) ושדות SAML (`externalIdentities`). |

## הערות

- כל ה-placeholders (`{org}`, `{enterprise}`, `{team}`) הם ערכים בזמן ריצה מההגדרות או מפרמטרי הנתיב.
- אם הפרוקסי מבוסס דומיין, הרשאת `api.github.com` מספיקה לשליפת הנתונים באפליקציה זו.
