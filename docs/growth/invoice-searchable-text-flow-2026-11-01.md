# Searchable invoice text flow - 2026-11-01

**Historical baseline:** The [2026-11-04 composite-text verification](invoice-composite-text-2026-11-04.md) supersedes the unresolved numeric/punctuation disposition below for its declared reader cases. Preserve the failed baseline evidence; do not treat this older checkpoint as the current candidate or a deployment record.

## Disposition

The demonstrated `React 19` exact-token search regression is **PASS in the tested PDFium engine and in the owner's native Chrome test** for the new local candidate. All declared tokens in the 16-field matrix, including paired punctuation, pass PDFium. **Overall cross-reader acceptance remains FAIL/open**: Persian totals still fail plain extraction in both tested pypdf versions; the older 6.10.0 also fails some punctuation. PR #245 remains Draft. The owner's confirmation closes the reported Chrome search test; it does not accept the remaining reader failures or authorize merge/deployment.

This supersedes the failing PDFium exact-token result in the [reader checkpoint](invoice-reader-compatibility-2026-10-31.md) only for the cases measured below. The [native-print control](invoice-native-print-control-2026-11-01.md) remains a failed experiment.

## Correction

- Reflow fields with strong Persian/Latin directions onto separate physical baselines at Unicode bidi/grapheme boundaries. Preserve logical source content, explicit paragraphs, paired punctuation and right alignment. Numeric-only Persian fields remain compact. Mixed descriptions are taller: the 45-row stress fixture is six pages rather than the previous four.
- Shape isolated Latin lines with an LTR base. Preserve existing fonts, CID/ToUnicode mappings, horizontal `TJ` positioning and individually positioned combining marks.
- Keep text directly in page streams. A standard Form XObject variant fixed pypdf plain punctuation, but its experimental layout extraction then returned no text. That variant was rejected and removed. Pixel-identical appearance alone did not prove compatibility.
- Reserve the measured totals/payment block together when it fits the 717pt usable body. Larger blocks begin on a fresh page and continue using the existing line guard. The long fixture no longer leaves only its final payment line on a page.
- Reject excess input before serialization rather than truncating or downloading a partial invoice: 10,000 UTF-16 units per field, 64 directional runs per paragraph, 200 rendered lines per field, 1,000 items and 100 pages. The usual Persian toast explains how to shorten or split the invoice; retry remains possible.

No new dependency, server processing, endpoint, print workflow or network setting is introduced. PDF libraries remain deferred until export; arithmetic and existing access/export behavior are preserved.

## Evidence

Fixtures use synthetic data and the actual candidate writer. Receipt: `invoice-reflow-reader-final-20261101.json`; PDFium 156.0.8076.0 through pypdfium2 5.14.0, and pypdf 6.10.0.

| Fixture                      | Pages | Measured result                                                                                                                 |
| ---------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------- |
| Mixed text control           |     2 | All 16 declared field tokens pass PDFium; pypdf plain paired-punctuation failures remain                                        |
| Actual 16-row invoice matrix |     2 | PDFium tokens cover client identifier, versions, URL, email, SKU, percentages, nested brackets, five quote pairs and apostrophe |
| Blank quantity               |     1 | Invoice ID/footer searchable; zero quantity/total retained                                                                      |
| Mixed invoice                |     1 | PDFium finds `React 19`, `(React 19)`, ID/footer; payable total 270,000 retained                                                |
| Missing glyph                |     1 | Visible replacement and original-symbol warning retained; ID/footer pass                                                        |
| 45-row invoice               |     6 | Rows/bounds/headings and 7,255,000 payable total retained; summary/payment grouped; footer searchable                           |

All invoice and matrix pages were rendered and visually inspected. No invisible text, bitmap replacement, private reader inverse or hidden directional substitution is used. Final flat-stream hashes are in the receipt. Earlier Form variant artifacts and receipt are preserved with the `-form-experiment` suffix and are not final-candidate evidence.

## Remaining failures and verification gaps

- Default pypdf plain extraction reverses Persian `۱۶۰٬۰۰۰` to `۰۰۰٬۰۶۱` in both the saved old built PDF and the Form-variant download. PDFium/PDF.js retain the correct amount. The installed extractor and [pypdf 6.10.0 source](https://github.com/py-pdf/pypdf/blob/6.10.0/pypdf/_text_extraction/__init__.py) classify the broad U+0590–U+08FF range as RTL, including Persian digits. No inverse mapping or ASCII substitution was added to target that behavior.
- The final flat-stream candidate loses leading paired Latin punctuation in **pypdf 6.10.0** plain extraction after Persian text. The failed assertions are retained in the historical receipt. The newer reader comparison below fixes this punctuation symptom, but does not fix all totals. No remaining failure is accepted as non-blocking on the owner's behalf.
- Final flat-stream comparison is recorded in `invoice-flat-layout-comparison-20261101.json`: `invoice-candidate-mixed-reflow-20261101.pdf` retains `React 19`, ID and URL in pypdf plain mode, but paired punctuation and the three Persian amounts 150,000 / 100,000 / 270,000 still fail there, as in the old fixture. Its layout mode has 9,590 characters instead of an empty result; paired punctuation and all seven declared text/amount samples pass. PDFium finds all seven; PDF.js independently retains the phrase, punctuation, metadata and payable amount. The rejected Form variant's text-loss regression is removed.
- **Owner-operated native Chrome search: PASS, 2026-11-01.** The supplied screenshot shows `invoice-built-flat-download-20261101.pdf`, page 1/1 at 100%, the query `React 19`, result `1/1`, and the highlighted phrase in the mixed Persian description. The visible invoice ID is `INV-0001` and payable total is 160,000 toman. The retained PDF's SHA-256 was rechecked as `0f36f557a64fde7848d0260a9f58a30f1fe2435b20c78e38a8e6527ed0c301fa`. This is screenshot-observed manual search evidence, not agent-operated Chrome or proof of clipboard behavior/all reader cases. The screenshot itself is not committed because it includes the owner's browser surroundings.
- Earlier Chrome download-event and removed Form-variant attempts remain historical evidence only; the final download below and owner screenshot identify the final flat-stream candidate.
- A subsequent **final flat-stream standalone download** succeeded through IAB, with no captured page errors. `invoice-built-flat-download-20261101.pdf` is one page / 153,958 bytes, SHA-256 `0f36f557a64fde7848d0260a9f58a30f1fe2435b20c78e38a8e6527ed0c301fa`. PDFium, PDF.js and pypdf layout all find the five samples: `INV-0001`, `React 19`, `(React 19)`, `PersianToolbox.ir`, `۱۶۰٬۰۰۰`. pypdf plain retains only the three unpaired Latin samples; its punctuation/amount failures remain. The PDF was rendered and visually checked against the 160,000-toman preview. Receipts: `invoice-built-flat-receipt-20261101.json` and `invoice-built-flat-pdfjs-receipt-20261101.json`.
- A proxied live version/health check failed TLS; a normal direct read-only request then returned production `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129`, health ok/ready true. No VPN, proxy or server configuration was changed.

These results do not prove universal PDF compatibility, exact whole mixed-field clipboard order across columns/line breaks, every reader's ZWNJ/diacritic behavior, or Google ranking improvement. Production is separate from this local/PR candidate.

The remaining pypdf failure is independently reproduced on the owner-saved native Chrome print control: its producer is `Skia/PDF m156`, yet plain pypdf also reverses the Persian 160,000 amount there. This rules out attributing that symptom solely to the product writer. pypdf is an external diagnostic reader in this investigation, not a dependency in `package.json` or `pnpm-lock.yaml`. No reader-specific workaround or acceptance exception is introduced.

## Current official diagnostic reader comparison

The [official PyPI release](https://pypi.org/project/pypdf/6.21.4/) was checked live: pypdf 6.21.4, released 2026-10-28, is newer than bundled 6.10.0. It was installed only into an isolated directory outside this repository, with its official `rtl-text` extras (`python-bidi` 0.6.12 / `arabic-reshaper` 3.0.1). Neither the bundled reader installation nor product dependencies were modified. The official wheel hash is `33e4fb41ca352810eb4e9838aa0d82d6888a5f8bf682f43e99cce5faa666255c`.

Receipt `invoice-pypdf-6214-20261101.json` records unchanged PDF hashes and both documented extraction modes across six fixtures. All 16 matrix field tokens now pass plain and layout extraction, including the formerly missing leading quotes/brackets. The actual built download passes four of five samples in plain mode: the Persian 160,000 total still fails; layout passes all five. The other mixed/matrix/long totals also still fail plain mode, and the independently produced Chrome-native print control has the same amount failure. Rechecking the rejected Form variant with this newer reader still produces empty layout text, so that variant remains rejected. Updating the diagnostic reader improves the punctuation result; it does not justify closing the unresolved numeric gate.

## Verification ledger

- Focused invoice checks: PASS, 5 files / 31 tests, exit 0 after Form removal. Genuine red/green regressions cover splitting, isolated punctuation, quote pairing, bounds, retry/no partial download, flat text streams and summary grouping.
- Final flat-source `pnpm ci:quick`: PASS, 261 files / 1,953 tests, exit 0. `pnpm ci:contracts` and `pnpm build`: PASS, exit 0. Canonical standalone `pnpm smoke:local` with Windows environment variables: PASS, 11 routes, exit 0. Built-browser download and reader checks are recorded above. No test, timeout or gate was weakened.
- Independent final source review: PASS with no new extraction regression. Strict production dependency audit: PASS, zero vulnerabilities at every severity, exit 0. Security/secret/license/documentation gates are checked before signing. Commit/push and exact-head hosted CI are tracked in PR #245; earlier green checks at `321174fc` do not prove this candidate. Draft/overall reader FAIL-open status remains in effect regardless of CI.
- Application candidate `24039a223eeec7c0f9727866094d7ab642ef0a25` has all 15 hosted checks SUCCESS, rechecked when recording the owner's screenshot. This follow-up changes evidence/task documents only. Application tests/build are not claimed as newly rerun for a documentation-only update; current follow-up checks and head status are recorded in PR #245.
