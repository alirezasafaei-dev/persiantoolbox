# مشخصات MVP انتشار اوپن‌سورس · Open-Source Launch MVP Spec

> PersianToolbox — جعبه ابزار فارسی
> وضعیت: ✅ منتشر شد (Public) — این سند شامل معیارهای آمادگی، جریان مشارکت و نقشه راه است.

---

## فارسی

### ۱. هدف (Purpose)

این سند مشخصات حداقل محصول آماده‌ی انتشار (MVP) برای تبدیل ریپوی داخلی
PersianToolbox به یک **مخزن عمومی، حرفه‌ای و امن** است. هدف: نمایش محصول به
جامعهٔ فارسی‌زبان و توسعه‌دهندگان بین‌المللی، بدون افشای اطلاعات حساس و بدون
اختلال در سرویس زنده.

### ۲. محدودهٔ MVP (Scope)

شامل (Done ✅):

- لایسنس صریح **Apache-2.0** و حذف مدل دوگانهٔ گیج‌کننده
- مستندات عمومی: `README.md` (دوزبانه)، `SECURITY.md`، `CODE_OF_CONDUCT.md`، `CONTRIBUTING.md`، `DCO.md`
- اسکن راز خودکار (`scripts/security/scan-secrets.mjs`) در pre-commit و CI
- فعال‌سازی در گیت‌هاب: secret scanning، push protection، اجباری‌بودن sign-off
- حذف زبالهٔ داخلی از tracking (`.archive`, `.codex`, `.mimocode`, `bench`, `tasks-next`)
- گالری اسکرین‌شات واقعی از سایت زنده در README

خارج از محدودهٔ MVP (فازهای بعد):

- تابلو تسک عمومی، برچسب‌های اولویت، قالب‌های issue/PR چندزبانه‌تر
- مستندات معماری عمیق و ADRها
- برنامهٔ مترجمین برای زبان‌های دیگر

### ۳. چک‌لیست آمادگی (Readiness Checklist)

| معیار                                     | وضعیت                       |
| ----------------------------------------- | --------------------------- |
| هیچ رازی در تاریخچه/درخت نیست             | ✅ (اسکن + بررسی دستی)      |
| `.env` هرگز توی گیت نیست                  | ✅ (gitignored + تایید ۴۰۴) |
| لایسنس صریح و یکپارچه                     | ✅ Apache-2.0               |
| README دوزبانه + اسکرین‌شات واقعی         | ✅                          |
| CI دروازه‌های کیفیت (lint/typecheck/test) | ✅                          |
| سایت زنده سالم پس از انتشار               | ✅ `/api/health` → ok       |
| بکاپ قبل از هر تغییر                      | ✅                          |

### ۴. جریان مشارکت (Contribution Flow)

1. Fork → branch → تغییر → PR
2. هر کامیت شامل `Signed-off-by` (DCO)
3. CI اجرا می‌شود: lint + typecheck + vitest + اسکن راز
4. review توسط نگهدارنده؛ ادغام پس از تایید

### ۵. نقشه راه (Roadmap)

- **فاز ۱ — عرضه (Done):** عمومی‌سازی، لایسنس، مستندات، امنیت پایه
- **فاز ۲ — جامعه:** issue/PR templates بهتر، نقشه‌راه محصول عمومی، اولین کنتریبیوتورها
- **فاز ۳ — حکمرانی:** بازبینی لایسنس/علامت تجاری، خط‌مشی انتشار منظم، بخش «چطور مشارکت کنیم» در سایت

### ۶. تعریف تمام‌شدن (Definition of Done)

ریپو عمومی است، بدون راز، با لایسنس صریح، README دوزبانه، و جریان مشارکت
ایمن — و سرویس زنده بدون وقفه کار می‌کند.

### ۷. ریسک‌ها و کاهش (Risks & Mitigations)

- **افشای راز در تاریخچه:** غیرممکن پس از بررسی؛ push protection جلوی تکرار را می‌گیرد
- **خطای انسانی در دیپلوی:** دیپلوی blue-green صفرِ‑داون‌تایم؛ هرگز خودکار بدون تایید
- **محتوای حساس در زبالهٔ داخلی:** از tracking خارج شد و محلی باقی ماند

---

## English

### 1. Purpose

This spec defines the minimum launch-ready product (MVP) for turning the
internal PersianToolbox repository into a **public, professional, and secure**
open-source project — showcasing the product to Persian-speaking users and
international developers without leaking secrets or disrupting the live service.

### 2. Scope

Included (Done ✅):

- Explicit **Apache-2.0** license (replaces the confusing dual-license model)
- Public docs: `README.md` (bilingual), `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `DCO.md`
- Automated secret scanning (`scripts/security/scan-secrets.mjs`) in pre-commit + CI
- GitHub hardening: secret scanning, push protection, required sign-off
- Removed internal clutter from tracking (`.archive`, `.codex`, `.mimocode`, `bench`, `tasks-next`)
- Real live-site screenshot gallery in README

Out of scope (later phases):

- Public task board, priority labels, richer issue/PR templates
- Deep architecture docs and ADRs
- Localization program for other languages

### 3. Readiness Checklist

| Criterion                              | Status                          |
| -------------------------------------- | ------------------------------- |
| No secret in history/tree              | ✅ (scanner + manual review)    |
| `.env` never in git                    | ✅ (gitignored + 404 confirmed) |
| Explicit, consistent license           | ✅ Apache-2.0                   |
| Bilingual README + real screenshots    | ✅                              |
| CI quality gates (lint/typecheck/test) | ✅                              |
| Live site healthy post-release         | ✅ `/api/health` → ok           |
| Backup before any change               | ✅                              |

### 4. Contribution Flow

1. Fork → branch → change → PR
2. Every commit includes `Signed-off-by` (DCO)
3. CI runs: lint + typecheck + vitest + secret scan
4. Maintainer review; merge after approval

### 5. Roadmap

- **Phase 1 — Launch (Done):** public release, license, docs, base security
- **Phase 2 — Community:** better issue/PR templates, public product roadmap, first contributors
- **Phase 3 — Governance:** license/trademark review, regular release policy, in-site "how to contribute"

### 6. Definition of Done

Repository is public, secret-free, explicitly licensed, with a bilingual README
and a safe contribution flow — and the live service runs uninterrupted.

### 7. Risks & Mitigations

- **Secret leak in history:** impossible after review; push protection prevents recurrence
- **Human deploy error:** zero-downtime blue-green deploy; never automatic without approval
- **Sensitive internal content:** removed from tracking, kept local only
