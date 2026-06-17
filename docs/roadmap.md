# PersianToolbox Roadmap

**Last Updated**: 2026-06-17T07:15:00Z
**Status**: Active
**Version**: v3.0.6

---

## Current Project Status

- **51 app pages**, 16 API routes, 43+ components, 90+ test files
- **Security**: CSP with nonces, CSRF, rate limiting, timing-safe password hashing
- **Privacy**: All tool processing is client-side (verified)
- **Quality**: 327 tests passing, lint clean, typecheck clean, test:ci passing with coverage, build passing
- **Live**: https://persiantoolbox.ir

---

## Completed Improvements (2026-06-17 Audit Run)

### P1 - High Impact (Phase 1)

1. **Fixed RTL spacing in Alert component** (`shared/ui/Alert.tsx`)
   - Replaced `mr-3` / `mr-auto` with `ms-3` / `ms-auto` for correct RTL behavior

2. **Fixed RTL spacing in Breadcrumbs** (`components/ui/Breadcrumbs.tsx`)
   - Replaced `ml-2` / `ml-1` with `me-2` / `me-1` for correct RTL behavior

3. **Fixed dark mode token inconsistency in ErrorBoundary** (`components/ui/ErrorBoundary.tsx`)
   - Replaced `text-white` with `text-[var(--text-inverted)]`

4. **Fixed dark mode classes in AdSlot** (`shared/ui/AdSlot.tsx`)
   - Replaced hardcoded `dark:border-amber-*` / `dark:border-gray-*` with CSS variable tokens

5. **Fixed container max-width mismatch** (`shared/constants/tokens.ts`)
   - Aligned `tokens.container.maxWidth` with CSS variable `--container-max: 1240px`

6. **Added missing shadow token** (`shared/constants/tokens.ts`)
   - Added `shadow.strong` to match CSS variable and Tailwind config

7. **Fixed button border-radius to use token** (`app/globals.css`)
   - Replaced `rounded-[14px]` with `rounded-[var(--radius-lg)]`

8. **Fixed PDF worker client promise leak** (`features/pdf-tools/workerClient.ts`)
   - Added `reject()` call for invalid requests that don't include `file` or `files`

9. **Extracted shared home tool data** (`shared/constants/home-tools.tsx`)
   - Created single source of truth for homepage tool entries
   - Updated `PopularTools.tsx` and `RecentTools.tsx` to use shared data

10. **Removed duplicate tools-registry entry** (`lib/tools-registry.ts`)
    - Removed duplicate `address-fa-to-en` entry (kept the one with full content)

11. **Fixed pre-existing test failures** (`tests/unit/tools-registry-display.test.ts`)
    - Updated test expectations to match current registry state (date-tools now has child tools)

### P1 - High Impact (Phase 2)

12. **Fixed useReducedMotion to be reactive** (`shared/ui/useReducedMotion.ts`)
    - Refactored from static `window.matchMedia` read to `useState` + `useEffect` with event listener
    - Now responds to system preference changes during the session

13. **Added aria-live region to ToastProvider** (`shared/ui/ToastProvider.tsx`)
    - Added `role="status"`, `aria-live="polite"`, and `aria-label` to toast container
    - Screen readers now announce toast messages

14. **Fixed subscription page design tokens** (`app/(tools)/subscription/page.tsx`)
    - Replaced `text-green-600` with `text-[var(--color-success)]`
    - Replaced `border-[var(--border-light)]` with `border-[var(--border-default)]`
    - Replaced `container mx-auto` with `section-surface` for visual consistency

15. **Fixed premium page design tokens** (`app/(tools)/premium/page.tsx`)
    - Replaced `text-white` with `text-[var(--text-inverted)]`
    - Replaced `text-green-500` with `text-[var(--color-success)]`
    - Replaced `container mx-auto` with `section-surface` for visual consistency

16. **Added ToolSeoContent to 16 lightweight tool pages**
    - Updated image-tools: resize-image, text-on-image, rotate-image
    - Updated text-tools: word-counter, case-converter, remove-spaces, number-converter, extract-info
    - Updated date-tools: shamsi-gregorian, date-difference, persian-calendar, event-reminder
    - Updated finance: tax-calculator, living-cost, bank-rate-comparator
    - Updated validation-tools: image-to-qr
    - All pages now use `getToolByPathOrThrow` for registry-driven metadata
    - All pages now render `ToolSeoContent` for SEO structured data

### P2 - Medium Impact

17. **Fixed lint indentation errors** (`app/history/page.tsx`, `playwright.config.ts`)
    - Auto-fixed 10 indentation violations via `eslint --fix`

### P1 - High Impact (Phase 3)

18. **Fixed vitest coverage provider mismatch** (`package.json`)
    - Updated `@vitest/coverage-v8` from `^1.6.1` to `^2.1.8`
    - Added `@vitest/coverage-v8` to pnpm overrides as `2.1.8`
    - `pnpm test:ci` now passes with coverage

19. **Fixed minimatch override conflict** (`package.json`)
    - Removed `minimatch` override that was pinning to `3.1.3`
    - `test-exclude` (used by coverage-v8) needs newer minimatch

20. **Subscription page clearly marked as coming soon** (`app/(tools)/subscription/page.tsx`)
    - Added Alert banner: "قابلیت اشتراک هنوز منتشر نشده است"
    - Disabled interactive elements with `opacity-60 pointer-events-none`
    - Removed mock data, shows empty state

21. **Premium page clearly marked as coming soon** (`app/(tools)/premium/page.tsx`)
    - Added Alert banner: "طرح‌های اشتراک هنوز منتشر نشده‌اند"
    - Disabled action buttons with `disabled` attribute
    - Added Persian numeral formatting for prices

22. **Added aria-live to ErrorBoundary** (`components/ui/ErrorBoundary.tsx`)
    - Added `role="alert"` and `aria-live="assertive"` to error state container

23. **Added aria-hidden to all decorative icons** (`shared/ui/icons.tsx`)
    - Added `aria-hidden="true"` to all 14 icon components
    - Prevents screen readers from announcing decorative SVGs

---

## Remaining Issues

### P0 - Production Blockers

None identified.

### P1 - High Impact Quality/Product Improvements

No remaining P1 items.

### P2 - Important Non-Blocking Improvements

No remaining P2 items.

### P3 - Future Enhancements

No remaining P3 items. All roadmap items complete.

---

## Suggested Next Release Scope

**v3.1.0** - Quality & Consistency Release

1. ✅ Fix all P1 issues (completed)
2. ✅ Unify lightweight tool pages with `ToolSeoContent` + `getToolByPathOrThrow` (completed)
3. ✅ Subscription/premium pages clearly marked as coming soon (completed)
4. ✅ Add missing accessibility features (aria-live on toast/error, aria-hidden on icons) (completed)
5. ✅ Fix vitest coverage provider and minimatch conflicts (completed)
6. ✅ Validate-tools page pattern alignment (completed)
7. ✅ Consolidate old roadmap files with archive headers (completed)
8. ✅ Expand coverage include list (completed)
9. ✅ Parallel image compression with concurrency limit (completed)
10. ✅ Dark mode manual toggle support (completed)
11. ✅ Visual regression testing with Playwright screenshots (completed)
12. ✅ Performance budgets enforcement in CI (already in place)

---

## Risks and Mitigation

| Risk                                         | Mitigation                                                           |
| -------------------------------------------- | -------------------------------------------------------------------- |
| RTL spacing changes may affect layout        | Changes use logical properties (`ms-*`, `me-*`) which are RTL-native |
| Token alignment may shift visual appearance  | Button radius change from 14px to 16px is minimal and consistent     |
| Duplicate registry removal may affect search | The kept entry has full content; duplicate had none                  |
| `workerClient` reject may surface new errors | Only triggers on invalid requests (should never happen in practice)  |
| Removing minimatch override                  | Only affected dev dependencies, no production impact                 |
