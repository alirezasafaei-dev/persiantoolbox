# Google Search Console read-only access

This runbook configures read-only, server-side access to the private Search Console property without committing credentials.

## Authentication model

An API key alone is not sufficient for private Search Console property data. Use OAuth 2.0 credentials. For unattended local/CI automation, a dedicated Google service account is the preferred operational model.

## Google Cloud setup

1. Create or select a dedicated Google Cloud project.
2. Enable **Google Search Console API**.
3. Create a service account named similar to `persiantoolbox-gsc-readonly`.
4. Do not grant unrelated Google Cloud project roles.
5. Create a JSON key only when the runtime cannot use keyless identity.
6. Store the JSON outside the repository and restrict filesystem permissions.

Example local path:

```text
~/.config/persiantoolbox/gsc-service-account.json
```

Example permissions:

```bash
chmod 600 ~/.config/persiantoolbox/gsc-service-account.json
```

## Search Console permission

In Search Console:

1. Select the `persiantoolbox.ir` Domain property.
2. Open **Settings → Users and permissions**.
3. Add the service account `client_email` as a user with the minimum permission required for read-only reports and URL inspection.
4. Do not paste the private key into Search Console, GitHub, chat, issues, logs, or environment examples.

The Domain property identifier used by the API is normally:

```text
sc-domain:persiantoolbox.ir
```

Confirm it by calling `sites.list`; do not hard-code it before discovery.

## Runtime configuration

Preferred environment-variable pattern:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/persiantoolbox/gsc-service-account.json"
export GSC_SITE_URL="sc-domain:persiantoolbox.ir"
```

For an MCP server that expects its own variable:

```bash
export GOOGLE_SERVICE_ACCOUNT_FILE="$HOME/.config/persiantoolbox/gsc-service-account.json"
```

Environment files containing real secrets must remain outside Git or be covered by `.gitignore`.

## Required OAuth scope

Use read-only access unless a documented operation requires writes:

```text
https://www.googleapis.com/auth/webmasters.readonly
```

## Smoke tests

The integration must first perform these non-mutating operations:

1. List accessible Search Console properties.
2. Confirm `sc-domain:persiantoolbox.ir` is present.
3. Query aggregate Search Analytics totals for a short historical range.
4. List submitted sitemaps.
5. Inspect one known public URL.

Never submit or delete a sitemap, add/remove a property, or request write scope as part of the smoke test.

## MCP safety requirements

Google does not provide an official Search Console MCP server in the current project. Any MCP bridge is third-party code and must be reviewed before receiving credentials.

Prefer:

- local `stdio` transport;
- source-reviewed or pinned release artifacts;
- read-only scope;
- a dedicated service account;
- a credential file path passed through environment variables;
- no hosted intermediary receiving the private key;
- logs that redact tokens, private keys, client emails when appropriate, and request headers.

Minimum MCP tools:

- `list_sites`
- `query_search_analytics`
- `list_sitemaps`
- `inspect_url`

## Secret handling

Never:

- paste the JSON key or OAuth client secret into a chat;
- commit `credentials.json`, `token.json`, or service-account keys;
- upload the key as a GitHub issue/PR attachment;
- expose the key in client-side `NEXT_PUBLIC_*` variables;
- print access tokens in CI logs.

Rotate the key immediately if it is exposed.
