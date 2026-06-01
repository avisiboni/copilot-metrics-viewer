---
title: תחילת עבודה
sidebar_position: 1
---

# תחילת עבודה

מדריך זה מלווה אתכם משלב ה-clone ועד לדשבורד פעיל — כולל הגדרת ארגון, טוקן, לוגו ושם חברה.

## 1. שכפול הפרויקט

```bash
git clone <repository-url>
cd copilot-metrics-viewer
```

## 2. הגדרת קובץ `.env`

```bash
cp .env.example .env
```

פתחו את `.env` ומלאו את הערכים הבאים:

### ארגון או Enterprise

```env
# בחרו: organization | enterprise | team-organization | team-enterprise
NUXT_PUBLIC_SCOPE=organization

# שם הארגון שלכם ב-GitHub (לדוגמה: my-company)
NUXT_PUBLIC_GITHUB_ORG=your-org-name

# שם Enterprise — רק אם SCOPE=enterprise
NUXT_PUBLIC_GITHUB_ENT=your-enterprise-name

# סינון לפי צוות (אופציונלי)
NUXT_PUBLIC_GITHUB_TEAM=
```

### אימות — PAT

```env
# Personal Access Token עם הרשאות:
# copilot, read:org, read:enterprise, manage_billing:copilot
NUXT_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> ליצירת טוקן: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens

### סיסמת Session (חובה)

```env
# מחרוזת אקראית באורך 32 תווים לפחות
NUXT_SESSION_PASSWORD=change_this_to_a_long_random_string_here
```

:::tip יצירת סיסמה אקראית
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

### פיצ'רים אופציונליים

```env
# הפעילו OAuth במקום PAT
NUXT_PUBLIC_USING_GITHUB_AUTH=false

# השביתו שליפת Premium credits (מומלץ בהתקנה ראשונית)
NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false

# פרוקסי ארגוני (אם נדרש)
# HTTP_PROXY=http://proxy.company.com:8080
```

## 3. התאמת מיתוג (לוגו ושם חברה)

### לוגו

החליפו את הקובץ `public/favicon.svg` בלוגו שלכם (SVG מומלץ).

לדשבורד עצמו — שמרו את הלוגו שלכם בתיקיית `public/`:

```
public/
  logo.png        ← לוגו ראשי (מומלץ PNG, רוחב 200px)
  favicon.svg     ← אייקון לשונית דפדפן
```

### שם החברה בממשק

שם הארגון / Enterprise מוצג אוטומטית מתוך `NUXT_PUBLIC_GITHUB_ORG` או `NUXT_PUBLIC_GITHUB_ENT` — אין צורך בהגדרה נפרדת.

לשינוי כותרת האפליקציה ערכו את `nuxt.config.ts`:

```ts
app: {
  head: {
    title: 'Copilot Metrics — My Company'
  }
}
```

## 4. הפעלה מקומית

```bash
npm install
npm run dev
```

פתחו `http://localhost:3000`.

:::tip בדיקה מהירה ללא טוקן
```env
NUXT_PUBLIC_IS_DATA_MOCKED=true
```
הדשבורד יציג נתוני דמה — מתאים לבדיקת ממשק לפני חיבור ל-API.
:::

## 5. בדיקה שהכל עובד

1. הדשבורד נטען ב-`http://localhost:3000`
2. שם הארגון מופיע בכותרת
3. גרפים מציגים נתונים (אמיתיים או מדומים)
4. לשונית **Seat analysis** נטענת ללא שגיאות

## השלבים הבאים

| נושא | קישור |
|------|-------|
| אימות מתקדם (OAuth / GitHub App) | [אימות](./authentication) |
| פריסה ב-Docker | [Docker](../deployment/docker) |
| פריסה ב-Azure | [Azure](../deployment/azure) |
| כל משתני הסביבה | [עזר — משתני סביבה](../reference/environment-variables) |
