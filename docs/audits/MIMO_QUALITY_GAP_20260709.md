# Quality Gap Audit — Score Path 7.5 → 9

**Date:** 2026-07-09  
**Auditor:** MIMO Agent  
**Baseline:** ~7.5/10 (code quality pack + SEO factory complete)  
**Target:** 9/10 (P4b + P5 completion)  
**NOT claiming:** 10/10 — P6 (30-day stability) not yet achievable.

---

## Executive Summary

The codebase has strong foundations: shared `Input` component with proper `<label htmlFor>`, comprehensive focus-visible CSS, tier-aware trust blocks, and a detailed `/trust` page. The main score path from 7.5 → 9 requires closing specific gaps in a11y, trust/social proof, blog content depth, and CWV measurement.

---

## P0 — Critical (Blocks 8.5+)

### 1. Skip-Link Missing (WCAG 2.4.1 Bypass Blocks)

**File:** No file found — grep for `skip-link`, `skip to content`, `SkipLink` returned 0 matches.  
**Impact:** Keyboard users must tab through entire navigation to reach content on every page.  
**Fix:** Add a visually-hidden skip link at the top of `app/layout.tsx` or `components/ui/SiteShell.tsx` that targets `#main-content`. Add `id="main-content"` to the main landmark.  
**Effort:** 15 min.  
**Pattern:** Use existing `.sr-only` utility (already available via Tailwind) with `focus:not-sr-only`.

### 2. NewsletterSignup Email Input — No Label (WCAG 1.3.1, 4.1.2)

**File:** `components/home/NewsletterSignup.tsx:64`  
**Issue:** `<input type="email">` has only `placeholder="ایمیل خود را وارد کنید"` — no `<label>`, no `aria-label`.  
**Fix:** Add `aria-label="ایمیل خبرنامه"` to the input. This matches the compact inline pattern used elsewhere (no space for a visible label in the flex row).  
**Effort:** 1 min.  
**Note:** This fix has been implemented as part of this audit.

### 3. TestimonialsSection — Placeholder, Not Real (Trust Gap)

**File:** `components/home/TestimonialsSection.tsx:30`  
**Issue:** Section explicitly says "این بخش فعلاً خلاصه‌ای از الگوهای پرتکرار استفاده است" — not real testimonials. These are labeled as "مسیر مالی و اداری" etc., not user quotes.  
**Current state:** Honest (no fake quotes) but clearly placeholder.  
**Fix:** Replace with real verified testimonials from Telegram channel / support tickets. Until real testimonials exist, this section should remain as-is (honest placeholder) rather than fabricate quotes.  
**Score impact:** ~0.3 points toward trust/authenticity.

---

## P1 — High Priority (Required for 8.5–9.0)

### 4. A11y Form Labels — Sitewide Audit Needed

**Scope:** 253 `<input>`, 51 `<textarea>`, 55 `<select>` across the codebase.

**What's GOOD (already correct):**

- `shared/ui/Input.tsx` — Has optional `label` prop → renders `<label htmlFor>`. Well-designed.
- `NumericInput` — Passes `label` through to Input. SalaryPage uses it correctly.
- `InterestPage.tsx:68-94` — Wraps each input in `<label className="flex flex-col gap-2">`. Correct pattern.
- `InsuranceCalculator.tsx:76-108` — `<label htmlFor>` + input. Correct.
- `HiringCostCalculator.tsx:116-171` — `<label htmlFor>` + `aria-label` (belt+ suspenders). Good.
- `SalaryPage.tsx:551-608` — Checkboxes wrapped in `<label>` with `htmlFor`. Correct.
- `OvertimeCalculator.tsx:82-117` — `<label htmlFor>` with id-linked inputs. Correct.
- `CheckPenaltyCalculator.tsx:169-203` — `<label htmlFor>` + `aria-label` on selects. Correct.
- `TextOnImage.tsx:124-159` — `<label htmlFor>` + `aria-label`. Correct.

**What's MISSING or INCONSISTENT:**

- `NewsletterSignup.tsx:64` — No label, no aria-label (FIXED in this audit).
- `PersianWritingStudio.tsx:245` — `<input>` without visible label or aria-label (uses placeholder only).
- `BlogListClient.tsx:167,177` — Two `<select>` elements — need to verify labels.
- `PDF tools` (add-watermark, add-page-numbers, etc.) — File inputs are `opacity-0` with visual dropzone text. Some have `aria-label`, some don't. Need pass.
- `Image tools` (ImageDropzone.tsx:45) — Hidden file input, needs `aria-label`.

**Estimated scope:** ~15–20 components need a quick `aria-label` addition. Pattern: add `aria-label="متن توصیفی"` to inputs that only have placeholders.

### 5. Blog P4b Gaps — B7 Pillar Article Depth

**Status of P4b tasks:**
| Task | Status | Notes |
|------|--------|-------|
| B1 Visual system | ✅ | Cover images with fallback |
| B2 Schema BlogPosting | ✅ | JSON-LD with image |
| B3 Screenshot guidelines | ✅ | In git |
| B4 Draft articles | ✅ | `published: false` (1 found: loan-calculation-visual-guide) |
| B5 Editorial homepage | ✅ | `BlogEditorial.tsx` — featured, secondary, hubs, latest, series, tool CTA |
| B6 Topic hubs | ✅ | 6 hubs defined in BlogEditorial.tsx:198-235 |
| B7 8 pillar articles | ⏳ | 127 posts exist, need to verify word counts ≥2k and UI screenshots |
| B8 Author/trust layer | ✅ | `BlogPost.tsx:227` AuthorSection + `app/blog/author/page.tsx` |

**Gap:** B7 requires verifying that pillar articles meet depth criteria (2–3.5k words, real UI screenshots). The 127 posts exist but pillar article depth needs spot-check.

### 6. CWV Measurement — No Field Data

**Issue:** No Lighthouse CI, no web-vitals library, no field data collection on public URL.  
**Fix:** Add `web-vitals` package → send to GA4 (already configured with `G-KRMGLP8TXP`).  
**Score impact:** Cannot claim CWV score without measurement.  
**Effort:** ~1 hour.

### 7. Contrast — No Automated Check

**Issue:** Focus-visible CSS is comprehensive (`globals.css:779-810`), but no automated contrast audit exists.  
**Fix:** Run Lighthouse accessibility audit or axe-core against key pages.  
**Known good:** `text-primary` on `surface-1` uses CSS variables that respect dark/light mode. Primary green (#14532d) on white is likely AA-compliant.

---

## P2 — Medium Priority (Required for 9.5+)

### 8. Popup Pressure — Still Present

**Status:** Popups delayed (P1.9 done) but `SmartCTA.tsx` still shows exit-intent and timed popups.  
**Fix:** Further reduce frequency; only show after 3+ page views; never show on /trust, /contact, /blog.  
**Score impact:** ~0.2 points UX.

### 9. Trust Claims — No Ongoing Verification

**Current claims (all defensible):**

- "۱۰۰٪ پردازش محلی" — Verified: client-side tools confirmed, `/trust` page documents network behavior.
- "بدون ثبت‌نام" — True: all tools work without auth.
- "بدون آپلود فایل به سرور" — True for PDF/image/text tools. Audit tool (separate product) does send URLs.
- Tool count from registry — Dynamic, accurate.

**Gap:** No automated test that verifies "local-only" claims remain true after code changes.  
**Fix:** Add a test that asserts no `fetch('/api/...')` calls in tool page components for file processing.

### 10. Brand System — Not Unified

**Issue:** No consistent color palette documentation, no design tokens beyond CSS variables.  
**Fix:** Lower priority — CSS variables already provide consistency. Formal brand guide is P6 territory.

---

## Files Touched in This Audit

| File                                   | Change                                            |
| -------------------------------------- | ------------------------------------------------- |
| `components/home/NewsletterSignup.tsx` | Added `aria-label="ایمیل خبرنامه"` to email input |

---

## Score Projection

| Area         | Current  | After P0 | After P1 | Path to 9                   |
| ------------ | -------- | -------- | -------- | --------------------------- |
| Product idea | 7.5      | 7.5      | 7.5      | Authority content           |
| SEO          | 6.6      | 6.6      | 6.6      | Deep tool pages             |
| UX           | 7.3      | 7.3      | 7.5      | Fewer popups                |
| Trust        | 7.0      | 7.0      | 7.3      | Real testimonials           |
| A11y         | 6.0      | **6.5**  | **7.0**  | Full label pass + skip-link |
| Technical    | 6.5      | 6.5      | 7.0      | CWV measurement             |
| **Overall**  | **~7.5** | **~7.7** | **~8.0** | **~9 with P1+P2 complete**  |

---

## Recommended Next Steps

1. **Immediate (P0):** Merge the NewsletterSignup aria-label fix. Add skip-link to SiteShell.
2. **This week (P1):** Run a11y label audit across all 253 inputs. Add `aria-label` to the ~15 components missing labels.
3. **This week (P1):** Add `web-vitals` → GA4 for CWV field data.
4. **Next sprint (P1):** Collect real testimonials from Telegram/support. Replace placeholder TestimonialsSection.
5. **Next sprint (P2):** Spot-check B7 pillar article word counts and screenshot quality.

---

_This audit does NOT claim 10/10. P6 (30-day stability, SLO, rollback rehearsal) is not yet achievable._
