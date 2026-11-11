# Zarinpal payment endpoint repair — 2026-11-11

## Defect and evidence

The production adapter used `https://api.zarinpal.com` for both API calls and
customer-facing StartPay URLs. A bounded live investigation reproduced HTTP 301
from that host's StartPay URL to `https://www.zarinpal.com/`, dropping the payment
path and authority. Both a synthetic authority and an existing request reproduced
the redirect. No new payment was created or paid during that investigation.

[Zarinpal's current connection guide](https://www.zarinpal.com/docs/paymentGateway/connectToGateway)
specifies `https://payment.zarinpal.com` for request, verification and StartPay.
The documented StartPay host returned HTTP 200 and a bank-transfer page for the
existing request when the site Referer was supplied. Without that Referer, one
earlier probe returned HTTP 400; this is not proof of universal browser/network
compatibility. The legacy API request endpoint still returned a structured
validation error to an empty request; it was not observed to be completely down.

## Change

Use the documented production host for all four adapter methods. Preserve the
sandbox host, callback selection, amount handling, timeout, authentication and
verification/fulfillment behavior. No dependencies or production configuration
changes are required.

## Verification contract

- Regression tests exercise `createPayment`, `createCheckout`, `verifyPayment`
  and `verifyCallback` in default production, explicit production and sandbox.
- Assert actual output URLs, retained authority, request endpoint, amount,
  callback and timeout signal. Provider HTTP responses are simulated; no
  credentials or financial requests are used by these tests.
- Before repair: 8 production cases failed on the wrong hostname; 4 sandbox
  cases passed. After repair: all 12 cases passed; all 47 payment tests passed.
- Run project lint/typecheck/local-first/full tests, contracts, build, canonical
  standalone smoke and secret/dependency checks before proposing publication.

## Acceptance limits and follow-up

Local and CI success do not prove a live payment. Publication requires owner
authorization and exact-revision verification. After publication, verify that
an authorized checkout reaches the documented payment host with its authority
intact; a successful charge, callback and entitlement grant remain separate
end-to-end acceptance requirements. Never grant credit based only on a redirect
or an inquiry result.

Existing pending-record reconciliation is a separate controlled operational
task. This repair does not rewrite financial history or infer payment success
from pending records. Private gateway references, merchant values, account data
and database exports are excluded from this document.
