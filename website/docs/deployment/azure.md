---
title: Azure
---

# פריסה ב-Azure

האפליקציה רצה ב-Docker וניתן לפרוס אותה ב-Azure Container Apps, App Service או כל מארח קונטיינרים אחר.

## פריסה בלחיצה אחת (ARM)

הדרך הפשוטה ביותר — תבנית ARM שיוצרת:

- Azure Container App (Consumption)
- Azure Log Analytics Workspace

ה-image מגיע מ-`ghcr.io/github-copilot-resources/copilot-metrics-viewer`.

**דרישות:** הרשאת Contributor ל-resource group ו-subscription עם `Microsoft.App` מופעל.

> **עלות משוערת:** כ-$1 לחודש (2 מיליון בקשות ראשונות ב-Container Apps בחינם).

1. **אפשרות 1 — Personal Access Token ב-backend:**

   [![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fgithub-copilot-resources%2Fcopilot-metrics-viewer%2Fmain%2Fazure-deploy%2Fwith-token%2Fazuredeploy.json/uiFormDefinitionUri/https%3A%2F%2Fraw.githubusercontent.com%2Fgithub-copilot-resources%2Fcopilot-metrics-viewer%2Fmain%2Fazure-deploy%2Fwith-token%2Fportal.json)

2. **אפשרות 2 — GitHub App + אימות GitHub:**

   רשמו את האפליקציה ב-GitHub לפני הפריסה.

   [![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fgithub-copilot-resources%2Fcopilot-metrics-viewer%2Fmain%2Fazure-deploy%2Fwith-app-registration%2Fazuredeploy.json/uiFormDefinitionUri/https%3A%2F%2Fraw.githubusercontent.com%2Fgithub-copilot-resources%2Fcopilot-metrics-viewer%2Fmain%2Fazure-deploy%2Fwith-app-registration%2Fportal.json)

> **חשוב (אפשרות 2):** לאחר הפריסה עדכנו redirect URI ל-`https://<your-app>.azurecontainerapps.io/auth/github` בהגדרות האפליקציה ב-GitHub.

### רשת פרטית

ציינו subnet (לפחות /23) ל-Container Apps Environment. ליצירת Private DNS Zone:

[![DNS Zone deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fgithub-copilot-resources%2Fcopilot-metrics-viewer%2Fmain%2Fazure-deploy%2Fdns%2Fazuredeploy.json)

## פריסה עם Azure Developer CLI (azd)

בונה image מקומי מ-Bicep — יותר שליטה על הקוד והסריקות.

**דרישות:** Contributor, הרשאות role assignment, `az`, `azd`, Docker.

> **עלות משוערת:** כ-$10 לחודש (כולל Container Registry ~$5).

יוצר: Resource Group, Container App, Container Registry, Log Analytics, Application Insights, Key Vault.

```bash
azd up
```

## אבטחה

ברירת המחדל — אפליקציה ציבורית ללא אימות (אלא אם משתמשים ב-GitHub App). ניתן להוסיף EasyAuth, הגבלות IP או רשת פרטית ב-ACA / App Service.

## Health probes

חברו [בדיקות תקינות](./health-checks) — `/api/live`, `/api/ready`, `/api/health` (לא `/`).

פרטים נוספים: [DEPLOYMENT.md](https://github.com/github-copilot-resources/copilot-metrics-viewer/blob/main/DEPLOYMENT.md) בשורש הפרויקט.
