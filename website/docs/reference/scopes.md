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

## אימיילים / ספריית חברים

- `read:user` או `admin:org` + הרשאת SAML

## OAuth

הוסיפו את אותם scopes ל-`NUXT_OAUTH_GITHUB_CLIENT_SCOPE` והתחברו מחדש.

## בדיקה

בהודעת Billing מוצגים לעיתים **Token scopes** מהכותרת `X-OAuth-Scopes`.
