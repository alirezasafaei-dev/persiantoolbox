# Homepage UX/SEO Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the PersianToolbox homepage to feel like a modern Persian productivity product, fix technical SEO issues (www redirect), improve accessibility, and strengthen trust signals.

**Architecture:** Changes span 4 files: `proxy.ts` (www redirect), `components/HomePage.tsx` (homepage layout), `lib/home-copy.ts` (copywriting), `app/globals.css` (visual polish), `components/home/HomeHero.tsx` (hero redesign).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, CSS custom properties.

---

## Task 1: Add www-to-non-www redirect in middleware

**Covers:** Phase 2 — Critical technical SEO (canonical domain)

**Files:**

- Modify: `proxy.ts` (lines 78-114)

- [ ] **Step 1: Add www redirect logic to proxy function**

In `proxy.ts`, after `resolveRequestHostname` and before the HSTS logic, add a redirect for www to non-www:

```ts
// Inside proxy() function, after line 105 (hostname resolution):
const isProduction = process.env['NODE_ENV'] === 'production';
const canonicalHost = 'persiantoolbox.ir';
if (isProduction && hostname.startsWith('www.')) {
  const url = request.nextUrl.clone();
  url.hostname = canonicalHost;
  return NextResponse.redirect(url, 308);
}
```

This goes BEFORE `NextResponse.next()` so the redirect happens before any response headers are set.

- [ ] **Step 2: Run lint and typecheck**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "fix(seo): add www-to-non-www 308 redirect in middleware"
```

---

## Task 2: Redesign homepage hero section

**Covers:** Phase 4 — Homepage UI/UX redesign (hero section)

**Files:**

- Modify: `components/home/HomeHero.tsx`
- Modify: `lib/home-copy.ts` (hero copy)

- [ ] **Step 1: Update hero copy to be more emotional and human**

In `lib/home-copy.ts`, update `getHomeHeroCopy()`:

```ts
export function getHomeHeroCopy(toolCount = getHomeToolCount()) {
  void toolCount;

  return {
    eyebrow: `${FREE_TOOLS_DISPLAY_LABEL} · بدون ثبت‌نام · پردازش محلی`,
    title: 'ابزارهای فارسی برای کارهای روزمره',
    titleAccent: 'سریع، خصوصی، بدون نصب',
    subtitle:
      `با ${FREE_TOOLS_DISPLAY_LABEL} برای محاسبه وام و حقوق، تبدیل تاریخ، ` +
      'فشرده‌سازی PDF، ساخت فاکتور و رزومه، قرارداد آماده و ویرایش متن فارسی شروع کنید. ' +
      'بدون حساب کاربری، بدون نصب برنامه و بدون ارسال فایل یا متن حساس به سرور.',
    primaryCta: 'پیدا کردن ابزار',
    secondaryCtaLabel: 'مشاهده ابزارهای پرکاربرد',
    trustPills: ['شروع رایگان', 'بدون ثبت‌نام', 'پردازش در مرورگر'],
  };
}
```

- [ ] **Step 2: Redesign hero layout with gradient background and better hierarchy**

Replace the full `HomeHero.tsx` content with an improved version that has:

- Warm gradient background (subtle blue-to-teal)
- Larger, bolder H1
- Trust badges as a horizontal bar
- Popular quick-chip links below search
- Two CTA buttons with clear hierarchy

```tsx
import ButtonLink from '@/shared/ui/ButtonLink';
import { getHomeHeroCopy } from '@/lib/home-copy';
import { IconCheck, IconShield } from '@/shared/ui/icons';
import HeroQuickLinks from '@/components/home/HeroQuickLinks';
import dynamic from 'next/dynamic';

const LazyToolSearch = dynamic(() => import('@/components/home/ToolSearch'), {
  loading: () => (
    <div className="mx-auto h-14 max-w-2xl animate-pulse rounded-full bg-[var(--surface-1)]" />
  ),
});

type Props = {
  toolCount: number;
  pack3HeroCta: string;
};

export default function HomeHero({ toolCount, pack3HeroCta }: Props) {
  const hero = getHomeHeroCopy(toolCount);

  return (
    <section
      className="hero-section relative overflow-hidden rounded-[var(--radius-lg)] p-8 md:p-12 lg:p-16"
      aria-labelledby="hero-heading"
    >
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-20 right-1/4 h-80 w-80 rounded-full bg-[rgb(var(--color-primary-rgb)/0.15)] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-[rgb(var(--color-success-rgb)/0.12)] blur-[80px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--color-warning-rgb)/0.08)] blur-[60px]" />

      <div className="relative space-y-6 text-center">
        {/* Eyebrow badge */}
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[rgb(var(--color-primary-rgb)/0.2)] bg-[rgb(var(--color-primary-rgb)/0.08)] px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
          <span
            className="h-2 w-2 rounded-full bg-[var(--color-success)] animate-pulse"
            aria-hidden="true"
          />
          {hero.eyebrow}
        </p>

        {/* Main heading */}
        <div className="space-y-3">
          <h1
            id="hero-heading"
            className="text-4xl font-black leading-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl"
          >
            {hero.title}
          </h1>
          <p className="text-xl font-bold leading-relaxed text-[var(--color-primary)] md:text-2xl">
            {hero.titleAccent}
          </p>
        </div>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
          {hero.subtitle}
        </p>

        {/* Search bar — prominent */}
        <div className="mx-auto max-w-2xl">
          <LazyToolSearch />
        </div>

        {/* Quick chips */}
        <HeroQuickLinks />

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/topics" size="lg" className="px-8">
            {hero.primaryCta} ←
          </ButtonLink>
          <ButtonLink href="/pricing" variant="secondary" size="lg" className="px-8">
            {hero.secondaryCtaLabel}
          </ButtonLink>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--color-success-rgb)/0.3)] bg-[rgb(var(--color-success-rgb)/0.1)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]"
            title="دارای نماد اعتماد الکترونیکی"
          >
            <IconShield className="h-3.5 w-3.5" aria-hidden="true" />
            {hero.trustPills[0]}
          </span>
          {hero.trustPills.slice(1).map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]"
            >
              <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" aria-hidden="true" />
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Run lint and typecheck**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/home/HomeHero.tsx lib/home-copy.ts
git commit -m "feat(homepage): redesign hero section with emotional design and gradient background"
```

---

## Task 3: Redesign homepage layout with task-based cards and trust bar

**Covers:** Phase 4 — Homepage UI/UX redesign (task cards, trust bar, section ordering)

**Files:**

- Modify: `components/HomePage.tsx`

- [ ] **Step 1: Restructure homepage sections**

Replace the homepage section layout. The new order:

1. Hero (already redesigned)
2. Value proofs (keep existing)
3. **NEW: Task-based cards** (user intent → tool)
4. Use cases (keep)
5. Categories (keep)
6. Popular tools (keep)
7. Trust bar (moved up, compact)
8. How it works (keep)
9. Flagship products (keep)
10. Social proof (keep)
11. Audience tracks (keep)
12. Blog (keep)
13. Newsletter (keep)
14. FAQ (keep)

Key changes:

- Move trust section higher (after popular tools)
- Add task-based cards section before use cases
- Make trust section more compact
- Add visual separators between sections

- [ ] **Step 2: Add task-based cards section**

Add a new section to `HomePage.tsx` after value proofs:

```tsx
{
  /* Task-based quick actions */
}
<section className="space-y-6" aria-labelledby="task-heading">
  <div className="flex flex-col gap-2 text-center">
    <h2 id="task-heading" className="text-3xl font-black text-[var(--text-primary)]">
      چه کاری می‌خواهید انجام دهید؟
    </h2>
    <p className="text-sm text-[var(--text-muted)]">
      نیازتان را انتخاب کنید و مستقیم وارد ابزار مناسب شوید
    </p>
  </div>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {[
      {
        label: 'می‌خواهم فایل PDF را کم‌卮جم کنم',
        href: '/pdf-tools/compress/compress-pdf',
        icon: '📄',
      },
      { label: 'می‌خواهم حقوقم را حساب کنم', href: '/salary', icon: '💰' },
      { label: 'می‌خواهم تاریخ را تبدیل کنم', href: '/date-tools/shamsi-gregorian', icon: '📅' },
      {
        label: 'می‌خواهم متن فارسی را اصلاح کنم',
        href: '/writing-tools/persian-writing-studio',
        icon: '✏️',
      },
      {
        label: 'می‌خواهم فاکتور بسازم',
        href: '/business-tools/document-studio?type=invoice',
        icon: '🧾',
      },
      { label: 'می‌خواهم تصویر را ویرایش کنم', href: '/image-tools', icon: '🖼️' },
    ].map((task) => (
      <Link
        key={task.href}
        href={task.href}
        className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 transition-all duration-200 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-medium)]"
      >
        <span className="text-2xl" aria-hidden="true">
          {task.icon}
        </span>
        <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
          {task.label}
        </span>
        <span className="mr-auto text-xs text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
          ←
        </span>
      </Link>
    ))}
  </div>
</section>;
```

- [ ] **Step 3: Make trust section more compact**

Replace the trust section with a more compact version that acts as a horizontal trust bar:

```tsx
{
  /* Compact trust bar */
}
<section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 md:p-8">
  <div className="flex flex-col gap-2 text-center mb-6">
    <h2 className="text-2xl font-black text-[var(--text-primary)]">{sections.trust.title}</h2>
    <p className="text-sm text-[var(--text-muted)]">{sections.trust.subtitle}</p>
  </div>
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {trustCards.map((item, index) => {
      const Icon = trustIcons[index] ?? IconLock;
      return (
        <div
          key={item.title}
          className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]"
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
            <div className="mt-1 text-xs text-[var(--text-muted)] leading-5">{item.desc}</div>
          </div>
        </div>
      );
    })}
  </div>
  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)]">
    <span className="flex items-center gap-1">
      <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
      دارای نماد اعتماد الکترونیکی
    </span>
    <span className="flex items-center gap-1">
      <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
      {FREE_TOOLS_DISPLAY_LABEL}
    </span>
    <span className="flex items-center gap-1">
      <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
      متن‌باز در GitHub
    </span>
  </div>
</section>;
```

- [ ] **Step 4: Run lint and typecheck**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/HomePage.tsx
git commit -m "feat(homepage): add task-based cards, restructure sections, compact trust bar"
```

---

## Task 4: Improve hero section CSS with gradient background

**Covers:** Phase 4 — Homepage UI/UX (visual design)

**Files:**

- Modify: `app/globals.css`

- [ ] **Step 1: Add hero section styles**

Add after the existing `.page-shell` styles (around line 615):

```css
/* Hero section gradient background */
.hero-section {
  background:
    linear-gradient(135deg, rgb(var(--color-primary-rgb) / 0.06), transparent 60%),
    linear-gradient(225deg, rgb(var(--color-success-rgb) / 0.05), transparent 50%), var(--surface-1);
  border: 1px solid var(--border-light);
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) .hero-section {
    background:
      linear-gradient(135deg, rgb(122 162 255 / 0.1), transparent 60%),
      linear-gradient(225deg, rgb(var(--color-success-rgb) / 0.08), transparent 50%),
      var(--surface-1);
  }
}

.dark .hero-section {
  background:
    linear-gradient(135deg, rgb(122 162 255 / 0.1), transparent 60%),
    linear-gradient(225deg, rgb(var(--color-success-rgb) / 0.08), transparent 50%), var(--surface-1);
}
```

- [ ] **Step 2: Add task card hover animation**

Add after the `.hover-lift` styles:

```css
/* Task card active press effect */
.task-card:active {
  transform: scale(0.98);
}
```

- [ ] **Step 3: Run lint and typecheck**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat(homepage): add hero gradient background and task card styles"
```

---

## Task 5: Improve accessibility — focus states and contrast

**Covers:** Phase 7 — Accessibility

**Files:**

- Modify: `app/globals.css`

- [ ] **Step 1: Enhance focus ring styles for dark mode**

The current focus ring uses `ring-offset-[var(--bg-primary)]` which may not contrast enough in dark mode. Update the focus ring:

```css
/* Focus styles — dark theme via media + class */
.focus-ring {
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] focus-visible:ring-[var(--color-primary)];
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) .focus-ring {
    @apply focus-visible:ring-offset-gray-900 focus-visible:ring-[var(--color-primary)];
  }
}

.dark .focus-ring {
  @apply focus-visible:ring-offset-gray-900 focus-visible:ring-[var(--color-primary)];
}
```

- [ ] **Step 2: Ensure all interactive elements have visible focus**

Update the global focus styles to be more visible:

```css
/* Improved focus states for accessibility */
button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Ensure focus ring is visible on dark backgrounds */
@media (prefers-color-scheme: dark) {
  :root:not(.light) button:focus-visible,
  :root:not(.light) a:focus-visible,
  :root:not(.light) input:focus-visible,
  :root:not(.light) textarea:focus-visible,
  :root:not(.light) select:focus-visible {
    outline-color: var(--color-primary);
    outline-offset: 2px;
  }
}
```

- [ ] **Step 3: Run lint and typecheck**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "fix(a11y): improve focus ring visibility in dark mode"
```

---

## Task 6: Fix www reference in HSTS hosts

**Covers:** Phase 2 — Critical technical SEO

**Files:**

- Modify: `proxy.ts` (line 34)

- [ ] **Step 1: Remove www from HSTS hosts default**

Since we're redirecting www to non-www, the www domain shouldn't need HSTS:

```ts
process.env['HSTS_HOSTS'] ?? 'persiantoolbox.ir';
```

- [ ] **Step 2: Run lint and typecheck**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "fix(seo): remove www from default HSTS hosts list"
```

---

## Task 7: Run full verification

**Covers:** Phase 9 — Verification

- [ ] **Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Run tests**

Run: `pnpm vitest --run`
Expected: PASS (or note pre-existing failures)

- [ ] **Step 4: Run build**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 5: Search for regressions**

```bash
grep -r "www\.persiantoolbox" --include="*.ts" --include="*.tsx" .
grep -r "\[object Object\]" --include="*.ts" --include="*.tsx" .
```

Expected: No www in metadata/canonical, no [object Object]

---

## Execution Notes

- Tasks 1 and 6 both modify `proxy.ts` — combine into a single edit pass.
- Tasks 2 and 3 can be done together since they both modify the homepage.
- Task 4 and 5 both modify `globals.css` — combine into a single edit pass.
- Total files modified: 4 (proxy.ts, HomePage.tsx, HomeHero.tsx, home-copy.ts, globals.css)
