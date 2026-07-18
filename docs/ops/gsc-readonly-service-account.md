# Google Search Console readonly service-account runbook

This runbook connects PersianToolbox to the official Google Search Console API without exposing credentials to the browser, Git repository, issue tracker, or chat.

## Security boundary

- Use a dedicated service account.
- Grant it access only to `persiantoolbox.ir` in Search Console.
- Keep the JSON key outside the repository.
- Use only `https://www.googleapis.com/auth/webmasters.readonly`.
- Never use a `NEXT_PUBLIC_*` variable for Google credentials.
- Never print, upload, commit, or paste the private key.

## Expected local path

```bash
install -d -m 700 "$HOME/.config/persiantoolbox"
chmod 600 "$HOME/.config/persiantoolbox/gsc-service-account.json"
```

The key should exist at:

```text
~/.config/persiantoolbox/gsc-service-account.json
```

## Environment

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/persiantoolbox/gsc-service-account.json"
export GOOGLE_SEARCH_CONSOLE_SITE_URL="sc-domain:persiantoolbox.ir"
```

`GSC_SITE_URL` is accepted by the verifier as a compatibility alias, but the runtime application uses `GOOGLE_SEARCH_CONSOLE_SITE_URL`.

## Verify before starting the app

```bash
node scripts/quality/verify-gsc-readonly.mjs --json
```

A successful result must show:

- `ok: true`
- `readonly: true`
- `property: sc-domain:persiantoolbox.ir`
- a non-empty Search Console permission level
- successful Performance and Sitemap probes

The verifier never performs a write request.

## Verify the existing admin integration

Start the application locally with the environment variables loaded, authenticate as an administrator, and request:

```text
/api/admin/google-search-console?action=health
/api/admin/google-search-console?action=indexing
/api/admin/google-search-console?action=sitemaps
```

Do not expose these admin routes publicly without the existing administrator session checks.

## Production installation

Store the key in a protected server-only path, for example:

```text
/etc/persiantoolbox/secrets/gsc-service-account.json
```

Recommended permissions:

```bash
sudo chown root:persiantoolbox /etc/persiantoolbox/secrets/gsc-service-account.json
sudo chmod 640 /etc/persiantoolbox/secrets/gsc-service-account.json
```

Add only the path and property identifier to the server-side environment used by PM2/systemd:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/etc/persiantoolbox/secrets/gsc-service-account.json
GOOGLE_SEARCH_CONSOLE_SITE_URL=sc-domain:persiantoolbox.ir
```

A production environment change and process restart require explicit deployment approval.

## Troubleshooting

### Property is not visible

Confirm the exact `client_email` from the local JSON key has access to the Domain Property in Search Console. Do not send the JSON key.

### Permission error

Use the exact property identifier:

```text
sc-domain:persiantoolbox.ir
```

Do not use `https://persiantoolbox.ir/` when the service account was added only to the Domain Property.

### File permissions error

```bash
chmod 600 "$GOOGLE_APPLICATION_CREDENTIALS"
```

### API not enabled

Enable the Google Search Console API in the Google Cloud project associated with the service account, then repeat the verifier command.
