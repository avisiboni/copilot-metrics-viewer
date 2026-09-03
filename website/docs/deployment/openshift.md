---
title: OpenShift
---

# פריסה ב-OpenShift / Kubernetes

## פריסה מומלצת: אפליקציה אחת, תיעוד תחת `/docs`

בארגונים שבהם אסור subdomain נפרד לתיעוד, מגישים **רק** את image ה-Nuxt. התיעוד נבנה לתוך האפליקציה (`npm run docs:embed` — חלק מ-`npm run build`) ונגיש בנתיב:

| נתיב | תוכן |
|------|------|
| `/` | לוח הבקרה (Nuxt) |
| `/docs/...` | תיעוד Docusaurus (קבצים סטטיים ב-`public/docs/`) |
| `/docs/en/...` | תיעוד באנגלית |

### שלבים

1. בנו image מה-`Dockerfile` בשורש הפרויקט.
2. העבירו ב-build את כתובת האפליקציה הציבורית:

   ```bash
   docker build \
     --build-arg DOCUSAURUS_URL=https://metrics.apps.cluster.example.com \
     -t copilot-metrics-viewer .
   ```

3. דחפו ל-Registry, צרו `Deployment` + `Service` + **Route אחד** (ללא Route נפרד לתיעוד).
4. הגדירו Secrets למשתני `.env` (טוקן, session password).
5. חברו probes — [Health checks](./health-checks).

```bash
oc new-app --name=copilot-metrics-viewer \
  --docker-image=<registry>/copilot-metrics-viewer:latest
oc set env --from=secret/copilot-metrics-env deployment/copilot-metrics-viewer
oc expose svc/copilot-metrics-viewer
```

### משתני סביבה (אפליקציה)

| משתנה | ערך מומלץ |
|--------|-----------|
| `NUXT_PUBLIC_DOCS_URL` | `/docs` (ברירת מחדל — אותו host) |
| `DOCUSAURUS_URL` (build-arg בלבד) | `https://<route-host>` של האפליקציה |

אין צורך ב-`website/openshift/docs-deployment.yaml` לפריסה זו.

## CI/CD

1. `docker build` עם `DOCUSAURUS_URL` = URL ה-Route של האפליקציה.
2. `oc set image deployment/copilot-metrics-viewer ...`

שינוי בתיעוד דורש build מחדש של image האפליקציה (התיעוד מוטמע ב-build).

## פריסת תיעוד נפרדת (אופציונלי)

`website/Dockerfile` ו-`website/openshift/docs-deployment.yaml` מיועדים רק לסביבות שמאפשרות **host נפרד** לתיעוד. לא נדרש כשהתיעוד חי תחת `/docs` על אותו Route.

:::tip
בסביבת פיתוח: `npm run docs:embed` ואז `npm run dev` — או `npm run docs:dev` על פורט 3001 לעריכת תוכן בלבד.
:::
