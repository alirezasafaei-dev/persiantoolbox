# Invoice RTL PDF candidate — 2026-10-30

## Scope and authority

Rendering the actual first-sprint download exposed reversed invoice identifiers, dates and Persian amounts, plus incorrect mixed-script shaping. This follow-up corrects the visual layout and prevents long invoices from overflowing a single page. The owner explicitly approved the limited AGENTS.md exception to declare existing `bidi-js@1.0.3` as a direct runtime dependency. Its [MIT notice](../../public/licenses/bidi-js-MIT.txt) is included. No other dependency was added.

The client imports the PDF generator only on export. Processing remains local; font requests use existing same-origin assets. The tool's arithmetic, entitlements and route remain unchanged. No merge or deployment is authorized.

## Candidate implementation

- Unicode bidi levels order direction runs; fontkit shapes each run with explicit direction. Draw glyphs at their actual advances and offsets instead of discarding GPOS positioning.
- Embed the existing TTF fonts fully and reuse one resource per weight/page. Explicit CID-to-glyph and Unicode maps avoid the default presentation-form mappings and retain original joining characters. Full embedding is required; do not enable subsetting without redesigning these maps.
- Separate direction runs into text objects so heuristic extractors do not discard mixed Latin field values. No experimental ActualText, inserted LRM/RLM or bidi-override workaround remains in the candidate.
- Wrap descriptions within their table column, preserve explicit paragraph breaks, and repeat table headers on continuation pages. Totals and payment terms also paginate.
- Missing glyphs use the font's visible replacement character; original Unicode remains mapped. A Persian info toast asks users to inspect the downloaded document. Symbols no longer silently disappear.
- Ignore input bidi formatting overrides while preserving ZWNJ/ZWJ and combining marks. Wrapping uses grapheme boundaries, including surrogate pairs.

## Evidence and remaining blocker

**Visual sample acceptance: PASS. Overall PDF acceptance: FAIL / cross-reader extraction remains open. Keep PR #245 Draft.**

Synthetic actual-generator PDFs cover a blank-quantity invoice, mixed Persian/Latin rows with fractional quantities/tax/discount/payment paragraphs, and a 45-row invoice spanning four pages. All six pages were rendered with Poppler and visually inspected: identifiers, dates, amounts and joined Persian are readable; description/number columns do not overlap and content stays within page bounds. These are local candidate samples, not production or exhaustive font coverage.

PDF.js checks preserve complete field values, logical Persian Unicode, marks, ligatures and original emoji Unicode, and verify multi-page totals and text bounds. Readers may split a line into separate direction-run items and omit joining controls during extraction; the PDF's Unicode map retains the joiner. The fallback test verifies an actual replacement outline and nonzero glyph mapping; the UI warning is tested separately.

**Open compatibility defect:** bundled PDFium full-page extraction/search can reorder hyphenated identifiers, Latin word/number phrases and URLs even when their rendered appearance is correct. Secondary pypdf/pdfplumber extraction also has RTL ordering/ligature/number limitations. Passing PDF.js extraction does not prove correct copy/search in Chrome or every reader. Changes to operator order, directional marks and ActualText were experimentally evaluated outside Git and rejected when they caused character loss, duplication or reversal. This issue must not be reported as fixed or hidden by adjusting a CI threshold.

## Verification checkpoint

- Focused component/loading/real-font RTL PDF and font-asset tests: 17 passed. Mixed unsupported graphemes in both orders were reproduced as failing cases before pre-shaping replacement clusters; both now save and retain original Unicode. Supported characters followed by variation selectors were also reproduced after glyph-cache population; selectors now remain in the source map without consuming a shaped glyph, and extracted base characters are verified.
- Final sequential local gates: `pnpm ci:quick` passed 259 files / 1,926 tests; `pnpm ci:contracts` and `pnpm build` passed; canonical `pnpm smoke:local` with PowerShell `SMOKE_HOST=127.0.0.1` / `SMOKE_PORT=3187` (Windows equivalent of `predeploy:smoke`) passed 11 standalone checks. All commands exited 0.
- An earlier full run timed out in the unchanged five-second Search Console property-selection test while build and tests overlapped. Its focused 22-test suite passed, and the final sequential full run above passed without changing the timeout or test.
- Built-browser acceptance: a real synthetic invoice download was saved, independently opened and rendered as one page. Its 1.5 quantity, tax and discount agree with the 160,000-toman UI total; mixed unsupported graphemes produced visible replacements and the Persian info toast. This does not supersede the open reader-copy failure.
- Production audit after the approved dependency addition: exit 0, zero advisories at every severity across 564 dependencies. The final valid retry used `pnpm audit --prod --audit-level=high --json`, without ignoring registry errors. Earlier ECONNRESET responses were rejected as audit evidence even when the ignore-errors option returned exit 0. Repository secret scan, staged-diff Gitleaks, ignored-sensitive-file probes and licensing passed. Exact-head hosted results belong in the final delivery receipt; preceding-commit CI is not this candidate's proof.
- Independent review verified the unsupported-grapheme and variation-selector fixes with no additional findings in its final bounded pass. Its disposition remains Draft with release blocked by the documented PDFium copy/search issue.
- The preceding security correction `95f62105e8e1acc710a6a419bbd65272bf80772b` passed all 15 hosted checks. It is a separate checkpoint.
- Live read-only health/version still reported `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129`, healthy/ready. No candidate behavior is claimed live.

Next required work is a bounded PDFium-compatible text/search design, verified against actual browser readers while retaining the corrected visuals and local-only processing. No ranking, conversion or field-performance improvement is claimed.
