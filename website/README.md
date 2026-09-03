# Copilot Metrics Viewer — Documentation site

[Docusaurus 3](https://docusaurus.io/) site with **Hebrew (default, RTL)** and **English (LTR)**.

## Commands

```bash
npm install
npm start          # Hebrew — http://localhost:3001
npm run start:en   # English — http://localhost:3001/en
npm run build      # static output in build/ (+ build/en/)
npm run serve
npm run docs:sync-en   # copy missing EN files from Hebrew (stubs)
npm run write-translations -- --locale en
```

From repo root:

- `npm run docs:dev` — Docusaurus only (port 3001)
- `npm run docs:build` — standalone site in `website/build/`
- `npm run docs:embed` — build for `/docs/*` and copy into `public/docs/` (required for the Nuxt app)

After changing docs, run `npm run docs:embed` before `npm run dev` or `npm run build` so `/docs/...` routes work inside the app.

**Production layout (path folder):** deploy only the root app image. Users open `https://<app-host>/docs/...`. Set build-arg `DOCUSAURUS_URL` to that host when running `docker build`. Default footer link: `NUXT_PUBLIC_DOCS_URL=/docs`.

## Translation workflow

Developers maintain both locales in Git. See [contributing/translations](docs/contributing/translations.md) (Hebrew) or `/en/docs/contributing/translations`.

## Docker / OpenShift

```bash
docker build -t copilot-metrics-docs .
docker run -p 8081:8080 copilot-metrics-docs
```

```bash
oc apply -f openshift/docs-deployment.yaml
```

Build image via `openshift/docs-image-build.yaml` or your CI pipeline.

Build args: `DOCUSAURUS_URL`, `DOCUSAURUS_BASE_URL`.

## App link

Footer **תיעוד** defaults to `/docs` on the same host (`NUXT_PUBLIC_DOCS_URL`, optional override).
