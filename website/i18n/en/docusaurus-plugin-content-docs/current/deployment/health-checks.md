---
title: Health checks
---

# Health checks

App: `/api/live`, `/api/ready`, `/api/health` on port 80.

Docs nginx: `/healthz` on port 8080.

Do not use `/` as a probe for the app — it triggers GitHub API calls.
