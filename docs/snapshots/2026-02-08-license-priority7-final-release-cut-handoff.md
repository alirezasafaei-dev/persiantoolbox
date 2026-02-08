# Snapshot — 2026-02-08 — License Priority 7 Final Release Cut

## Summary

- release branch `release/v2-license-prep` به `main` merge شد.
- نسخه نهایی `v2.0.0` با مرز لایسنس جدید روی `main` اعمال شد.
- tag رسمی `v2.0.0` ایجاد و push شد.

## Finalized Release State

- `package.json`
  - `version: 2.0.0`
  - `license: SEE LICENSE IN LICENSE`
- `LICENSE`
  - selector دوگانه برای مدل Non-Commercial/Commercial
- `README.md`
  - مرز نسخه‌ای `<= v1.1.x` و `>= v2.0.0` صریح شد

## Branching and Tagging

- Merged into `main`
- Release prep branch kept: `release/v2-license-prep`
- Git tag published: `v2.0.0`

## Validation Baseline

- `pnpm licensing:validate`
- `pnpm ci:contracts`
- `pnpm ci:quick`

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-license-priority7-final-release-cut-handoff.md

گام بعدی:
1) یک post-release verification pass روی CI runs و artifacts انجام بده.
2) roadmap-board/deployment-roadmap را با وضعیت release نهایی sync کن.
3) اگر لازم بود cleanup اسناد RC-only را انجام بده.
4) docs/index.md و CHANGELOG.md را sync کن، commit/push کن.
```
