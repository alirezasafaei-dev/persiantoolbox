# Non-Flagship Tools Hygiene Audit

**Date:** 2026-06-27
**Status:** COMPLETE

## 1. Legacy Resume Builder Routes

### Findings

Three resume builder routes exist:

| Route                          | File                                       | Purpose                                                   | In Sitemap                                  |
| ------------------------------ | ------------------------------------------ | --------------------------------------------------------- | ------------------------------------------- |
| `/text-tools/resume-builder`   | `app/text-tools/resume-builder/page.tsx`   | Legacy tool page (old ResumeBuilder component)            | Yes (via tools registry, `indexable: true`) |
| `/resume-builder`              | `app/resume-builder/page.tsx`              | Landing page that links to `/career-tools/resume-builder` | No                                          |
| `/career-tools/resume-builder` | `app/career-tools/resume-builder/page.tsx` | **Canonical** flagship product page                       | Yes                                         |

### Recommendation

`/text-tools/resume-builder` should redirect (301) to `/career-tools/resume-builder` to avoid duplicate content for SEO. The `resume-builder` entry in tools-registry (id: `resume-builder`, path: `/text-tools/resume-builder`) should be removed or set to `indexable: false`.

**Action:** DOCUMENTED — requires redirect decision + nginx config change. Not changed this batch.

### Legacy Route in Registry

```
{
  id: 'resume-builder',
  path: '/text-tools/resume-builder',   // ← should be canonical path or removed
  indexable: true,                       // ← generates sitemap entry
  category: text,                        // ← wrong category; should be career
}
```

## 2. Weak Privacy Copy

### Findings

Six places had the vague privacy answer "تا حد امکان خیر، پردازش در مرورگر انجام می‌شود." (meaning "as much as possible, no, processing happens in the browser"). For a local-first tool where **nothing** is ever sent to the server, this is misleading and undermines user trust.

### Fixed

All 6 instances replaced with: "خیر. تمام پردازش‌ها در مرورگر شما انجام می‌شود و هیچ اطلاعاتی به سرور ارسال نمی‌شود."

| File                             | Location                          |
| -------------------------------- | --------------------------------- |
| `lib/tools-registry.ts:293`      | business-tools category FAQ       |
| `lib/tools-registry.ts:331`      | career-tools category FAQ         |
| `lib/tools-registry.ts:2790`     | business-tools registry entry FAQ |
| `lib/tools-registry.ts:2826`     | career-tools registry entry FAQ   |
| `app/career-tools/page.tsx:31`   | career tools landing page FAQ     |
| `app/business-tools/page.tsx:31` | business tools landing page FAQ   |

## 3. Low-Value Sitemap Routes

### Findings

The sitemap includes several routes that add low SEO value:

- `/compare` — comparison page (exists but low value)
- `/use-cases` — use case page (exists but low value)
- `/market` — market hub (exists)
- `/refer` — referral page (exists)
- `/services` — services page (exists)
- `/pdf-tools/uses` — PDF use cases

**Recommendation:** No removal needed. These are valid pages that don't hurt SEO. Sitemap routes are all deduplicated via `new Set()`.

## 4. Duplicate Registry Entry

### Finding

`resume-builder` appears twice in `rawToolsRegistry`:

- Line 656: `id: 'resume-builder'`, `path: '/text-tools/resume-builder'`
- Line 2832: `id: 'resume-builder'`, `path: '/career-tools/resume-builder'`

Both have `id: 'resume-builder'`. The Map-based lookup (`toolsByPath`) is keyed by path so they don't collide functionally, but having two entries with the same `id` is confusing.

**Action:** Documented. Legacy entry at `/text-tools/resume-builder` should be removed once redirect is in place.

## Summary

| Item                     | Status                      | Risk                    |
| ------------------------ | --------------------------- | ----------------------- |
| Legacy resume routes     | Documented (needs redirect) | LOW (duplicate content) |
| Weak privacy copy        | FIXED (6 places)            | NONE                    |
| Low-value sitemap routes | No change needed            | NONE                    |
| Duplicate registry entry | Documented                  | LOW                     |
