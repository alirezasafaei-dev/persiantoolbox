# PersianToolbox Revenue Mode and Development Freeze Policy

**Status:** Conditional mandatory  
**Activation condition:** after final stabilization passes for payment, admin dashboard, first-load performance, and live verification.

## Rule

After PersianToolbox reaches `STABILIZATION_PASS` or an owner-approved `STABILIZATION_WITH_WARNINGS`, normal feature development must stop.

The project must shift from coding expansion to:

- traffic acquisition
- marketing
- SEO distribution
- payment conversion
- revenue monitoring
- trust and sales operations
- production reliability maintenance

## Allowed after freeze

Only these code changes are allowed:

1. payment/revenue fixes
2. admin/dashboard operational fixes
3. production incident fixes
4. security fixes
5. legal/privacy compliance fixes
6. live verification and monitoring fixes
7. performance regressions affecting acquisition or conversion
8. critical SEO/indexability fixes

## Not allowed after freeze

- new tools without revenue justification
- cosmetic refactors
- endless UI polish
- broad rewrites
- new product directions
- non-critical experiments
- blog/content generation that is not tied to acquisition plan

## Required business work after freeze

- Search Console/Bing indexing verification
- top landing page optimization
- payment funnel tracking
- pricing page conversion review
- Telegram/social launch plan
- outreach/backlink list
- revenue dashboard review cadence
- weekly metrics report

## Freeze entry checklist

- Zarinpal payment works or exact external blocker is documented
- login/register-before-payment flow works
- payment callback activates subscription/credits
- admin dashboard is usable and real
- first-load live browser performance is acceptable
- live verification policy passes
- final stabilization report exists
- owner explicitly accepts freeze readiness

## Freeze verdicts

- `DEV_FREEZE_READY`
- `DEV_FREEZE_READY_WITH_WARNINGS`
- `DEV_FREEZE_BLOCKED_PAYMENT`
- `DEV_FREEZE_BLOCKED_ADMIN`
- `DEV_FREEZE_BLOCKED_PERFORMANCE`
- `DEV_FREEZE_BLOCKED_LIVE_VERIFICATION`
