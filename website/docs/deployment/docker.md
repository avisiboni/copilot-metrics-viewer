---
title: Docker
---

# Docker — אפליקציה

## Build

```bash
docker build -t copilot-metrics-viewer .
```

## Run

```bash
docker run -p 8080:80 --env-file .env copilot-metrics-viewer
```

## תיעוד (אתר סטטי)

```bash
docker build -f website/Dockerfile -t copilot-metrics-docs ./website
docker run -p 8081:8080 copilot-metrics-docs
```
