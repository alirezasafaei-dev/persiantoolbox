# Phase 1 — Positioning Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the #1 growth blocker — homepage hero promotes paid products instead of free tools. Rewrite hero, add search, show all categories, fix pricing page, fix contact form.

**Architecture:** Direct edits to existing React components. No new files needed for Tasks 1-4. Task 5 may need a new API route if connecting contact form to backend.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS

---

## Task 1: Rewrite Homepage Hero

**Covers:** [S1 — Positioning Reset, 1.1]

**Files:**

- Modify: `components/HomePage.tsx:157-183`

- [ ] **Step 1: Read current hero section**

Read `components/HomePage.tsx` lines 157-183 to confirm current state.

- [ ] **Step 2: Replace hero H1, subtitle, and CTAs**

Replace the hero section content in `components/HomePage.tsx`. The current hero at line 166-181 is:

```tsx
<h1 id="hero-heading" className="text-4xl font-black leading-tight md:text-5xl">
  ابزارهای فارسی حرفه‌ای؛ سریع، امن و بدون ارسال داده
</h1>
<p className="mx-auto max-w-3xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
  پردازش کاملاً محلی در مرورگر شما، حفظ حریم خصوصی، و ابزارهای حرفه‌ای برای سندسازی، رزومه
  و ویرایش متن فارسی.
</p>

<div className="flex flex-wrap justify-center gap-3">
  <ButtonLink href={flagshipProducts[0]!.href} size="lg" className="px-8">
    شروع با ابزارهای حرفه‌ای
  </ButtonLink>
  <ButtonLink href="/topics" variant="secondary" size="lg" className="px-8">
    مشاهده همه ابزارها
  </ButtonLink>
</div>
```

Replace with:

```tsx
<h1 id="hero-heading" className="text-4xl font-black leading-tight md:text-5xl">
  بیش از {toPersianNumbers(totalToolsCount)} ابزار رایگان فارسی — سریع، امن، بدون ثبت‌نام
</h1>
<p className="mx-auto max-w-3xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
  تبدیل PDF، محاسبه وام، فشرده‌سازی تصویر و ابزارهای کاربردی دیگر. تمام پردازش‌ها در مرورگر شما انجام می‌شود.
</p>

<div className="mx-auto max-w-xl">
  <a
    href="/search"
    className="flex items-center gap-3 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-5 py-3 text-sm text-[var(--text-muted)] shadow-[var(--shadow-subtle)] transition-all hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
  >
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    ابزار مورد نظر خود را جستجو کنید...
  </a>
</div>

<div className="flex flex-wrap justify-center gap-3">
  <ButtonLink href="/tools" size="lg" className="px-8">
    شروع رایگان ←
  </ButtonLink>
  <ButtonLink href="/topics" variant="secondary" size="lg" className="px-8">
    مشاهده همه ابزارها
  </ButtonLink>
</div>

<div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
  <span>🔒</span>
  <span>پردازش محلی — داده‌های شما ارسال نمی‌شوند</span>
</div>
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS (no type errors)

- [ ] **Step 4: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/HomePage.tsx
git commit -m "feat: rewrite homepage hero to lead with free tools instead of paid products

- H1: 'بیش از ۸۰ ابزار رایگان فارسی' instead of 'ابزارهای فارسی حرفه‌ای'
- Added search bar in hero section
- Primary CTA: 'شروع رایگان' → /tools
- Added trust badge: 'پردازش محلی — داده‌های شما ارسال نمی‌شوند'
- Dynamic tool count in hero heading

Signed-off-by: MiMoCode <mimocode@local>"
```

---

## Task 2: Show All 10 Categories on Homepage

**Covers:** [S1 — Positioning Reset, 1.3]

**Files:**

- Modify: `components/HomePage.tsx:46-53`

- [ ] **Step 1: Read current quickToolCategories**

Read `components/HomePage.tsx` lines 46-53. Current state:

```tsx
const quickToolCategories = [
  { id: 'pdf-tools', name: 'PDF', icon: '📄', path: '/pdf-tools' },
  { id: 'image-tools', name: 'تصویر', icon: '🖼️', path: '/image-tools' },
  { id: 'finance-tools', name: 'مالی', icon: '💰', path: '/tools' },
  { id: 'date-tools', name: 'تاریخ', icon: '📅', path: '/date-tools' },
  { id: 'text-tools', name: 'متنی', icon: '✏️', path: '/text-tools' },
  { id: 'validation-tools', name: 'اعتبارسنجی', icon: '🔐', path: '/validation-tools' },
];
```

- [ ] **Step 2: Add missing categories**

Replace with:

```tsx
const quickToolCategories = [
  { id: 'pdf-tools', name: 'PDF', icon: '📄', path: '/pdf-tools' },
  { id: 'image-tools', name: 'تصویر', icon: '🖼️', path: '/image-tools' },
  { id: 'finance-tools', name: 'مالی', icon: '💰', path: '/tools' },
  { id: 'date-tools', name: 'تاریخ', icon: '📅', path: '/date-tools' },
  { id: 'text-tools', name: 'متنی', icon: '✏️', path: '/text-tools' },
  { id: 'validation-tools', name: 'اعتبارسنجی', icon: '🔐', path: '/validation-tools' },
  { id: 'contract-tools', name: 'قرارداد', icon: '📋', path: '/contract-tools' },
  { id: 'business-tools', name: 'کسب‌وکار', icon: '💼', path: '/business-tools' },
  { id: 'career-tools', name: 'شغلی', icon: '🎯', path: '/career-tools' },
  { id: 'writing-tools', name: 'نگارش', icon: '✍️', path: '/writing-tools' },
];
```

- [ ] **Step 3: Update grid layout for 10 items**

Find the grid class at line 235:

```tsx
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
```

Replace with:

```tsx
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
```

This gives 2 rows of 5 on desktop, which is cleaner for 10 items.

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 5: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/HomePage.tsx
git commit -m "feat: show all 10 tool categories on homepage

- Added contract-tools, business-tools, career-tools, writing-tools
- Changed grid from 6-col to 5-col for better layout with 10 items

Signed-off-by: MiMoCode <mimocode@local>"
```

---

## Task 3: Add Free Tier to Pricing Page

**Covers:** [S1 — Positioning Reset, 1.4]

**Files:**

- Modify: `components/features/pricing/PricingContent.tsx:9-39`

- [ ] **Step 1: Read current pricing plans**

Read `components/features/pricing/PricingContent.tsx` lines 9-39.

- [ ] **Step 2: Add free tier to getPricingPlans**

Replace the `getPricingPlans` function:

```tsx
function getPricingPlans(period: BillingPeriod) {
  const freeTier = {
    id: 'free',
    name: 'رایگان',
    description: 'برای شروع و استفاده روزمره',
    priceLabel: 'رایگان',
    features: ['ابزارهای پایه', 'خروجی با واترمارک', 'بدون ثبت‌نام', 'پردازش محلی'],
    recommended: false,
  };

  if (period === 'monthly') {
    return [
      freeTier,
      { ...CREDIT_PLANS.find((p) => p.id === 'basic')!, priceLabel: `${formatPrice(99000)} تومان` },
      {
        ...CREDIT_PLANS.find((p) => p.id === 'standard')!,
        priceLabel: `${formatPrice(199000)} تومان`,
        recommended: true,
      },
      { ...CREDIT_PLANS.find((p) => p.id === 'pro')!, priceLabel: `${formatPrice(399000)} تومان` },
    ];
  }
  return [
    freeTier,
    {
      ...CREDIT_PLANS.find((p) => p.id === 'basic')!,
      priceLabel: `${formatPrice(890000)} تومان / سالانه`,
      monthlyCredits: 10,
    },
    {
      ...CREDIT_PLANS.find((p) => p.id === 'standard')!,
      priceLabel: `${formatPrice(1790000)} تومان / سالانه`,
      monthlyCredits: 120,
      recommended: true,
    },
    {
      ...CREDIT_PLANS.find((p) => p.id === 'pro')!,
      priceLabel: `${formatPrice(3590000)} تومان / سالانه`,
      monthlyCredits: 500,
    },
  ];
}
```

- [ ] **Step 3: Update the grid to handle 4 plans**

Find the grid class in the render section. It should be `md:grid-cols-3`. Change to handle the free tier differently — the free tier should be a simpler card.

In the plans map, add a condition for the free tier:

```tsx
{plans.map((plan) => (
  plan.id === 'free' ? (
    <div
      key={plan.id}
      className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-5"
    >
      <div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{plan.description}</p>
      </div>
      <div className="text-3xl font-black text-[var(--color-success)]">{plan.priceLabel}</div>
      <ul className="space-y-2">
        {plan.features?.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--color-success)]">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <ButtonLink href="/tools" variant="secondary" className="w-full" size="lg">
        شروع کنید — بدون ثبت‌نام
      </ButtonLink>
    </div>
  ) : (
    // ... existing plan card rendering
  )
))}
```

- [ ] **Step 4: Update grid columns**

Change the grid from `md:grid-cols-3` to `md:grid-cols-4` to accommodate 4 plans, or keep `md:grid-cols-3` and let the free tier be full-width above.

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 6: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add components/features/pricing/PricingContent.tsx
git commit -m "feat: add visible free tier to pricing page

- Added 'رایگان' tier as first option in pricing grid
- Free tier shows: ابزارهای پایه, خروجی با واترمارک, بدون ثبت‌نام
- CTA: 'شروع کنید — بدون ثبت‌نام' → /tools

Signed-off-by: MiMoCode <mimocode@local>"
```

---

## Task 4: Fix Contact Form

**Covers:** [S1 — Positioning Reset, 1.5]

**Files:**

- Modify: `app/contact/page.tsx:82-89`
- Modify: `app/contact/ContactForm.tsx` (if exists)

- [ ] **Step 1: Read current contact page**

Read `app/contact/page.tsx` lines 82-89. The current state:

```tsx
<section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
  <h2 className="text-lg font-black text-[var(--text-primary)]">فرم تماس</h2>
  <p className="text-sm text-[var(--text-muted)] leading-7">
    پیام شما در مرورگر ذخیره می‌شود و به سرور ارسال نمی‌شود. لطفاً اطلاعات مهم را از طریق ایمیل
    ارسال کنید.
  </p>
  <ContactForm />
</section>
```

- [ ] **Step 2: Replace misleading contact form section**

Replace the entire contact form section with direct contact methods only:

```tsx
<section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
  <h2 className="text-lg font-black text-[var(--text-primary)]">ارتباط مستقیم</h2>
  <p className="text-sm text-[var(--text-muted)] leading-7">
    برای ارتباط سریع‌تر از راه‌های زیر استفاده کنید:
  </p>
  <div className="flex flex-wrap gap-3">
    <a
      href="https://t.me/persiantoolbox"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
    >
      تلگرام — @persiantoolbox
    </a>
    <a
      href="mailto:alirezasafaeisystems@gmail.com"
      className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--color-primary)] transition-colors"
    >
      ایمیل
    </a>
  </div>
</section>
```

- [ ] **Step 3: Remove ContactForm import if unused**

Check if `ContactForm` is imported in `app/contact/page.tsx`. If the only usage was in the removed section, remove the import.

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 5: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/contact/page.tsx
git commit -m "fix: replace broken contact form with direct contact methods

- Removed contact form that only saved to browser (misleading users)
- Added direct Telegram and email contact links
- Users can now actually reach support

Signed-off-by: MiMoCode <mimocode@local>"
```

---

## Task 5: Verify All Changes Together

**Covers:** All Phase 1 sections

- [ ] **Step 1: Run full verification**

```bash
pnpm typecheck && pnpm lint && pnpm vitest --run
```

Expected: All PASS

- [ ] **Step 2: Visual verification checklist**

- [ ] Homepage H1 says "بیش از ۸۰ ابزار رایگان فارسی"
- [ ] Homepage has search bar in hero
- [ ] Homepage shows all 10 categories
- [ ] Primary CTA says "شروع رایگان" and links to /tools
- [ ] Trust badge visible: "پردازش محلی — داده‌های شما ارسال نمی‌شوند"
- [ ] Pricing page shows "رایگان" as first tier
- [ ] Contact page has Telegram + email links (no broken form)
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] All tests pass

- [ ] **Step 3: Final commit (if any remaining changes)**

```bash
git add -A
git commit -m "feat: complete Phase 1 — Positioning Reset

- Homepage hero rewritten to lead with free tools
- Search bar added to hero
- All 10 categories visible on homepage
- Free tier visible on pricing page
- Contact form replaced with direct contact methods

Signed-off-by: MiMoCode <mimocode@local>"
```
