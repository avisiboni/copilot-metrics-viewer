---
title: Invite members
---

# Invite members tab

Invite GitHub users to an organization — **single email** or **bulk Excel upload**.

:::info
The tab appears in the sidebar (`?tab=invite-members`). No date range is required.
:::

## Permission requirements

The token (`NUXT_GITHUB_TOKEN` / OAuth) must be an **organization owner** with:

- `admin:org` (classic PAT), or
- Organization members: Write on a GitHub App / fine-grained PAT

See also [GitHub scopes](../reference/scopes).

## Organization picker

| Field | Description |
|-------|-------------|
| **Organization** | Picker — current org from config, plus enterprise orgs when `NUXT_PUBLIC_GITHUB_ENT` is set |
| **Organization slug** | Manual entry when the org is not in the list (enabled when no picker selection) |
| **Member role** | `direct_member` (default), `admin`, `billing_manager`, or `reinstate_member` |

## Single invite

1. Select an organization.
2. Enter an email address.
3. Click **Send invitation**.

GitHub emails the invitation (including when no GitHub account is linked yet).

## Bulk Excel upload

1. Prepare a `.xlsx` file (or download the **Excel template** from the tab).
2. **Required:** the first sheet must include a column named `email` (or `Email` / `EMAIL` — case-insensitive).
3. Upload the file — a preview of unique emails is shown.
4. Click **Invite N users**.

### Example file layout

Workshop / participant exports may include extra columns (name, domain, IP, etc.) — they are **ignored**. An `email` column is enough:

| Domain | First name | Last name | Email | IP address |
|--------|------------|-----------|-------|------------|
| Platforms | Ariel | Cohen | arielc@example.com | 172.22.47.239 |
| CX | Gal | Shahar | galsha@example.com | 172.22.94.66 |

### Common errors

| Situation | Message |
|-----------|---------|
| No `email` column | The file must include a column named `"email"` |
| Empty file | The file is empty or could not be read |
| No valid values | No email addresses found / none are valid |
| GitHub 403 | Missing owner / `admin:org` on the selected organization |

Rows with invalid emails are **skipped** (counted in a warning) — the rest of the list is still sent.

## Results

After sending, a per-email table shows success / failure plus the GitHub message (e.g. already a member, no seats available).

Click **Download results** to export a CSV (`email`, `status`, `http_status`, `message`, `invitation_id`, `organization`, `role`).

Invitations are sent **sequentially** with a short delay to reduce GitHub secondary rate limiting. Maximum **200** emails per request.

## API

`POST /api/org-invitations` — body: `{ org, emails[], role? }`.

Calls GitHub: `POST /orgs/{org}/invitations` with `{ email, role }`.

See [API routes](../reference/api-routes) and [GitHub network endpoints](../reference/github-network-endpoints).
