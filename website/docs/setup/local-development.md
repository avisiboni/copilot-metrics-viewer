---
title: פיתוח מקומי
---

# פיתוח מקומי

```bash
git clone <repository-url>
cd copilot-metrics-viewer
cp .env.example .env   # אם קיים
npm install
npm run dev
```

פתחו `http://localhost:3000`.

## נתוני דמה

```env
NUXT_PUBLIC_IS_DATA_MOCKED=true
```

או `?mock=true` ב-URL.

## בדיקות

```bash
npm test
npm run test:e2e
```

## תיעוד (Docusaurus)

```bash
cd website
npm install
npm start          # עברית — http://localhost:3000
npm run start:en   # אנגלית
```
