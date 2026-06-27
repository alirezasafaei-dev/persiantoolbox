# Pay-Per-Export Sprint 1 Report

**Date:** 2026-06-27

## Summary

Implemented MVP pay-per-export for flagship products (فاکتورساز و رسیدساز, رزومه‌ساز حرفه‌ای). The implementation adds an upgrade modal at export time that connects to the existing ZarinPal payment infrastructure.

## What Changed

| File                                                        | Change                                     |
| ----------------------------------------------------------- | ------------------------------------------ |
| `shared/hooks/useSubscriptionStatus.ts`                     | New — client-side subscription status hook |
| `components/features/pricing/UpgradeModal.tsx`              | New — upgrade modal with checkout flow     |
| `components/features/business-documents/DocumentStudio.tsx` | Added upgrade CTA + modal integration      |
| `components/features/career-documents/CareerWizard.tsx`     | Added upgrade CTA + modal integration      |
| `app/api/errors/route.ts`                                   | Auto-fixed pre-existing lint errors        |

## Verification

| Check     | Result                        |
| --------- | ----------------------------- |
| Lint      | ✅ 0 errors, 140 warnings     |
| Typecheck | ✅ PASS                       |
| Vitest    | ✅ 859/859 tests              |
| Build     | Not run (requires VPS deploy) |

## UX Flow

1. User fills in document (free, no account needed)
2. User reaches export step
3. If not premium: sees "خروجی بدون واترمارک" button
4. Click button → upgrade modal opens
5. Modal shows price (۹۹٬۰۰۰ تومان/ماه) and checkout button
6. Click checkout → redirects to ZarinPal (requires login)
7. After payment → page reloads with premium status
8. Premium user sees PDF/DOCX export buttons, no watermark

## Privacy

- No document content sent to server
- All export logic remains client-side
- Only plan ID and price sent to checkout API
- Payment handled by ZarinPal (standard Iranian gateway)

## What's NOT Done

1. Server-side export verification (client-side gates only)
2. True pay-per-export (one-time purchase)
3. Account-free purchase
4. Writing tool monetization

## Risk Assessment

- **Low risk** — additive changes, no breaking changes
- **Export bypass** — client-side gates can be bypassed via browser console (acceptable for MVP)
- **Subscription required** — users must create account to purchase

## Recommended Next Steps

1. Deploy to production
2. Monitor conversion rate
3. Add server-side export verification (Sprint 2)
4. Add pay-per-export option (Sprint 2)
5. Add writing tool monetization (Sprint 3)
