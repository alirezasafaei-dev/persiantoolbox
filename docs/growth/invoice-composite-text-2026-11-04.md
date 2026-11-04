# Invoice PDF: exact numeric and quoted text, 2026-11-04

## Scope and cause

This continues the approved invoice quality task in PR #245. The flat-page baseline fixed native Chrome's `React 19` search, but bundled pypdf 6.10.0 still lost leading quoted punctuation and reversed Persian amounts. pypdf 6.21.4 fixed punctuation but still reversed amounts. The owner's rejection of accepting these failures remains binding.

The new writer represents affected numeric and bracket/quote-leading LTR runs as real Type 3 vector ligatures. Each visible glyph maps to the unchanged complete source string through ToUnicode. Its CharProc places cached original font outlines using balanced `q cm Do Q`; those Form XObjects contain vector paths only, explicit bounds, identity matrix and empty resources. Page text remains direct `BT/Tj`; no text, hidden markers, inverse Unicode, raster text, network processing or new dependencies are introduced. Ordinary identifiers/URLs and shaped Persian/combining runs retain the original glyph path.

This differs from the rejected whole-text-in-Form experiment: no semantic text is moved into a Form. Independent architectural review accepted the distinction. The existing bidi reflow, font identity, inherited fill color, arithmetic, privacy and export gates are preserved.

## Resource regression and correction

The initial duplicated-outline implementation reached its 8 MiB compressed stream budget on a valid 1,000-row synthetic invoice. At row 763/764 it silently fell back, causing 708 of 3,000 declared tokens to fail pypdf 6.10.0 plain extraction. This was a blocking failure, not an accepted limitation. Quantizing coordinates alone still hit the budget.

Caching vector paths once per font face/glyph removes that duplication. A second independent probe caught the obsolete per-run duplicated-path cost guard; it was corrected to count the actual placement operators. Genuine failing tests preceded both fixes. Aggregate overflow now throws `InvoicePdfInputError`, preserving the existing actionable UI/retry and preventing partial download.

Limits remain: 256 UTF-16 units per composite mapping, 255 codes per font bucket, 2,048 operators/64 KiB per unique outline, 4,096 composite entries, 8 MiB compressed and 64 MiB raw streams per document. Stream budgets include both unique path Forms and composite wrappers. Mapping/resource overhead is additionally bounded by entry/code/string limits. Unsupported marks, missing glyphs and longer mappings retain the original font path without truncation. Path operands round to 0.001 normalized glyph unit; control boxes round outward. At 14 pt the maximum rounding displacement per operand is 0.000007 pt.

## Reader and visual evidence

All artifacts are synthetic and retained outside Git in the task evidence directory; screenshots containing the owner's browser surroundings are not published.

| Check                                                                                                    | Result                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Six actual fixtures: blank, mixed, missing glyph, 45-row, 16-field invoice matrix, isolated text control | PDFium 156.0.8076 full/partial search-copy and bounds PASS; pypdf 6.10.0 and 6.21.4 plain/layout declared tokens PASS                                                                    |
| 1,000 unique rows / 25 pages                                                                             | All 3,000 descriptions, prices and row totals present in PDFium, PDF.js 4.10.38 and both pypdf versions/modes; zero missing tokens                                                       |
| Mapping boundary                                                                                         | Non-palindromic 256-digit Persian sequence and 200-character quoted Latin sample retain Type 3 representation and exact extraction; independent reader probe PASS                        |
| Unit regressions                                                                                         | 25 invoice tests PASS, including shared document budget, cache reuse, code rollover, vector-only resources and exact PDF.js text                                                         |
| Poppler review                                                                                           | Blank, mixed, missing glyph, all six long-invoice pages and both matrix pages rendered/reviewed; no sampled overlap or clipping; expected unsupported-symbol replacement remains visible |

The final 1,000-row file is 909,587 bytes, versus 8,801,411 bytes in the failed duplicated-outline implementation. It contains 3,004 composite procedures with 411,001 encoded wrapper bytes; all 3,000 expected row mappings are present. A measurement made during the full test run took 6.95 seconds, with sampled Node RSS 238,718,976 bytes after generation and 244,248,576 after inspection. These are desktop Node samples, not peak browser/mobile memory or a controlled timing comparison. The earlier cached-path probe took 3.436 seconds; do not treat either as a production performance guarantee.

Type 3 paths are unhinted. This is not pixel-identical to embedded TrueType rasterization. Partial search/copy preserves source substrings, but a composite's selection/highlight geometry can cover the full semantic run. Ordinary URLs/identifiers retain per-character geometry. These representation details do not excuse missing text in the declared reader gates. Universal PDF-reader compatibility and physical mobile/print behavior are not proven.

Receipts: `invoice-composite-reader-{6.10.0,6.21.4}-20261104.json`, `invoice-composite-stress-1000-20261104.json`, `invoice-composite-stress-pdfjs-20261104.json`, `invoice-composite-stress-reader-{6.10.0,6.21.4}-20261104.json`. Historical failed receipts are preserved separately.

## Integration and release boundary

Fresh `pnpm ci:quick`: PASS, 261 files / 1,961 tests, exit 0. An earlier attempt had one unrelated Search Console import timeout at 5 seconds; its focused rerun and the subsequent full suite passed without changing timeouts or weakening tests. `pnpm ci:contracts`, `pnpm build`, and canonical standalone `pnpm smoke:local` (11 routes, Windows `SMOKE_HOST=127.0.0.1`, `SMOKE_PORT=3187`) all PASS, exit 0. The Windows environment assignment runs the same canonical smoke tooling as `predeploy:smoke`; `next start` was not used.

Actual IAB download from that built standalone server succeeded: `invoice-built-composite-download-20261104.pdf`, 167,199 bytes, one page, SHA-256 `b7bed967b9cb4459617015874a0192ef24766967dd18cc2b5094723c23e82c88`. `INV-0001`, `React 19`, `(React 19)`, `PersianToolbox.ir` and the exact Persian 160,000 amount all PASS in PDF.js, PDFium and pypdf 6.10.0/6.21.4 plain/layout. The downloaded file was rendered and visually reviewed against the 160,000-toman preview. An external PDF.js diagnostic script initially had a filename-substitution error; it was corrected and rerun successfully, without changing product code or assertions. No captured browser error entries were observed in the download check.

Independent final source and evidence review: PASS after fixing the two measured resource regressions and clarifying the plan. The 1,000-row check is reproducible in retained external synthetic scripts but is not a committed CI regression; existing CI covers the shared 4,096-entry boundary, 255-code rollover, real-font extraction and vector resource structure. Keep this future regression-coverage boundary explicit. Fresh production dependency audit found zero vulnerabilities at every severity; secret/licensing/ignored-file gates passed. Final signed commit, push and exact-head hosted checks are tracked in PR #245; older green checks do not prove the new candidate.

Production was read-only verified on `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129`, health `ok`, ready `true`. This local candidate is not deployed. Merge and deployment still require explicit owner authorization.
