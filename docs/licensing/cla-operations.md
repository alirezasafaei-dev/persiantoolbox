# CLA Operations Runbook

> آخرین به‌روزرسانی: 2026-02-08

این سند روند عملیاتی `DCO + CLA` را برای مشارکت‌های خارجی تعریف می‌کند.

## Scope

- Individual contributors: `docs/licensing/cla-individual.md`
- Corporate contributors: `docs/licensing/cla-corporate.md`

## Reference ID Format

- فرمت مرجع: `CLA-<YEAR>-<TYPE>-<SEQ>`
- نمونه:
  - `CLA-2026-ICLA-0001`
  - `CLA-2026-CCLA-0001`

## Storage Policy

- متن امضاشده CLA نباید در این ریپو ذخیره شود.
- محل نگهداری: storage خصوصی تیم حقوقی/عملیاتی.
- در ریپو فقط metadata ثبت می‌شود:
  - `referenceId`
  - `signedAt`
  - `type` (`ICLA` یا `CCLA`)
  - `contributorHandle`
  - `status` (`active` / `revoked`)

## Audit Trail

- همه mergeهای خارجی باید 2 شرط را پاس کنند:
  1. DCO sign-off در commit
  2. `referenceId` فعال CLA در رجیستر داخلی

- بازبینی audit باید شامل این موارد باشد:
  - نگاشت PR به `referenceId`
  - تاریخ اعتبار و وضعیت CLA
  - وجود `Signed-off-by` در commit chain

## Operational Steps

1. دریافت درخواست مشارکت خارجی.
2. تعیین نوع CLA (`ICLA`/`CCLA`).
3. ثبت امضای نهایی در storage خصوصی و تولید `referenceId`.
4. ثبت metadata در رجیستر داخلی (خارج از ریپو).
5. تایید DCO + CLA قبل از merge.
6. نگهداری وضعیت فعال/لغو برای audit.
