<p align="center">
  <img src="public/icon.svg" alt="PersianToolbox" width="96" height="96" />
</p>

<h1 align="center">PersianToolbox · جعبه ابزار فارسی</h1>

<p align="center">
  <a href="https://persiantoolbox.ir"><img alt="Live site" src="https://img.shields.io/badge/live-persiantoolbox.ir-blue" /></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" /></a>
  <a href="https://nextjs.org"><img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-black" /></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6" /></a>
  <a href="https://github.com/alirezasafaei-dev/persiantoolbox/actions"><img alt="CI" src="https://github.com/alirezasafaei-dev/persiantoolbox/actions/workflows/ci-core.yml/badge.svg" /></a>
</p>

<p align="center">
  <b>ابزار آنلاین فارسی — پردازش محلی در مرورگر، حریم خصوصی کامل.</b><br/>
  A local-first Persian web toolbox: most tools run entirely in your browser.
  No uploads of your documents, resumes, invoices, or text.
</p>

---

## Why PersianToolbox?

PersianToolbox is a growing collection of **100+ Persian-first utilities**
built with privacy as the default. Tools are organized into clear categories
and work offline-first where possible — your data stays on your device.

- **Privacy-first / local-first** — client-side tools never send your input to a server.
- **Persian RTL** — native right-to-left UI with proper Persian typography (Vazirmatn).
- **Zero fake tools** — every listed tool is real and tested.
- **SEO-ready** — generated OG images, JSON-LD, and sitemaps for discoverability.
- **Production-grade** — CSP, rate limiting, HMAC webhook verification, async password hashing.

## Features

- **۱۰۳+ ابزار** در ۱۰+ دسته‌بندی — PDF، تصویر، مالی، تاریخ، متن، اعتبارسنجی و بیشتر
- **PDF tools** — merge, split, compress, convert, extract, watermark
- **Image tools** — format convert (JPG/PNG/WebP), crop, rotate, resize, Persian OCR (Tesseract.js, fully local)
- **Finance tools** — loans, salary, tax, insurance, market calculators
- **Date tools** — Jalali/Gregorian/Hijri conversion, date difference, Persian calendar
- **Text tools** — word count, number conversion, address conversion, JSON, Hash, Base64
- **Persian writing studio** — Arabic→Persian normalization, ZWNJ, spacing, punctuation
- **Business & career studios** — invoice/receipt generator, professional resume builder
- **QR code & password tools** — fully local generation and strength analysis

## Tech Stack

| Layer       | Technology                                |
| ----------- | ----------------------------------------- |
| Framework   | Next.js 16 (App Router)                   |
| Language    | TypeScript (strict)                       |
| Styling     | Tailwind CSS (RTL variables, dark mode)   |
| Database    | PostgreSQL                                |
| Cache       | Redis                                     |
| Runtime     | PM2 on Node.js ≥ 20                       |
| Package mgr | pnpm                                      |
| CI/CD       | GitHub Actions + blue-green deploy        |
| Tests       | Vitest (unit/contract) + Playwright (e2e) |
| Monitoring  | Sentry, Lighthouse CI                     |

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> Most tools work with zero configuration. Server-side features (auth,
> payments, analytics) require environment variables — see
> `.env.example` and `.env.production.example`. **Never commit a real `.env`.**

## Quality Gates

```bash
pnpm lint          # 0 errors
pnpm typecheck     # strict PASS
pnpm vitest --run  # unit + contract tests
pnpm build         # production build
```

Pull requests run the same gates plus automated **secret scanning**
(`scripts/security/scan-secrets.mjs`).

## Project Structure

```
app/         Next.js App Router pages + API routes
components/  UI components and feature pages
features/    tool logic and implementations
lib/         shared modules (SEO, security, policies, tools registry)
shared/      utilities, analytics, UI primitives
tests/       unit, contract, and e2e tests
docs/        operational docs, roadmap, security policy
scripts/     automation (deploy, backup, health, security)
```

## Security & Privacy

- **Local-first**: client-side tools process data in the browser only.
- **CSP** with nonce-based `script-src`; `style-src` keeps `unsafe-inline` for Next.js.
- **HMAC** webhook signature verification, async scrypt password hashing, CSRF protection, rate limiting.
- Secrets live only in server environment variables and are never committed.
- See [`SECURITY.md`](SECURITY.md) and `docs/security-secrets-policy.md`.

## Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md).
All commits must include a `Signed-off-by` trailer (DCO — see [`DCO.md`](DCO.md)).
By contributing, you agree your contributions are licensed under Apache-2.0.

## License

Licensed under the **Apache License, Version 2.0** — see [`LICENSE`](LICENSE).
Trademark and branding guidelines are in [`TRADEMARKS.md`](TRADEMARKS.md).

---

<p align="center">
  Made with care for Persian-speaking users. ✨<br/>
  <sub>Not affiliated with any government entity. "اینماد" references relate to the live service only.</sub>
</p>
