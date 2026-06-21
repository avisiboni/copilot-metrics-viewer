# How docs are served in Nuxt

## Summary

Docs are **not** a Nuxt route or Vue page. They are a **separate Docusaurus site**, built to static HTML, copied into `public/docs/`, and served by Nitro as static files on the same host under `/docs/`.

---

## Architecture

```text
Route / Ingress (single host)
  ├─ /              → Nuxt app (Vue pages)
  ├─ /api/*         → Nitro server routes
  └─ /docs/*        → public/docs/ (static files from docs:embed)
```

```mermaid
flowchart LR
  A[website/docs/*.md] --> B[Docusaurus build]
  B --> C[website/build/]
  C --> D[embed-in-app-public.mjs]
  D --> E[public/docs/]
  E --> F[Nitro static file server]
  F --> G["/docs/* on same host"]
```

---

## 1. Source: Docusaurus (`website/`)143591

| Item | Location |
|------|----------|
| Hebrew docs (default) | `website/docs/` |
| English mirror | `website/i18n/en/docusaurus-plugin-content-docs/current/` |
| Config | `website/docusaurus.config.ts` |

**Embedded build** (for Nuxt):

```bash
DOCUSAURUS_BASE_URL=/docs/ npm run build
# or from repo root:
npm run docs:embed
```

When `DOCUSAURUS_BASE_URL=/docs/`:

- `baseUrl` → `/docs/` (assets and links rooted at `/docs/`)
- `docsRouteBasePath` → `/` (pages are `/docs/intro`, not `/docs/docs/intro`)

---

## 2. Embed: copy into Nuxt `public/`

**Script:** `npm run docs:embed` (repo root)

Steps:

1. Run `website` build with `DOCUSAURUS_BASE_URL=/docs/` (`build:embed`)
2. Run `website/scripts/embed-in-app-public.mjs`
   - Deletes `public/docs/`
   - Copies `website/build/` → `public/docs/`

**Example mapping:**

| File | URL |
|------|-----|
| `public/docs/index.html` | `http://localhost:3000/docs/` |
| `public/docs/intro/index.html` | `/docs/intro` |
| `public/docs/en/...` | `/docs/en/...` |

> `public/docs/` is **gitignored**. Run `npm run docs:embed` before dev, or use `npm run build` (embed is included).

---

## 3. How Nuxt serves them

There is **no** `app/pages/docs/` route.

Nuxt/Nitro serves everything under `public/` at the matching URL path.

| URL | Handler |
|-----|---------|
| `/` | Nuxt Vue app |
| `/api/*` | Nitro API |
| `/docs/**` | Static files from `public/docs/**` |

**Nuxt config** (cache headers only):

```ts
routeRules: {
  '/docs/**': { headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } },
}
```

---

## 4. Link from the dashboard

**Env:** `NUXT_PUBLIC_DOCS_URL` (default: `/docs`)

**Config:** `nuxt.config.ts` → `runtimeConfig.public.docsUrl`

**UI:** Footer link in `app/layouts/default.vue`

- Same-origin: `/docs`
- External: set full URL, e.g. `https://docs.example.com`

App language and docs language are **independent** (app i18n ≠ Docusaurus locale).

---

## 5. Production build

```json
"build": "npm run docs:embed && nuxt build"
```

Docker runs `npm run build`, so the image includes embedded docs. One host, one ingress — no separate docs server.

**Docker:** `DOCUSAURUS_URL` is passed at build time for canonical/OG links in the static site.

---

## 6. Local development

| Command | Result |
|---------|--------|
| `npm run dev` | Nuxt on `:3000` — serves `/docs/` **only if** `public/docs/` exists |
| `npm run docs:embed` | Build + copy docs into `public/docs/` |
| `npm run docs:dev` | Docusaurus standalone on `:3001` (not embedded under `/docs/` unless using embed build settings) |
| `npm run docs:dev:en` | Docusaurus English on `:3001/en` |

**Typical workflow for `/docs/` on the app:**

```bash
npm run docs:embed
npm run dev
# open http://localhost:3000/docs/
```

---

## 7. npm scripts (repo root)

```json
"docs:dev": "npm run start --prefix website",
"docs:dev:en": "npm run start:en --prefix website",
"docs:build": "npm run build --prefix website",
"docs:embed": "npm run build:embed --prefix website && node website/scripts/embed-in-app-public.mjs",
"docs:sync-en": "npm run docs:sync-en --prefix website"
```

---

## 8. Key files

| File | Role |
|------|------|
| `website/docusaurus.config.ts` | Docusaurus config, `baseUrl`, embed paths |
| `website/scripts/embed-in-app-public.mjs` | Copy build → `public/docs/` |
| `website/src/pages/index.tsx` | Docs landing at `/docs/` |
| `public/docs/` | Generated static site (gitignored) |
| `nuxt.config.ts` | `/docs/**` cache headers, `docsUrl` |
| `.gitignore` | Ignores `public/docs`, `website/build` |

---

## One-liner

**Docusaurus builds static HTML → copied to `public/docs/` → Nuxt/Nitro serves it at `/docs/*` with no Vue integration.**
