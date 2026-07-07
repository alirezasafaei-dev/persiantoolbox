# Contributing to PersianToolbox

Thank you for contributing to PersianToolbox (persiantoolbox.ir), a
privacy-first toolbox for Persian-speaking users.

## Quick Start

```bash
git clone <repo-url>
cd persiantoolbox
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/                    # Next.js App Router pages
  (tools)/              # Tool pages (PDF, image, finance, text, date, validation)
  api/                  # API routes (auth, payments, market data, health)
  topics/               # Topic hub pages for SEO
components/             # Shared React components
  features/             # Feature-specific components (finance, pdf-tools, etc.)
  ui/                   # UI primitives (Button, Card, Navigation, etc.)
  seo/                  # SEO components (structured data, FAQ)
features/               # Tool implementations (lazy-loaded)
  pdf-tools/            # PDF tool implementations (merge, compress, etc.)
lib/                    # Core libraries
  features/             # Feature flags (availability.ts)
  server/               # Server-only code (auth, db, passwords, rate limiting)
shared/                 # Shared utilities (hooks, UI components, history)
public/                 # Static assets (fonts, icons, service worker)
tests/                  # Tests (unit + e2e)
```

## Key Architecture Principles

### 1. Privacy-First / Local-First

**Sensitive tool processing should stay in the browser by default.** User
documents, resumes, invoices, contracts, pasted text, and uploaded images must
not be sent to the server unless the feature explicitly requires it.

- PDF tools use `pdf-lib` and `pdfjs-dist` loaded via dynamic imports
- Image tools use Canvas API
- Financial calculations are pure JavaScript
- OCR uses Tesseract.js (WASM)

### Privacy / Local-First Checklist for New Work

Before opening a PR for a new tool or workflow, confirm all of the following:

- Sensitive user content stays in the browser by default: documents, resumes,
  invoices, contracts, pasted text, and uploaded images must not be sent to the
  server unless the feature explicitly requires it.
- If server-side handling is unavoidable, document the reason in the PR and
  scope the payload to the smallest possible surface.
- Do not add telemetry that captures raw user content. Analytics must stay
  consent-gated and privacy-safe.
- Never commit secrets, production URLs with credentials, or real `.env`
  values. Run `pnpm security:secrets` and `pnpm security:scan` before merge.
- Reuse existing local-first patterns for draft storage, export flows, and
  premium gates instead of inventing a new server dependency.

See [`SECURITY.md`](SECURITY.md) and
[`docs/security-secrets-policy.md`](docs/security-secrets-policy.md) for the
security and secrets baseline enforced in CI.

### 2. RTL / Persian-First

All UI must work correctly in RTL layout:

- Use CSS logical properties (`mr-*` for margin-inline-start, etc.)
- Persian text should be readable and natural
- Numbers can be displayed in Western or Persian numerals

### 3. Design System

All components use CSS custom properties:

- Colors: `var(--color-primary)`, `var(--text-primary)`, `var(--surface-1)`
- Spacing: `var(--radius-md)`, `var(--radius-lg)`
- Typography: `var(--font-sans)` (Vazirmatn → IRANSansX → Noto Sans)

## Adding a New Tool

1. **Create the component** in `features/<category>/`:

   ```tsx
   'use client';
   export default function MyNewTool() {
     return <div>...</div>;
   }
   ```

2. **Create the page** in `app/(tools)/<category>/my-new-tool/page.tsx`:

   ```tsx
   import dynamic from 'next/dynamic';
   const Tool = dynamic(() => import('@/features/<category>/my-new-tool'));
   import ToolPageShell from '@/components/ui/ToolPageShell';
   import { buildMetadata } from '@/lib/seo';
   import { getToolByPathOrThrow } from '@/lib/tools-registry';

   const tool = getToolByPathOrThrow('/<category>/my-new-tool');
   export const metadata = buildMetadata({
     title: tool.title,
     description: tool.description,
     path: tool.path,
   });

   export default function Page() {
     return (
       <ToolPageShell tool={tool}>
         <Tool />
       </ToolPageShell>
     );
   }
   ```

3. **Register in tools-registry.ts**:

   ```ts
   {
     id: 'my-new-tool',
     path: '/<category>/my-new-tool',
     title: 'عنوان ابزار - جعبه ابزار فارسی',
     description: 'توضیحات ابزار',
     keywords: ['keyword1', 'keyword2'],
     indexable: true,
     lastModified: '2026-06-21',
     kind: 'tool',
     category: categoryOrThrow('<category>'),
     content: { intro: '...', steps: [...], faq: [...] },
   }
   ```

4. **Add tests** in `tests/unit/` and/or `tests/e2e/`.

## Running Tests

```bash
# Unit tests (vitest)
pnpm test

# E2E tests (Playwright)
pnpm test:e2e

# Type checking
pnpm typecheck

# Lint
pnpm lint

# Main local gate
pnpm typecheck && pnpm lint && pnpm vitest --run && pnpm build
```

## Quality Gates (Must Pass Before PR)

- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm typecheck` — no errors
- [ ] `pnpm vitest --run` — all tests pass
- [ ] `pnpm build` — builds successfully
- [ ] `pnpm security:secrets` — no high-risk secret patterns in tracked files
- [ ] `pnpm security:scan` — no production high-severity dependency findings

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add batch PDF compress tool`
- `fix: resolve CSP blocking Enamad logo`
- `docs: update roadmap with v3.8.2 changes`
- `test: add unit tests for health endpoint`
- `refactor: extract shared PDF worker client`

All commits must include a `Signed-off-by` trailer per the DCO process.

## Environment Variables

Copy `.env.example` to `.env` for local development. Key variables:

| Variable               | Purpose                      |
| ---------------------- | ---------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Site base URL                |
| `DATABASE_URL`         | PostgreSQL connection string |
| `FEATURE_*_ENABLED`    | Feature flags (1=enabled)    |
| `NODE_ENV`             | development/production       |

## Deployment

```bash
# Zero-downtime production deploy
bash deploy-blue-green.sh

# Legacy deploy still exists but causes brief downtime:
# bash deploy-vps-auto.sh
```

Production and staging deployment require maintainer approval. Do not deploy from
an external pull request. The production deploy path runs local QA, builds on the
VPS, starts the alternate blue/green slot, switches nginx after health checks,
and verifies public pages before cleanup.

## License

Apache-2.0. See [`LICENSE`](LICENSE). By contributing, you agree your
contributions are licensed under Apache-2.0.
