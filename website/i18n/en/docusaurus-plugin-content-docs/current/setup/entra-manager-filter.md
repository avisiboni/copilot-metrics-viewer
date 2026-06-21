---
title: Filter by manager (Entra ID)
---

# Filter by manager — Microsoft Entra ID

Filter the dashboard to a manager's **direct reports** in Azure AD / Entra ID using Microsoft Graph.

## Enable

```env
NUXT_PUBLIC_ENTRA_CLIENT_ID=<app-registration-client-id>
NUXT_PUBLIC_ENTRA_TENANT_ID=<tenant-id>   # optional; use common for multi-tenant
```

Without these variables the filter is hidden (except in mock mode).

## User flow

1. User signs in with **Microsoft** (MSAL).
2. Search for a manager by name/UPN (`GET /api/org-search`).
3. Select a manager → dashboard filters to their reports (`reports-to:` scope).

## URLs

```
/orgs/<org>/reportsto/<encoded-upn>
/enterprises/<ent>/reportsto/<encoded-upn>
```

## Internal APIs

| Route | Purpose |
|-------|---------|
| `GET /api/org-search` | Search users/managers |
| `GET /api/org-reports` | Direct reports for a manager |
| `GET /api/msal/callback` | MSAL redirect |

## Graph permissions

In Azure App Registration grant permissions to read org structure (e.g. `User.Read`, `User.Read.All` per your policy). Apply least privilege.

## Links

- [Authentication](./authentication)
- [Environment variables](../reference/environment-variables)
