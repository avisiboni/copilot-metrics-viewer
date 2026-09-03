---
title: AI assistant (chat)
---

# AI assistant in the dashboard

![Copilot Chat tab (chat metrics)](/img/ui/copilot-chat-tab.png)

A floating action button (robot icon) opens a **chat assistant** that answers questions about dashboard metrics in the context of the active tab. The **Copilot Chat** sidebar tab shows chat usage charts and KPIs.

## Enable / disable

```env
NUXT_PUBLIC_ENABLE_AI_CHAT=true   # default: true
```

To disable:

```env
NUXT_PUBLIC_ENABLE_AI_CHAT=false
```

## GitHub Models authentication

The assistant uses the [GitHub Models API](https://docs.github.com/en/github-models). A **user token** is required (not the server PAT):

1. Click the FAB — if no token is configured, a setup screen appears.
2. Create a PAT with `models:read` (or complete OAuth per in-app instructions).
3. Paste the token — stored in the browser session only.

## Suggested questions

Suggestions change by **active tab** (Organization, Users, Seat analysis, etc.) — see `shared/i18n/aiChatSuggestions.ts`.

## API

- `POST /api/ai/chat` — sends messages; server calls GitHub Models with limited context.

## Privacy

- Only summary/context from the dashboard is sent — not full raw API payloads.
- The Models user token is **not** the server `NUXT_GITHUB_TOKEN`.

## Links

- [Shell navigation](./ui-reference/shell-navigation)
- [API routes](../reference/api-routes)
