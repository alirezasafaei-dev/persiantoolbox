# Staging Restore Plan — 2026-07-04 (updated with verification tooling)

## Current Staging Status

- https://staging.persiantoolbox.ir is UNREACHABLE.
- SSL certificate error for staging subdomain.
- Use the new verification script for diagnosis.

## Verified Evidence

- See previous.

## New Verification Tooling

Run: pnpm verify:staging or node scripts/verify-staging.mjs

The script performs:

- DNS
- TLS cert subject/SAN (will report exact mismatch)
- HTTP status for key endpoints
- CSS, font, PDF worker availability

## Exact Manual Commands

See updated runbook docs/ops/staging-restore-runbook-2026-07-04.md

## Rollback etc.

Same as before.
