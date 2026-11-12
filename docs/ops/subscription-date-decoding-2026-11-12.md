# Subscription timestamp decoding repair — 2026-11-12

An owner-driven paid checkout returned successfully to the public success page after PR268. Account history recorded the purchase as successful, but authenticated subscription management failed with an invalid-date exception. A targeted read-only check confirmed one completed payment and one subscription row; the stored epoch timestamp arrived from PostgreSQL as a string. No raw customer or transaction identifiers are included here.

The subscription manager declared BIGINT timestamps as numbers and passed the actual strings directly to Date. JavaScript rejects an epoch-millisecond string as a date representation. The same incorrect assumption could concatenate a renewal duration instead of adding it.

Decode the existing numeric epoch values with Number at the subscription boundary before ISO conversion or duration arithmetic, accepting both pg string values and numeric test adapters. Do not change global PostgreSQL parsing, database rows, payment verification, credit grants, authentication or premium gates. No dependencies added.

Regression proof: the original implementation failed two tests (string-date read and renewal) while the numeric adapter test passed. After correction all three pass, along with 26 focused payment/status tests. Full local gates and independent review are in progress; no release approval or production repair is claimed for this candidate. The public payment-return fix remains deployed separately.

Remaining acceptance: authenticated production subscription page and real purchased-credit availability after an approved release. No second charge is needed. Generic Premium success wording for a pack purchase is a separate observed presentation issue; avoid claiming unlimited subscription access.

Final local evidence: lint (11 existing warnings), typecheck, local-first gate, all 274 files / 2134 tests, contracts, build, canonical standalone smoke (11 routes), secret scan and production dependency audit PASS. Independent review found no blocker. Legacy payment-integration renewal has a similar numeric assumption but no current application caller; track separately. Hosted checks and owner release approval remain required.
