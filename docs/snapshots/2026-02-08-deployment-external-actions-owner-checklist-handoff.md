# Snapshot — 2026-02-08 — Deployment External Actions Owner Checklist

## Summary

- بورد گرافیکی استقرار با یک فاز مشخص برای «اقدام‌های خارج از ریپو» تکمیل شد.
- در مستندات استقرار/عملیات مشخص شد کدام اقدامات باید توسط Owner پروژه انجام شود.

## Completed Work

### 1) Deployment board update

- Updated:
  - `docs/deployment-roadmap.html`
  - `public/deployment-roadmap.html`
- Added:
  - `اولویت 13 — اقدام‌های خارج از ریپو (Owner: شما)`
  - tasks:
    - VPS/Host provisioning
    - Domain/DNS/SSL setup
    - Production secrets/env setup
    - Production DB + backup/restore policy
    - Branding assets (logo/favicons/OG)

### 2) Docs update

- Updated:
  - `docs/deployment-roadmap.md` (Priority 13)
  - `docs/operations.md` (section `اقدام‌های خارج از ریپو`)

## Next Technical Prompt

```text
ادامه از snapshot: docs/snapshots/2026-02-08-deployment-external-actions-owner-checklist-handoff.md

گام بعدی:
1) برای هر آیتم Priority 13 وضعیت واقعی را وارد کن (done/open).
2) پس از تکمیل آیتم‌های Owner، Priority 11 و 12 را اجرا کن.
3) گزارش post-deploy را در docs/deployment/reports ثبت و docs/index.md + CHANGELOG.md را sync کن.
```
