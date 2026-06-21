---
title: פיתוח מקומי
---

# פיתוח מקומי

```bash
git clone <repository-url>
cd copilot-metrics-viewer
cp .env.example .env
npm install
npm run dev
```

פתחו `http://localhost:3000`.

## נתוני דמה

```env
NUXT_PUBLIC_IS_DATA_MOCKED=true
```

או `?mock=true` ב-URL.

## מצב היסטורי מקומי

```env
DATABASE_URL=postgresql://metrics_user:metrics_password@localhost:5432/copilot_metrics
ENABLE_HISTORICAL_MODE=true
NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=true
```

```bash
docker compose up db -d
npm run dev
```

## בדיקות

```bash
npm test
npm run test:e2e
```

## תיעוד (Docusaurus)

```bash
cd website
npm install
npm start          # עברית — http://localhost:3001
npm run start:en   # אנגלית — http://localhost:3001/en
```

או מהשורש: `npm run docs:dev` / `npm run docs:dev:en`.

## תיעוד מוטמע באפליקציה

```bash
npm run docs:embed
npm run dev
# http://localhost:3000/docs/
```
