# CSP Rollout Plan (Report-Only -> Enforced)

## Scope

- Pages: `/`, core tool routes, `/offline`
- Middleware/proxy: `proxy.ts`
- Nonce source: per-request `x-csp-nonce`

## Rollout Stages

1. Stage A (staging):

- Keep enforcement enabled in staging, validate headers and nonce e2e.
- Verify no breakage for service worker, static fonts, and same-origin fetch calls.

2. Stage B (production report-only window):

- Mirror enforced policy as `Content-Security-Policy-Report-Only` for one release window.
- Collect violations via same-origin endpoint `/api/security/csp-report` if report ingestion is enabled.

3. Stage C (production enforced):

- Promote policy to enforced `Content-Security-Policy`.
- Keep temporary report-only mirror for one additional release window.

## Gate Contracts

- `tests/e2e/security-headers.spec.ts` validates:
- CSP presence on `/`, `/pdf-tools`, `/offline`
- nonce on root JSON-LD script and CSP nonce alignment
- no HSTS header in non-production runtime

## Rollback Trigger

- Any reproducible route break in core tools or offline fallback due to CSP.
- On trigger: revert to previous known-good policy and re-run e2e/security contracts.
