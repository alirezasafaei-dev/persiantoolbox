# CSP Report-Only Hardening Audit — 2026-07-04

## Current CSP
From proxy.ts and next.config:
- Enforced: script-src 'self' 'unsafe-inline' (for Next hydration)
- Report-Only: nonce based

## Guardrails Added
- tests for policies
- audit script

See main report for blockers.
