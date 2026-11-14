# Market API validation — 2026-11-13

## Problem and scope

The public market endpoint could accept incomplete upstream responses and emit
fallback or zero prices as a successful snapshot. Public browser clients also
lacked an explicit cross-origin response header. This correction validates the
existing sources; it does not introduce a new provider or certify Iranian
free-market exchange rates.

## Behavior

- Require positive finite currency and crypto prices, complete required quotes,
  and finite crypto/gold changes. Require the USD base rate to equal one.
- Validate the derived, rounded gold price before caching. Overflow and values
  that round to zero are rejected.
- Preserve the last complete snapshot and its original acquisition timestamp
  with `freshness: stale` after upstream failure.
- Return HTTP 503 with `ok: false`, `Retry-After: 30` and `Cache-Control: no-store`
  when no validated snapshot exists. Do not substitute sample prices.
- Share concurrent refresh work within each Node process; suppress repeated
  failed refreshes for 30 seconds. This is not a cross-process shared cache.
- Permit public cross-origin GET responses with `Access-Control-Allow-Origin: *`.
- Document the 503 contract and label example figures as illustrative.

The gold estimate derives from Tether Gold USD and the provider's reference IRR
rate. It is not an independently sourced Iranian retail gold quotation.
`timestamp` records service acquisition, not provider publication time.

## Verification

Seven route regressions cover invalid currency data, missing crypto, invalid
derived gold prices, concurrent refresh work, cached/stale results, retained
timestamps and failure cooldown. Upstream requests in these tests are mocked.
The two derived-gold regressions failed before the guard and passed afterward.
Four existing API-catalog tests also passed.

An initial full quick gate had one unrelated admin-content test import timeout
while the production build ran concurrently. Its isolated rerun passed all 12
tests. The subsequent full quick gate passed 2,208 tests in 286 files. No timeout
or security assertion was weakened.

Final `pnpm ci:contracts`, `pnpm build` and canonical `pnpm smoke:local` passed
(11 routes, `SMOKE_HOST=127.0.0.1`, `SMOKE_PORT=3100`). A Chromium page served
from a separate local origin read the standalone API response successfully:
HTTP 200, `freshness: live`, positive gold price. The documentation heading and
illustrative-example notice were visible at 1440px and 390px widths.

Repository secret scanning and staged Gitleaks passed. Independent review's
documentation and derived-price findings were corrected and re-reviewed with
no remaining blocking source findings. Hosted CI, owner authorization,
canonical deployment and live acceptance remain separate gates. This document
does not authorize merge or publication.
