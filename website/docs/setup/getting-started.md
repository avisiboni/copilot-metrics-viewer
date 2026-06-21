---
title: תחילת עבודה
sidebar_position: 1
---

# תחילת עבודה

מדריך משלב ה-clone ועד לדשבורד פעיל.

## 1. שכפול הפרויקט

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. הגדרת קובץ `.env`

```bash
cp .env.example .env
```

### ארגון או Enterprise

```env
NUXT_PUBLIC_SCOPE=organization
NUXT_PUBLIC_GITHUB_ORG=your-org-name
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name
NUXT_PUBLIC_GITHUB_TEAM=
```

> ערכי `team-organization` / `team-enterprise` ישנים מנורמלים ל-`organization` / `enterprise`.

### אימות — PAT

```env
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

הרשאות: Copilot metrics, `read:org`, `manage_billing:copilot` (לחיוב).

:::tip
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### אופציונלי

```env
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false
NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=false
NUXT_PUBLIC_ENABLE_AI_CHAT=true
NUXT_PUBLIC_HIDDEN_TABS=
```

## 3. מיתוג

העדיפו משתני `NUXT_PUBLIC_BRAND_*` וקבצים ב-`public/brand/` — לא עריכת `nuxt.config.ts`.

[מיתוג מלא →](./branding)

## 4. הפעלה מקומית

```bash
npm install
npm run dev
```

פתחו `http://localhost:3000` (או `/orgs/your-org`).

:::tip נתוני דמה
```env
NUXT_PUBLIC_IS_DATA_MOCKED=true
```
או `?mock=true` ב-URL.
:::

## 5. בדיקה

1. הדשבורד נטען
2. גרפים מציגים נתונים
3. **Seat analysis** — KPI + מושבים לפי חודש (אם יש נתונים)
4. תיעוד: `npm run docs:dev` → `http://localhost:3001`

## השלבים הבאים

| נושא | קישור |
|------|-------|
| Direct vs Historical | [מצבי הפעלה](./operating-modes) |
| OAuth / GitHub App | [אימות](./authentication) |
| Docker | [Docker](../deployment/docker) |
| משתני סביבה | [עזר](../reference/environment-variables) |
| v3.0 | [מעבר ל-v3](../reference/v3-migration) |
