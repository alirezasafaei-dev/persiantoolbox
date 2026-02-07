# Persian Tools — Codex Cloud Engineering Playbook

## Technical Audit, Refactor & Performance/SEO Pipeline (Next.js + PWA)

این سند یک استاندارد اجرایی برای انجام **Audit فنی، Refactor، بهینه‌سازی Performance/SEO/Accessibility، و بهبود امنیت/حریم خصوصی** پروژه Persian Tools با استفاده از **Codex CLI + Codex Cloud Environments** ارائه می‌دهد.

اهداف کلیدی:

- توسعه‌ی قابل‌تکرار و ایزوله در Cloud
- خروجی قابل‌اعتماد به شکل Diff/Patch (کنترل کامل توسط تیم)
- بهینه‌سازی ویژه کاربران ایران: **موبایل، شبکه ناپایدار، offline-first**
- هم‌راستایی با `docs/project-standards.md`، WCAG 2.1 AA، و RTL

---

## 1) معماری اجرایی: Local ⇄ Cloud (Codex)

### اصل مهم

Codex در Cloud **مستقیم روی ریپوی شما commit نمی‌زند** (در حالت استاندارد). خروجی به صورت **Diff** برمی‌گردد و شما بعد از بررسی آن را اعمال می‌کنید.

### چرخه استاندارد

1. شما وضعیت repo را محلی پایدار می‌کنید
2. Codex در Cloud اجرا می‌شود (Audit/Refactor/Optimization)
3. Diff را بررسی می‌کنید
4. `codex apply` → اعمال تغییرات روی لوکال
5. تست/بیلد/لینت محلی → PR

---

## 2) Codex Cloud Environment Config (Template)

این بخش را به عنوان “Environment Setup” در Codex Cloud ثبت کن (یا معادلش را در تنظیمات environment وارد کن).

### لینک محیط پیشنهادی برای اجراهای خیلی سنگین

- محیط آماده (High-load): `https://chatgpt.com/codex/settings/environment/698658924bb081919cd3731a5cd5498f`
- پنل Codex: `https://chatgpt.com/codex`

### 2.1 تنظیمات پایه Environment

- **Runtime**: Node LTS (ترجیحاً 20)
- **Package Manager**: pnpm (از طریق corepack)
- **Agent internet**: OFF (پیشنهادی)
- **Setup internet**: ON (برای نصب dependency)

### 2.2 Setup Commands (پیشنهادی و deterministic)

```bash
corepack enable
pnpm --version
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

> اگر تست‌ها زمان‌بر هستند، `pnpm test` را به یک پروفایل جدا منتقل کن (مثلاً “Full CI”), ولی برای audit کیفیت بهتر است همینجا باشد.

### 2.3 Environment Variables (الگو)

اگر پروژه env لازم دارد، فقط “حداقل‌های لازم” را در environment تعریف کن:

- `NODE_ENV=production` (برای تست build واقعی)
- `NEXT_TELEMETRY_DISABLED=1` (پیشنهادی)
- سایر کلیدها: **به‌صورت secret** (نه داخل repo)

---

## 3) دستورالعمل اجرای Codex CLI (Cloud Tasks)

> نام دقیق سوییچ‌ها در نسخه‌های مختلف CLI ممکن است کمی فرق کند، ولی الگو ثابت است: **run → diff → apply → validate**.

### 3.1 آماده‌سازی محلی قبل از هر Cloud Task

```bash
git checkout main
git pull
pnpm install
pnpm lint
pnpm test
pnpm build
```

### 3.2 اجرای Task در Cloud (نمونه‌ها)

- Audit کلی:

```bash
codex run --cloud "Run a comprehensive audit (Next.js + PWA + RTL + WCAG AA + SEO + Security). Follow docs/project-standards.md. Output diff-ready fixes."
```

- Refactor محدود به یک بخش:

```bash
codex run --cloud "Refactor the date conversion feature for clarity and strict TypeScript. Do not add runtime dependencies. Add tests where missing. Output a diff."
```

### 3.3 بررسی و اعمال

```bash
codex diff
codex apply
```

### 3.4 اعتبارسنجی محلی بعد از apply

```bash
pnpm lint
pnpm test
pnpm build
```

---

## 4) Prompt Pack (حرفه‌ای و Codex-Friendly)

برای گرفتن خروجی “بهینه و کم‌ریسک”، بهتر است Prompts کوتاه، دقیق و constraint-driven باشند.

### 4.1 Prompt اصلی Audit (Production-grade)

```
You are a senior Next.js engineer, performance/SEO specialist, and security reviewer.

Project: Persian Tools (Next.js + PWA).
Hard constraints:
- Follow docs/project-standards.md strictly
- Local-first: no runtime external CDNs
- Privacy-first: no tracking scripts added
- Persian RTL correctness and WCAG 2.1 AA
- Do not add runtime dependencies unless absolutely necessary
- Output diff-ready changes only

Tasks:
1) Review docs/ first and list mismatches.
2) Audit code quality (TypeScript strictness, dead code, dependencies).
3) Audit UI/UX (RTL, typography, responsive, a11y).
4) Audit SEO & performance (meta/OG, structured data, Core Web Vitals).
5) Audit security/privacy (CSP/HSTS suggestions, input sanitization).
6) Provide a prioritized TODO list using:
   Priority = (TechDebt*0.5) + (UX/SEO*0.3) + (DocsAlign*0.2)

Output format:
- Summary (facts only)
- Doc fixes (file path + snippet)
- Code fixes (diff-ready)
- A11y/SEO/Perf results and expected impact
- Security findings
- TODO checklist with priority and effort
```

### 4.2 Prompt Refactor Next.js (کم‌ریسک و استاندارد)

```
Refactor selected modules in this Next.js project.
Rules:
- No behavioral regressions
- Keep APIs backward compatible unless documented
- Keep bundle size minimal
- Prefer built-in Next.js patterns (app router, Metadata API, next/image)
- Add or improve tests for changed code
- Output diff-ready code changes only

Scope:
- Only files under: app/, components/, features/, shared/
- Prioritize strict TypeScript and clear separation of concerns
```

### 4.3 Prompt Lighthouse-driven Optimization (Actionable)

```
Optimize this Next.js app for Lighthouse mobile >=95.
Constraints:
- Do not add runtime third-party scripts
- Keep PWA offline features intact
- Respect RTL and Persian typography
Tasks:
- Identify render-blocking resources
- Reduce JS bundle and hydration cost where possible
- Improve image loading using next/image and proper sizing
- Ensure metadata and structured data is present
Output: diff-ready changes + checklist of Lighthouse improvements
```

---

## 5) Lighthouse Automation (محلی + CI + Codex)

هدف: جلوگیری از regression و داشتن معیار قابل‌اندازه‌گیری.

### 5.1 اجرای دستی (Dev)

- اجرای اپ:

```bash
pnpm build && pnpm start
```

- اجرای Lighthouse:

```bash
pnpm dlx lighthouse http://localhost:3000 --view
```

> پیشنهاد: گزارش‌ها را در `./reports/lighthouse/` ذخیره کن و baseline بساز.

### 5.2 اتوماسیون با Lighthouse CI (پیشنهادی)

**LCI** برای CI عالی است چون baseline و threshold می‌دهد.

#### package.json (اسکریپت‌ها)

```json
{
  "scripts": {
    "start:prod": "next start -p 3000",
    "lighthouse": "lighthouse http://localhost:3000 --output html --output-path ./reports/lighthouse/report.html",
    "lighthouse:ci": "lhci autorun"
  }
}
```

#### تنظیمات `lighthouserc.json` (نمونه)

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "pnpm start:prod",
      "url": ["http://localhost:3000/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

> نکته: accessibility را گاهی بهتر است `warn` بگذاری چون بعضی موارد نیاز به تصمیم UX دارند.

### 5.3 Codex + Lighthouse (بهترین حالت)

Codex را موظف کن:

- به **threshold**‌ها پایبند باشد
- تغییرات را محدود به موارد impact بالا کند
- هر جا ممکن بود “قبل/بعد” را به شکل عددی گزارش کند
- تنظیمات `lighthouserc.json` شامل مسیرهای کلیدی (`/`, ابزارهای PDF/تصویر/وام/حقوق و صفحه آفلاین) و اجرای ۳ باره برای کاهش نوسان است. اگر مسیر جدید اضافه شد، URL آن را به این فایل اضافه کن.
- اگر در CI هستی، از ورک‌فلو `.github/workflows/lighthouse-ci.yml` استفاده کن تا گزارش‌ها به‌صورت artifact ذخیره شوند.

---

## 6) AI-Assisted Dev Pipeline (Workflow کامل تیمی)

### 6.1 برنچینگ پیشنهادی

- `main`: پایدار
- `feat/*`: فیچر
- `audit/*`: بهینه‌سازی/کیفیت
- `hotfix/*`: فوری

### 6.2 چرخه PR استاندارد

1. Issue/Task تعریف می‌شود (هدف + معیار پذیرش)
2. Codex Cloud Task اجرا می‌شود
3. Diff بررسی انسانی
4. Apply → اجرای `lint/test/build/lighthouse`
5. PR با چک‌لیست
6. Merge

### 6.3 چک‌لیست PR (پیشنهادی)

- [ ] `pnpm lint` پاس شد
- [ ] `pnpm test` پاس شد
- [ ] `pnpm build` پاس شد
- [ ] Lighthouse: perf≥95, seo≥95
- [ ] RTL و typography بررسی شد
- [ ] تغییرات privacy-safe هستند (بدون tracker)
- [ ] docs/ آپدیت شد (اگر رفتار تغییر کرده)

---

## 7) Production-Ready Codex Usage (امنیت و کنترل)

### 7.1 سیاست‌ها (Policy)

- Codex حق اضافه کردن dependency runtime ندارد مگر با دلیل روشن
- اینترنت Agent خاموش (مگر allowlist محدود)
- secrets هرگز در prompt یا repo نوشته نشوند
- خروجی فقط diff / patch

### 7.2 Allowlist اینترنت (اگر واقعاً لازم شد)

- فقط دامنه‌های رسمی docs (مثلاً nextjs.org یا web.dev)
- محدود و موقتی

### 7.3 ضد-ریسک‌های رایج

- تغییرات بزرگ معماری بدون RFC ممنوع
- تغییرات UI بدون screenshot/preview ممنوع (در حد امکان)
- تغییرات SEO باید با structured data و meta تست شوند

---

## 8) استاندارد خروجی Audit (Report Template)

وقتی Codex Audit می‌گیرد، خروجی باید این ساختار را داشته باشد:

### 8.1 Summary

- 5 نکته کلیدی
- 3 ریسک اصلی
- 3 فرصت رشد

### 8.2 Doc Alignment

- فایل: `docs/...`
- مشکل: …
- پیشنهاد: snippet

### 8.3 Findings by Category

- Code quality
- UX/RTL/WCAG
- SEO
- Performance + Lighthouse
- Security/Privacy

### 8.4 TODO List (Prioritized)

هر آیتم:

- Priority: Critical/High/Medium
- Effort: S/M/L (یا ساعت)
- Owner: FE/BE/DevOps/Docs
- Acceptance criteria

---

## 9) TODO های پیشنهادی (شروع سریع)

- [ ] افزودن/تکمیل schema.org `SoftwareApplication` در metadata (SEO)
- [ ] یکپارچه‌سازی RTL spacing tokens (Tailwind + design tokens)
- [ ] Lighthouse CI + threshold روی PR
- [ ] بررسی تصاویر و استفاده صحیح از `next/image`
- [ ] سخت‌گیری TypeScript و حذف any
- [ ] سیاست CSP/HSTS در docs/operations.md
- [ ] تست‌های vitest/playwright برای مسیرهای حیاتی ابزارها

---

# ضمیمه A — دستورهای سریع برای Codex Tasks

### Audit کامل

```bash
codex run --cloud "Comprehensive audit. Follow docs/project-standards.md. Provide diff-ready fixes only."
```

### تمرکز روی Lighthouse

```bash
codex run --cloud "Optimize for Lighthouse mobile >=95. Do not add runtime deps. Keep PWA offline. Output diff + checklist."
```

### تمرکز روی RTL/WCAG

```bash
codex run --cloud "Fix RTL layout issues and WCAG AA accessibility gaps. Provide minimal safe diffs."
```
