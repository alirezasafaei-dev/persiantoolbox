# v2.0.0 License Boundary Release Checklist

> هدف: اجرای بدون ابهام مرز تغییر لایسنس در نسخه `v2.0.0`.

## Scope

- تغییر عملیاتی از `MIT` (نسخه‌های قبلی) به مدل `Dual License` از `v2.0.0`.

## Required Steps

1. `LICENSE` update

- `LICENSE` باید از متن MIT فعلی به selector/متن سازگار با مدل Dual License تغییر کند.

2. `package.json` update

- `package.json#license` باید از `MIT` به `SEE LICENSE IN LICENSE` تغییر کند.

3. docs update

- `README.md` باید مرز نسخه‌ای نهایی را با عبارت صریح `>= v2.0.0` ثبت کند.
- `CHANGELOG.md` باید مدخل release migration را ثبت کند.
- `docs/licensing/*` باید با متن نهایی release sync شود.

4. contract validation

- `pnpm licensing:validate` باید پاس شود.
- `pnpm ci:contracts` باید پاس شود.

5. release note

- release notes باید صریحا اعلام کند:
  - `<= v1.1.x` remains MIT
  - `>= v2.0.0` is dual-licensed

## Exit Criteria

- تمام مراحل بالا complete باشند.
- release tag `v2.0.0` همراه با release notes منتشر شود.
