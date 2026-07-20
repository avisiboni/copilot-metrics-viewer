---
title: הרשאות GitHub
---

# הרשאות GitHub (scopes)

## PAT מומלץ

- `copilot`
- `manage_billing:copilot`
- `manage_billing:enterprise` (enterprise)
- `read:org`
- `read:enterprise` (enterprise)
- `admin:org` — **הזמנת חברים לארגון** (לשונית Invite members)

## אימיילים / ספריית חברים

- `read:user` או `admin:org` + הרשאת SAML

## הזמנת חברים (Invite members)

- Classic PAT: `admin:org` (והמשתמש בעלים של הארגון)
- Fine-grained / GitHub App: **Organization members → Write**
- ראו [הזמנת חברים](../user-guide/invite-members)

## OAuth

הוסיפו את אותם scopes ל-`NUXT_OAUTH_GITHUB_CLIENT_SCOPE` והתחברו מחדש.

## בדיקה

בהודעת Billing מוצגים לעיתים **Token scopes** מהכותרת `X-OAuth-Scopes`.
