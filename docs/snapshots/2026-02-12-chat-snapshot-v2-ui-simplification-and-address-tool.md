# Chat Snapshot — V2 UI Simplification + Address Tool

Date: 2026-02-12  
Repository: `persian_tools`

## Scope locked in this snapshot

- Simplified primary UX to reduce clutter on homepage, navbar, tools dashboard, and tool pages.
- Disabled account/login/admin/subscription/history surfaces (route-level `notFound` and API `410` where applicable).
- Added new text tool: Persian address to English (`/text-tools/address-fa-to-en`).
- Kept fixed attribution footer across pages and made portfolio link env-driven.
- Moved site-settings backend storage to local SQLite minimal mode.

## Key implementation highlights

- New tool logic/UI/route:
  - `features/text-tools/address-fa-to-en.ts`
  - `components/features/text-tools/AddressFaToEnTool.tsx`
  - `app/(tools)/text-tools/address-fa-to-en/page.tsx`
- Registry/SEO/nav alignment:
  - `lib/tools-registry.ts`
  - `components/ui/Breadcrumbs.tsx`
  - `components/ui/Navigation.tsx`
- Simplification/removal passes:
  - `components/HomePage.tsx`
  - `components/features/tools-dashboard/ToolsDashboardPage.tsx`
  - `components/features/*` (loan/salary/validation/text/pdf/date)
  - `app/account/page.tsx`, `app/developers/page.tsx`, `app/support/page.tsx`, `app/plans/page.tsx`, `app/subscription-roadmap/page.tsx`, `app/ads/page.tsx`, `app/dashboard/page.tsx`, `app/checkout/[id]/page.tsx`
- Footer final behavior:
  - `components/ui/Footer.tsx` reads `PORTFOLIO_URL` then `NEXT_PUBLIC_PORTFOLIO_URL`; if unset, shows plain attribution text without link.

## Verification evidence

- `pnpm run lint` ✅
- `pnpm run typecheck` ✅
- `pnpm vitest --run` ✅ (58 files, 233 tests passed)
- `pnpm run build` ✅

## Notes

- This snapshot is an implementation checkpoint only; no direct server mutation/deploy action executed in this step.
- Portfolio URL placeholder is now replaced by env-based configuration and can be activated by setting:
  - `PORTFOLIO_URL` (server/runtime)
  - or `NEXT_PUBLIC_PORTFOLIO_URL` (public fallback)
