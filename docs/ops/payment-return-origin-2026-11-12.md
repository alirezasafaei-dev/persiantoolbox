# Payment return origin repair

A real paid checkout reached a success URL on `https://localhost:3000` instead of the public site. A targeted read-only database check confirmed payment completion, gateway reference and exactly one fulfillment/active purchased plan. No financial rows were changed and no second payment was requested.

Both browser callback handlers constructed redirect destinations relative to `request.url`. Behind the production reverse proxy, that origin may be the internal listener. This affects success, failure and login redirects, even when payment verification itself succeeds.

Use the existing server-configured `resolveSiteUrl()` for redirect bases in both payment callback and subscription confirmation GET handlers. Preserve verification, ownership checks, status mapping, idempotency, POST behavior and gateway configuration. Do not derive public redirects from caller-supplied Host/forwarded headers.

Regression tests use synthetic payment/user IDs and an internal localhost request with an untrusted forwarded hostname. All seven initial tests failed on the old redirect origin before repair. The final suite adds invalid-authority, missing-payment and foreign-payment checks: 35 focused payment tests pass, including all 10 redirect tests. No real gateway request or financial mutation occurs in the tests.

Local validation passed: lint (existing warnings retained), typecheck, local-first gate, all 273 test files / 2128 tests before the three additional passing regression cases, contracts, build and canonical standalone smoke (11 routes). The full suite used two workers without changing assertions or timeouts. Additional built-server HTTP checks confirmed public-origin cancellation/login redirects and preserved malformed-callback HTTP 400. An initial smoke assertion incorrectly expected malformed callbacks to redirect; it was corrected to match the existing input-validation contract. No built-server success callback or new payment was performed.

Independent review found no correctness or security blocker; its coverage suggestion was addressed with the three extra tests. Repository secret scanning and production dependency audit passed. Exact-head hosted verification remains required. This candidate is not published and requires its own explicit merge/release approval. The previous gateway-host repair fixed StartPay redirection but did not cover this return-origin defect. Never claim end-to-end payment acceptance solely from those earlier tests.

No payment IDs, account data, credentials or raw financial records are included in this patch. Raw targeted evidence remains private.
