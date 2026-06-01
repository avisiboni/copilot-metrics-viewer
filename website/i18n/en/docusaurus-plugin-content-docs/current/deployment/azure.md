---
title: Azure
---

# Deploy to Azure

The app runs in Docker and can be hosted on Azure Container Apps, App Service, or any container platform.

## One-click ARM deployment

Creates:

- Azure Container App (Consumption)
- Azure Log Analytics Workspace

Image: `ghcr.io/github-copilot-resources/copilot-metrics-viewer`.

**Prerequisites:** Contributor on a resource group; subscription with `Microsoft.App` enabled.

> **Estimated cost:** ~$1/month (first 2M Container Apps requests free).

1. **Option 1 — PAT in backend:**

   [![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fgithub-copilot-resources%2Fcopilot-metrics-viewer%2Fmain%2Fazure-deploy%2Fwith-token%2Fazuredeploy.json/uiFormDefinitionUri/https%3A%2F%2Fraw.githubusercontent.com%2Fgithub-copilot-resources%2Fcopilot-metrics-viewer%2Fmain%2Fazure-deploy%2Fwith-token%2Fportal.json)

2. **Option 2 — GitHub App + GitHub auth:**

   Register the app in GitHub first.

   [![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fgithub-copilot-resources%2Fcopilot-metrics-viewer%2Fmain%2Fazure-deploy%2Fwith-app-registration%2Fazuredeploy.json/uiFormDefinitionUri/https%3A%2F%2Fraw.githubusercontent.com%2Fgithub-copilot-resources%2Fcopilot-metrics-viewer%2Fmain%2Fazure-deploy%2Fwith-app-registration%2Fportal.json)

> **Important (Option 2):** After deploy, set redirect URI to `https://<your-app>.azurecontainerapps.io/auth/github` in GitHub app settings.

### Private networking

Provide a subnet (at least /23) for the Container Apps Environment. Optional DNS zone template:

[![DNS Zone deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fgithub-copilot-resources%2Fcopilot-metrics-viewer%2Fmain%2Fazure-deploy%2Fdns%2Fazuredeploy.json)

## Azure Developer CLI (azd)

Builds from source via Bicep for more control.

**Prerequisites:** Contributor, role assignment permissions, `az`, `azd`, Docker.

> **Estimated cost:** ~$10/month (includes ~$5 for Container Registry).

Creates: Resource Group, Container App, Container Registry, Log Analytics, Application Insights, Key Vault.

```bash
azd up
```

## Security

Default deploy is public without auth unless using a GitHub App. Use EasyAuth, IP restrictions, or private networking on ACA / App Service.

## Health probes

Wire [health checks](./health-checks) — `/api/live`, `/api/ready`, `/api/health` (not `/`).

See also root [DEPLOYMENT.md](https://github.com/github-copilot-resources/copilot-metrics-viewer/blob/main/DEPLOYMENT.md).
