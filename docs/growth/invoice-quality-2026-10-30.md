# Invoice quality: first organic-growth deliverable

Date: 2026-10-30. Base: `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129`.
Branch: `codex/organic-growth-20261030`.

## Selection and scope

The owner approved a measurable growth sprint. Current authorized read-only Search Console data selected the existing `/tools/invoice-generator` page. Raw exports, queries, account information and private metrics remain outside Git. No new article production, route, keyword landing page, premium behavior, analytics payload or server API was added.

## Changes

- PDF and fontkit modules are imported only when export is requested.
- Empty and zero quantities now produce the same zero totals in the PDF and preview. Explicit positive/fractional quantities, multiple rows, tax and discount retain the existing arithmetic.
- An export failure shows a Persian error through the existing toast hook and allows a retry.
- The required regular TTF font had been removed while three PDF generators still referenced it. Restore the original font so those existing requests can succeed; the selected invoice journey was verified.
- On small screens the description receives a full row instead of collapsing beside fixed numeric fields. Desktop retains the existing arrangement.

## Font provenance

`Vazirmatn-Regular.ttf` was restored from `9e3cb7e9^:public/fonts/Vazirmatn-Regular.ttf` and compared byte for byte with [upstream v33.003](https://github.com/rastikerdar/vazirmatn/blob/v33.003/fonts/ttf/Vazirmatn-Regular.ttf).
SHA-256: `b69fd4c680b8f3f225feabcc655a2c585d97627b8f5f5c0f9985e894069f3a56`.
The complete [upstream OFL license](https://github.com/rastikerdar/vazirmatn/blob/v33.003/OFL.txt) is distributed as `public/fonts/OFL-Vazirmatn.txt`, with trailing whitespace normalized.

## Verification

- Existing SEO baseline: 20 tests passed before implementation.
- RED: eager PDF imports, preview/export mismatch and missing error feedback reproduced; missing regular font and missing license reproduced with asset tests.
- Nine focused invoice tests pass: deferred module evaluation, blank/zero totals, fractional/multi-row arithmetic, PDF creation and font-fetch failure/retry, and real Persian PDF embedding using both shipped TTF fonts.
- The lazy-load test was isolated into its own module context; shuffled execution with seed 7 passes.
- `pnpm ci:quick`: PASS, 258 test files / 1,918 tests. No lint errors; existing warning count is retained in local evidence. The final responsive class correction also passed focused tests.
- `pnpm ci:contracts`: PASS, including final documentation/link and licensing checks.
- Final `pnpm build`: PASS. Canonical standalone smoke: PASS, 11 checks, using copied static and public assets.
- Final mobile browser observation: 382px content viewport, 382px document scroll width, 268px description input (previously 34px). The project defines `sm` at 360px, so the desktop row starts at `md` (768px). Desktop layout remains a row.
- Local mobile Lighthouse 13.0.1: Performance 76, LCP 5.9s, FCP 2.2s, TBT 10ms, CLS 0. This is a single simulated localhost run, with no matching before-run or field data; the 95+ performance aspiration is not achieved. LCP remains a future profiling priority.
- Initial-HTML script inspection shows PDF/fontkit implementation chunks deferred in the local candidate. Decoded initial script sizes differ from the deployed build; they are not compressed-transfer measurements or a causal speed/SEO uplift estimate.
- Real local Chrome downloads after font restoration were verified independently on disk. One-page PDF text confirms zero totals for blank quantity. Download-event automation timed out despite actual files being saved; that listener is not a passing test.
- No production deployment, hosted CI pass, ranking uplift, conversion uplift, field CWV improvement or exhaustive PDF-layout acceptance is claimed.
- Independent code review found no remaining correctness, licensing or security issue after focused fixes; final responsive breakpoint selection was verified in the actual browser.

## Security and evaluation

At the initial invoice commit, dependencies and lockfile were unchanged. The production dependency audit reported zero High/Critical and five Low/Moderate advisories and exited nonzero. Hosted CI correctly blocked the candidate. The [security follow-up](../ops/dependency-security-2026-10-30.md) supersedes that dependency checkpoint with patched versions and a clean audit; the security gate remains unchanged.

## PDF visual acceptance follow-up

Rendering the actual downloaded one-page PDF exposed incorrect bidirectional layout: the invoice identifier and date were reversed, Persian prices had reversed digit order, and some mixed Persian/Latin text was malformed. PDF creation and extracted text did not establish visual correctness. **Visual acceptance: FAIL; release remains blocked on this defect.** A separate layout correction and rendered-output review are required before final acceptance.

The [RTL candidate follow-up](invoice-rtl-quality-2026-10-30.md) supersedes the visual sample checkpoint with corrected local renders and pagination. Overall PDF acceptance remains blocked on cross-reader copy/search compatibility; no complete export acceptance or production fix is claimed.

After an explicitly approved release, verify the live tool and font, then compare complete 28-day Search Console periods and tool completion evidence when available. Search rankings remain an observed outcome, not a guarantee. The restored font benefits other existing consumers, but their complete document journeys were not tested in this task.
