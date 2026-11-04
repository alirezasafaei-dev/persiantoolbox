# Invoice composite text compatibility plan

**Goal:** Close the measured Persian-total and legacy punctuation extraction failures without changing visible content, arithmetic, privacy, dependencies, or using reader-specific reversed Unicode/hidden text.

**Design:** Encode an eligible flat LTR/numeric shaped run as one real vector glyph in a standard Type 3 font. Its CharProc references cached, vector-only Vazirmatn path Forms at the original shaped offsets; ToUnicode maps that visible composite glyph to the exact original run string. Semantic text and text operators remain directly in page content streams; Forms contain paths only. RTL and varying-height mark runs keep the existing embedded font path. Normalize the vector font to 1,000-unit glyph space; cache identical runs and individual outlines separately per font face; split font dictionaries at the single-byte 255-code limit. Mapping destinations are bounded by the PDF 512-byte/256-UTF-16-unit limit; longer runs retain existing glyph encoding without truncation. Charge actual wrapper operators and unique vector streams; aggregate budget exhaustion throws the existing typed export error instead of silently returning defective text.

**Evidence before implementation:** External two-page numeric control reproduces plain extraction failure with ordinary digits and passes all five numeric samples using real composite outlines in PDFium and pypdf plain/layout. A second control preserves isolated Latin baselines and passes paired quotes, metadata, URL and Persian amount in PDFium and bundled pypdf 6.10.0. Putting Latin beside Persian on one baseline still fails PDFium, so preserve the approved reflow. These are hypotheses proven only on controls until actual invoice fixtures pass.

**Files:** new `lib/invoice-tools/composite-pdf-font.ts` owns vector paths, Type 3 resources, caching and Unicode maps; `lib/invoice-tools/rtl-pdf.ts` selects eligible runs and finalizes both font paths; invoice unit tests cover real paths, content extraction, caching, code-bucket rollover and safe fallback. Evidence/status documents reflect final results.

- [x] Obtain independent architectural assessment of standards/semantics before product implementation. Owner delegated routine technical choices and requested continued implementation; no new runtime dependency or merge/deploy approval is inferred.
- [x] Add genuine failing representation/resource regressions, then implement using public fontkit outline callbacks and existing pdf-lib operators. Preserve standard RTL `TJ` and GPOS behavior.
- [x] Verify all previous samples, amounts and punctuation in PDFium, PDF.js, pypdf 6.10.0 and 6.21.4, in both pypdf modes, using actual multi-page invoices. Keep every failed experiment traceable.
- [x] Render/review all sample pages and inspect text bounds. Measure realistic and maximum allowed exports; reject material rendering/resource regressions. See the [2026-11-04 evidence](../../growth/invoice-composite-text-2026-11-04.md).
- [x] Run focused checks, final sequential application gates, standalone smoke and an actual built-browser download. Obtain independent final review and secret/security/licensing gates.

Signed commit/push and exact-head hosted CI status are recorded in PR #245, rather than inferred from these local results. No merge/deployment is authorized.

**Acceptance:** All previously failing declared samples must pass without hidden markers, modified numeric strings, dummy text, bitmap text, or semantic text/text operators in Form XObjects. Vector-only path Forms are allowed; the earlier whole-text-in-Form experiment remains rejected. If any actual reader path loses text or visual fidelity, keep the candidate out of release and address that exact failure before final sign-off.
