# CSP Report-Only Hardening Audit — 2026-07-04

## Current CSP
From next.config.mjs headers():
- Base security headers present (X-Frame-Options: DENY, etc.).
- Actual CSP strings with 'unsafe-inline' are served (observed in live headers):
  - Enforced: script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
  - Report-Only: uses nonce (e.g. nonce-xxx) for script and style, with style-src-attr 'unsafe-inline'

lib/csp.ts provides getCspNonce() via headers (x-nonce or x-csp-nonce).

No root middleware.ts for CSP; handled in Next config + possibly proxy.

## Blockers by Category
1. **Inline JSON-LD scripts** (dangerouslySetInnerHTML):
   - app/(tools)/loan/page.tsx: <script id="loan-howto" type="application/ld+json" dangerouslySetInnerHTML>
   - components/seo/* (FaqSchema, HowToSchema, BreadcrumbSchema, BlogPostSchema, ToolSeoContent, HomePage)
   - These are static JSON but injected inline, not using nonce.

2. **React inline styles**:
   - style={{ ... }} in many components (e.g. LoanPage result cards, icons).

3. **Next.js hydration**:
   - Next.js emits inline scripts and styles for hydration in static/SSG pages.
   - Enforced CSP must allow 'unsafe-inline' currently to not break.

4. **Other**:
   - PDF worker, various dynamic imports.

## Affected Files/Routes
- All pages using JSON-LD schemas (most tool pages, blog, home).
- /loan specifically has inline HowTo script.
- High impact on /loan, financial tools, writing tools.

## Risk Level
MEDIUM-HIGH for enforcement.
- Breaking hydration or SEO structured data would be bad.
- Report-only is already active with nonce.

## Route-by-Route Migration Plan
1. Audit all dangerouslySetInnerHTML for JSON-LD.
2. Move JSON-LD to <script nonce={nonce} > where possible (requires passing nonce to components).
3. For static JSON-LD, use non-inline if possible or hash.
4. Remove inline style={{}} where feasible (use className + Tailwind).
5. Test route-by-route in staging with report-only violations logged.
6. Sequence: report-only improvements first, then per-route.

## Proposed PR Sequence
1. This audit doc PR.
2. Add nonce to key schema components (test on /loan).
3. Collect violations via report-only in staging.
4. Enforce only after full validation (human gate).

## Tests Needed
- CSP header tests (existing proxy-csp.test.ts).
- E2E with CSP report mode.
- Structured data validation.

## Human Approval Point
Full enforcement must have explicit human approval after staging validation and violation review.

## References
- Live headers show current policies.
- PR #91 (quarantine) touched LoanPage and ToolPageShell (unrelated to CSP).
