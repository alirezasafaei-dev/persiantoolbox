# Staging Restore Runbook — 2026-07-04 (updated)

## Quick Diagnosis (new)

pnpm verify:staging

# or

node scripts/verify-staging.mjs

This will report exact TLS mismatch, DNS, HTTP status, assets.

## Pre-Checks

... (same as before)

## On VPS

... (same)

## Fix SSL

... (same)

## Run Verification

After fixes:
pnpm verify:staging

## Rollback

... (same)
