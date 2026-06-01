---
title: בדיקות תקינות
---

# בדיקות תקינות (Kubernetes / OpenShift)

| נתיב | שימוש |
|------|--------|
| `/api/live` | Liveness |
| `/api/ready` | Readiness |
| `/api/health` | סטטוס כללי |

```yaml
livenessProbe:
  httpGet:
    path: /api/live
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /api/ready
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

:::info
אל תשתמשו ב-`/` כ-probe — זה מפעיל קריאות GitHub API.
:::

## אתר תיעוד (nginx)

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
```
