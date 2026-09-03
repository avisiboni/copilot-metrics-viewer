# Security audit report

**Application:** Copilot Metrics Viewer  
**Date:** 2026-05-29  
**Scope:** Client (Nuxt/Vue), server (Nitro API), dependencies, configuration  

## Executive summary

A full-stack security review identified **one critical authentication bypass**, several defense-in-depth gaps, and **30 npm advisories** (including 1 critical). All application issues listed below were remediated in code; `npm audit` reports **0 vulnerabilities** after dependency updates and `npm audit fix`.

## Findings and remediation

| ID | Severity | Finding | Remediation |
|----|----------|---------|-------------|
| SEC-001 | **Critical** | `?mock=true` / `?isDataMocked=true` forced `mock-token` auth on **all** `/api/*` routes even when `NUXT_PUBLIC_IS_DATA_MOCKED=false`, bypassing GitHub OAuth/PAT in production | Centralized `shouldUseMockData()` — query mock only when public mock is enabled **or** runtime is development |
| SEC-002 | High | Transitive dependency CVEs (h3 path traversal, undici smuggling/DoS, devalue/defu prototype pollution, vite dev-server issues, etc.) | Upgraded `nuxt`, `undici`, `happy-dom`; ran `npm audit fix`; tightened `brace-expansion` override |
| SEC-003 | Medium | GitHub teams pagination followed `Link: next` URLs without host validation (SSRF if header tampered) | `assertGitHubApiUrl()` restricts follows to `https://api.github.com` |
| SEC-004 | Medium | API errors returned raw exception messages to clients | `safeApiErrorMessage()` — generic messages in production |
| SEC-005 | Medium | Request logging included full URLs (query may leak tokens/params) | Log `pathname` only |
| SEC-006 | Medium | Missing baseline HTTP security headers | Added `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` via `routeRules` |
| SEC-007 | Low | `NUXT_SESSION_PASSWORD` not enforced at startup for OAuth deployments | Nitro plugin fails fast in production when OAuth enabled and password &lt; 32 chars |
| SEC-008 | Low | Premium credits POST accepted arbitrary strings in `logins[]` | GitHub username validation + filter |
| SEC-009 | Info | Locale cookie missing `Secure` on HTTPS | Set `Secure` when `location.protocol === 'https:'` |

## Verified secure patterns

- Metrics cache keys include SHA-256 fingerprint of `Authorization` header (see `metrics-auth-cache` tests).
- GitHub tokens stay server-side (`NUXT_GITHUB_TOKEN`, session `secure` payload); not exposed in `runtimeConfig.public`.
- No `v-html` / `innerHTML` XSS sinks found in Vue components.
- Mock JSON paths are fixed allowlist filenames, not user-controlled.
- Health endpoints (`/api/health`, `/api/live`, `/api/ready`) correctly skip auth middleware.

## Dependency audit (after fix)

```
npm audit: 0 vulnerabilities
```

Direct updates: `nuxt@^3.21.6`, `undici@^7.26.0`, `happy-dom@^20.9.0`.

## Recommendations (operational)

1. Set `NUXT_SESSION_PASSWORD` to a random string ≥ 32 characters for every production deployment using GitHub OAuth.
2. Do **not** set `NUXT_PUBLIC_IS_DATA_MOCKED=true` in production unless the instance is intentionally public/demo.
3. Terminate TLS at the edge; security headers and `Secure` cookies assume HTTPS in production.
4. Rotate `NUXT_GITHUB_TOKEN` / OAuth client secret on a schedule; use least-privilege PAT scopes documented in README.
5. Re-run `npm audit` in CI on each release.

## Test evidence

- Unit: `mock-mode-security`, `github-login`, `github-api-url`, existing auth/cache suites.
- E2E: Playwright suite with `?mock=true` (development/mock flows).
