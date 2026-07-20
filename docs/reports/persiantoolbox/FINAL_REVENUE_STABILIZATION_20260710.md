# PersianToolbox Revenue Stabilization Report

**Updated:** 2026-07-20  
**PR:** #161 — `fix/payment-revenue-hardening-2026-07-20`  
**HEAD:** `1549eeba` (lint-clean)  
**Verdict:** `PAYMENT_E2E_BLOCKED_BY_CREDENTIALS`

## Executive verdict

The code-level payment path has been materially hardened, but revenue production approval is **not granted**. A real Zarinpal sandbox transaction, production-database migration evidence, authenticated admin verification, and final CI evidence are still required.

## Implemented controls

### Gateway and amount contract

- Production fails closed when `ZARINPAL_MERCHANT_ID` is absent.
- Application prices remain Toman; the gateway amount is persisted explicitly in IRR.
- Checkout and verification use the same server-derived amount.
- Callback `Amount` is never used as a source of truth.
- Raw Zarinpal Authority is normalized and persisted.
- Zarinpal requests have a bounded 10-second timeout.
- Only Zarinpal codes `100` and `101` are treated as successful verification results.

### Two-phase verification

Provider verification occurs **outside** any database transaction:

1. read the persisted payment and server-owned amount;
2. contact the gateway without holding a PostgreSQL row lock;
3. begin a short transaction;
4. lock the payment with `FOR UPDATE`;
5. revalidate gateway, Authority, amount, state, and reference ID;
6. complete payment and fulfill entitlement atomically.

### Immutable fulfillment idempotency

- Added `payment_fulfillments`, keyed permanently by `payment_id`.
- Duplicate or concurrent callbacks cannot apply the same payment twice.
- Subscription IDs are valid UUID values.
- Updating the current subscription's `payment_id` no longer destroys historical idempotency evidence.
- Completed subscription payments without ledger evidence are moved to `reconciliation_required`; they are not silently re-applied.

### Server-owned pricing

- Subscription price and period are resolved from server pricing.
- Generic client-priced checkout is fail-closed with `SERVER_PRICED_CHECKOUT_REQUIRED`.
- Unimplemented payment methods are unavailable.

### Callback and webhook security

- User-facing subscription confirmation verifies payment ownership before provider verification.
- Callback errors are sanitized.
- The optional internal webhook is disabled unless explicitly enabled for the `internal` provider.
- Zarinpal payments cannot be completed through the internal webhook.
- Malformed HMAC signatures are rejected before `timingSafeEqual`.

### Database migration

`scripts/db/migrate-payment-hardening.sql`:

- runs inside one PostgreSQL transaction;
- locks financial tables during normalization;
- normalizes prefixed Authorities;
- preflights duplicate Authorities, reference IDs, and historical payment links;
- adds gateway columns and constraints;
- creates and backfills the immutable fulfillment ledger;
- rolls back atomically on failure.

Application rollback is additive and does not require destructive schema rollback.

### Reconciliation

The reconciliation command is dry-run by default. Mutation is targeted only:

```bash
pnpm payments:reconcile --apply --payment-id=<uuid> --confirm-entitlement-missing
```

Bulk apply is prohibited. The operator must independently verify that entitlement is truly missing before repair.

### Admin revenue truth

- Admin financial reads use real `payments`, `subscriptions`, and `payment_fulfillments` tables.
- Demo financial seed records and legacy fake admin financial tables are not used.
- User IDs, payment IDs, Authority, and reference IDs are masked server-side.
- Completed subscription payments without ledger evidence appear as reconciliation-required and are excluded from completed revenue totals.

## Automated coverage added

- Toman-to-IRR conversion and invalid amount rejection
- raw/prefixed Authority normalization
- fail-closed production adapter selection
- provider verification before transaction opening
- row re-lock and invariant revalidation
- gateway ownership checks
- concurrent callback idempotency
- immutable fulfillment-ledger contract
- valid UUID subscription IDs
- ownership enforcement
- callback error sanitization
- webhook opt-in and Zarinpal bypass prevention
- bounded provider requests
- migration atomicity and duplicate preflight
- targeted reconciliation safety
- real Admin financial-table and masking contracts
- absence of demo financial seed records

## Current validation status

Fresh `ci-core`, CodeQL, and Lighthouse workflows are required for the exact latest PR HEAD. Green results from older commits must not be reused as release evidence.

Lighthouse has a known pre-existing baseline failure and must be investigated separately without reducing thresholds or suppressing assertions.

## Remaining blockers

| Blocker | Severity | Required action |
|---|---:|---|
| Latest exact HEAD CI not fully completed | High | Require green quality, build, contracts, security, CodeQL and relevant tests |
| `ZARINPAL_MERCHANT_ID` unavailable | Critical | Configure only in a controlled Sandbox environment |
| `ZARINPAL_MODE=sandbox` unavailable | Critical | Set before any E2E attempt |
| Production migration not executed | Critical | Backup, preflight, migration, verification queries, rollback evidence |
| Real checkout → callback → fulfillment not executed | Critical | Complete controlled Zarinpal Sandbox E2E |
| Duplicate callback E2E not executed | High | Replay callback and prove one ledger row/one entitlement |
| Authenticated Admin browser evidence missing | High | Verify masked payment, state, fulfillment and revenue exclusion |
| Production deployment not authorized | Critical | Requires explicit owner approval after all gates pass |

## Required evidence for revenue approval

- exact release commit SHA;
- migration command and verification queries;
- masked payment ID, Authority and reference ID;
- Toman amount and exact IRR amount;
- payment state transitions;
- exactly one immutable fulfillment-ledger row;
- entitlement result;
- duplicate callback result;
- authenticated Admin visibility;
- CI results for the exact release SHA;
- rollback target.

## Definition of Done

- [x] production mock fallback blocked
- [x] server-owned subscription pricing
- [x] request/verify amount contract
- [x] raw Authority reconciliation
- [x] provider call outside locked transaction
- [x] atomic completion and entitlement fulfillment
- [x] immutable fulfillment ledger
- [x] duplicate callback code-level idempotency
- [x] migration and non-destructive rollback policy
- [x] targeted reconciliation tooling
- [x] truthful readiness endpoints
- [x] Admin reads real financial data
- [x] sensitive Admin references masked
- [ ] latest exact HEAD CI fully green
- [ ] controlled migration rehearsal
- [ ] Zarinpal Sandbox E2E
- [ ] duplicate callback E2E evidence
- [ ] authenticated Admin browser evidence
- [ ] explicit production deployment approval

## Final verdict

`PAYMENT_E2E_BLOCKED_BY_CREDENTIALS`

No production deploy or merge was performed by this workstream.
