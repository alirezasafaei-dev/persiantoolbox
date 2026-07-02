# CSP Rollout Plan (Report-Only -> Enforced)

## Scope

- Pages: `/`, core tool routes, `/offline`
- Middleware/proxy: `proxy.ts`
- Nonce source: per-request `x-csp-nonce`
- Current enforced posture: `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'` remain for static Next.js HTML compatibility.
- Current report-only target: nonce-backed `script-src 'self' 'nonce-...'`, nonce-backed `style-src 'self' 'nonce-...'`, and temporary `style-src-attr 'unsafe-inline'` for React inline style attributes still in use.
- Verified blocker: prerendered Next.js pages emit inline hydration scripts without nonces. A global enforced nonce policy turns the static route surface into dynamic rendering if the root layout reads request headers, or blocks static app-shell scripts if enforced from proxy only.

## Rollout Stages

1. Stage A (local/report-only):

- Keep the compatible enforced CSP.
- Send the nonce-backed target as `Content-Security-Policy-Report-Only`.
- Validate headers and nonce e2e on `/`, `/pdf-tools`, and `/offline`.

2. Stage B (staging/production report-only window):

- Ship the report-only target for at least one release window.
- Collect violations via same-origin endpoint `/api/security/csp-report` if report ingestion is enabled.
- Inventory static inline Next.js scripts, JSON-LD scripts, and React inline style attributes that would violate the target policy.

3. Stage C (production enforced):

- Promote the nonce/hash policy to enforced `Content-Security-Policy` only after static pages either preserve safe prerendering with compatible hashes or have a route-scoped dynamic rendering tradeoff approved.
- Keep temporary report-only mirror for one additional release window.

## Gate Contracts

- `tests/e2e/security-headers.spec.ts` validates:
- enforced CSP presence on `/`, `/pdf-tools`, `/offline`
- compatible enforced `script-src`/`style-src` while the static app shell still depends on inline scripts
- report-only CSP nonce alignment and absence of broad `script-src 'unsafe-inline'` / `style-src 'unsafe-inline'`
- no HSTS header in non-production runtime

## Rollback Trigger

- Any reproducible route break in core tools or offline fallback due to CSP.
- On trigger: revert to previous known-good policy and re-run e2e/security contracts.
