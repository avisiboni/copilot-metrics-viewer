---
title: Local development
---

# Local development

```bash
git clone <repository-url>
cd copilot-metrics-viewer
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:3000`.

## Mock data

```env
NUXT_PUBLIC_IS_DATA_MOCKED=true
```

or `?mock=true` in the URL.

## Local historical mode

```env
DATABASE_URL=postgresql://metrics_user:metrics_password@localhost:5432/copilot_metrics
ENABLE_HISTORICAL_MODE=true
NUXT_PUBLIC_ENABLE_HISTORICAL_MODE=true
```

```bash
docker compose up db -d
npm run dev
```

## Tests

```bash
npm test
npm run test:e2e
```

## Documentation (Docusaurus)

```bash
cd website
npm install
npm start          # Hebrew — http://localhost:3001
npm run start:en   # English — http://localhost:3001/en
```

Or from repo root: `npm run docs:dev` / `npm run docs:dev:en`.

## Embedded docs in the app

```bash
npm run docs:embed
npm run dev
# http://localhost:3000/docs/
```
