# Security Secrets Policy

## Goal

Prevent accidental commit of high-risk credentials and enforce reproducible scanning in local and CI workflows.

## Required Checks

Run both checks before merge:

```bash
pnpm security:secrets
pnpm security:scan
```

- `security:secrets`: regex-based scan over tracked files for common credential patterns.
- `security:scan`: production dependency vulnerability audit (high severity threshold).

## What Must Never Be Committed

- Private keys (`-----BEGIN ... PRIVATE KEY-----`)
- Cloud/provider access keys
- PAT tokens (GitHub/Slack/etc.)
- Database URLs containing passwords
- Production-only webhook/ingest secrets

## Safe Workflow

1. Keep real credentials only in environment management, never in git.
2. Use `.env.example` for placeholders and contract keys only.
3. Rotate credentials immediately if a leak is detected.
4. If an incident happens, revoke, rotate, and open a security incident report in the same day.
