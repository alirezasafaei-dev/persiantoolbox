# PDF quality and search execution

## A. Baseline

On 2026-11-21, the isolated branch started at `04f9c41ec8cc84407b3bf4a0820e6f1311565968`.
The public version and health endpoints agreed on `d31c5b9c7f2e6746afbc31c56d95623d7b47bca1`,
and health reported `ok`. The application routes and dependency lock used for the previous
PDF audit were unchanged between those revisions.

The public hub and all 17 tool URLs returned HTTP 200, declared their own canonical,
had one or more H1 elements in the response, and appeared in the sitemap. The 18
titles and descriptions were distinct, all pages declared an Open Graph image, and
JSON-LD parsed on all 18 pages. The hub linked to all 17 tools in the response HTML.
These checks measure published HTML and crawl signals. They do not establish search
index coverage, ranking, field performance, or structured-data eligibility.

## B. Findings

| Item  | Baseline finding                                                                                | Current acceptance                                                                              |
| ----- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| P0-01 | Batch compression resolved the output by a substring of the file name.                          | PASS on the local candidate                                                                     |
| P0-02 | Copying pages into a fresh document can discard interactive forms and document-level structure. | FAIL                                                                                            |
| P0-03 | Wrong-password handling previously stalled and the successful path rasterized the document.     | PASS for the tested RC4 and AES-256 fixtures on the local candidate                             |
| P0-04 | Worker failures and timeouts previously left promises pending.                                  | PASS for the shared client lifecycle. User cancellation is wired on compression and decryption. |
| P1-06 | Rotate, delete, extract and watermark lacked an explicit input size check.                      | Covered by the focused input selection check. Large-document resource profiling remains open.   |

Rotate, delete, extract and watermark now reject empty files and files larger
than 50 MiB before reading their bytes. This matches the size ceiling already
used by reorder and other single-file PDF tools. Selecting another file clears
the previous selection. Rotate, delete and extract also cancel any earlier
page-count request and ignore late results. The baseline Chromium run failed
the four empty-file assertions. The boundary fixtures report a simulated file
size around the existing ceiling and use actual small PDFs for parsing.
The standalone input-selection and page-structure run passed 46 cases across
Chromium and Firefox (exit 0). It included successful edited-document downloads
and recovery by selecting a valid PDF after a size error.

Playwright WebKit 26.6 initially failed to load same-origin scripts and styles
over loopback HTTP because it upgraded those requests to HTTPS. The repeat used
a loopback TLS proxy in front of standalone and preserved the application CSP.
On `5b949e0b`, 28 cases passed, including all four input-limit cases, page
structure and password-handling cases. Two tests failed and two CLS tests
were skipped (exit 1). PDF-to-image downloaded the individual PNG, but the ZIP
link did not produce a download event. The image-to-PDF viewport assertion
expected 320 CSS pixels and WebKit reported equal client and scroll widths of
312 pixels. That assertion did not demonstrate content overflow.

WebKit diagnostics confirmed an active ZIP Blob with a valid archive and a
`page-1.png` entry. Four controlled downloads emitted the expected event.
Playwright's click traces showed that the sticky header and cookie dialog
could intercept the automated click after scrolling. The regression now
rejects optional cookies through the UI and centers each download link before
measuring the download. Its viewport check uses the configured window width
and tests content overflow against the document client width. The ZIP entry
still has to match the individually downloaded PNG byte for byte, and the PNG
must remain downloadable after the archive.

The expanded standalone WebKit run passed 47 cases and skipped the two
Chromium-only layout-shift measurements (exit 0). It covered the hub and all
17 tool URLs, real downloads from the tested operations and the Word-to-PDF
guide. It did not exercise an actual DOCX-to-PDF conversion, native Safari,
or a physical mobile device.

### Compression structural contract

The picker now limits each batch to 20 PDFs and 200 MiB in total. The 50 MiB
per-file ceiling still applies. Empty files are rejected at selection, and
users can remove an accepted file and retry a rejected one. The ceilings are
shown next to the picker and included in its accessible description.
The baseline Chromium tests failed before those rules were added. The test
for the total-size boundary simulates reported file sizes and uses small PDF
fixtures. It does not measure peak memory when processing a full batch.
The standalone compression and SEO regression passed all 24 cases across
Chromium, Firefox and WebKit (exit 0 for both runs). The 11 standalone smoke
checks passed (exit 0).

Compression rewrites the original document graph with object streams, leaving
metadata updates and appearance regeneration disabled. If the rewrite is no
smaller, the original bytes are returned. Files with detected signature fields,
signature byte ranges or catalog permissions are rejected before rewriting.

The browser fixture includes a populated form, a title, an attachment and a
rotated page. It failed before the structural change because the output lost
the form field. The fixture covers those features only. Tagged documents,
valid cryptographic signatures and PDF reader interoperability need separate
validation. Merge, split, extract, delete and reorder still require their own
preservation or disclosure contracts.

### Local decryption implementation

The existing Chromium test failed before the candidate change because a wrong
password did not produce a recoverable error. The qpdf worker uses a fresh
module Worker for each attempt. Only the file buffer and entered password go
to that Worker. The application terminates it after a result, an error,
cancellation or a 90-second processing timeout. The input limit is 50 MiB,
consistent with the existing single-file compression limit.

The pinned qpdf bundle is served from this project, with its license files and
a narrowly scoped same-origin Worker CSP. The native PDF graph is rewritten
without converting pages into images. The UI warns before editing that a
digital signature can lose validity. A rewrite with qpdf warnings is rejected.
File names and passwords are excluded from the history payload. The engine's
2.82 MB WebAssembly file loads only after the user starts a decryption.

## C. Tool acceptance

Acceptance refers to the complete requirements of this execution. The previous audit
had individual smoke results, including successful file creation on several routes.

| Tool             | Status  | Main gap                                                                                                                 |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| Merge PDF        | NOT_RUN | Both same-named form values and attachments verified. Full browser, accessibility and device acceptance remains open.    |
| Split PDF        | NOT_RUN | ZIP contains correctly ordered PDF parts with form values in both desktop browser engines. Full acceptance remains open. |
| Compress PDF     | NOT_RUN | Form, title and attachment fixture and accurate copy verified. Broader reader and resource acceptance remains open.      |
| PDF to Image     | NOT_RUN | PNG archive and individual download both verified. Full acceptance remains open.                                         |
| Image to PDF     | NOT_RUN | Two-image PDF and preview lifetime verified. Full acceptance remains open.                                               |
| Decrypt PDF      | NOT_RUN | Full acceptance matrix beyond the tested password, text, form and page-geometry cases                                    |
| Encrypt PDF      | NOT_RUN | AES-256 and PDF.js password round-trip verified in both engines. Additional PDF reader coverage remains open.            |
| Add Watermark    | NOT_RUN | Mixed Persian and Latin placement and font retry verified. Full acceptance remains open.                                 |
| Rotate Pages     | NOT_RUN | Relative rotation and shared range parsing verified. Full acceptance remains open.                                       |
| Reorder Pages    | NOT_RUN | Structural fixture passes. Full device, range and accessibility acceptance remains open.                                 |
| Delete Pages     | NOT_RUN | Retained page form and document attachment verified. Full acceptance remains open.                                       |
| Extract Pages    | NOT_RUN | Selected-page form preserved and source attachment excluded in tested fixture.                                           |
| Add Page Numbers | NOT_RUN | Visible position and orientation on cropped/rotated pages and refusal of a signature field verified in both browsers.    |
| Extract Text     | NOT_RUN | Two-language line breaks, page markers, TXT and no-text recovery verified in both browsers.                              |
| PDF to Text      | NOT_RUN | Two-language TXT without page markers and no-text recovery verified in both browsers.                                    |
| Word to PDF      | FAIL    | In-browser conversion remains unavailable. The route now offers desktop export instructions.                             |
| PDF to Word      | NOT_RUN | Editable Persian and Latin text, empty output rejection and cancellation verified. Complex layout remains out of scope.  |

## D. Search work

Begin with the inaccurate tool claims and with intent differentiation between split
and extract, and between the two PDF-to-text entry points. Follow with SSR content,
schema meaning, contextual links and legacy redirects. Search Console and field
Web Vitals are unverified. The documented local credential is unavailable in
this checkout. No organic lift is established.

Lighthouse 13.6.0 measured the live hub once for each preset. Desktop lab LCP
was 1.33 s and CLS was 0.141. SEO scored 100 and performance scored 85.
Mobile lab LCP was 1.30 s and CLS was 0.000. SEO scored 100 and performance
scored 98. These navigation traces do not measure field INP.

On 2026-11-22 a separate desktop Chromium navigation returned HTTP 200 and
observed a 0.1404 layout-shift entry at 2.2 seconds. The browser identified the
footer as the shifted element. Follow-up traces showed the shared tools loading
spinner in the initial HTML before the footer. At a 1350 px viewport the footer
started near y=808 and moved beyond y=4,200 when the hub content arrived.
Without JavaScript, the live page showed the spinner and hid the hub heading
and links even though the full HTML response contained them.

The hub now has its own route layout outside the shared loading boundary. It
uses the same tools shell and renders the category list directly. Subtool routes
retain their existing loading behavior. The social image generator still finds
the hub route in the app root. The standalone regression checks the heading,
tool link, canonical, structured data and CSP nonce with JavaScript disabled.

Lighthouse 13.6.0 on the local standalone candidate recorded CLS 0.000 on
both presets (one navigation per preset). Desktop lab LCP was 0.33 s with a
performance score of 100. Mobile lab LCP was 1.08 s with a score of 99. Both
SEO scores were 100. Loopback and public network timings are different
environments and cannot establish an LCP improvement on production. A separate
Chromium navigation requested no PDF worker, WASM or OCR engine assets and
the generated hub social image returned HTTP 200 as PNG.

The live sitemap audit retry scanned 30 of 480 URLs with concurrency 2 and a
45-second request timeout. It passed (exit 0).

The compression page and linked guide now describe one lossless structural
rewrite, the 50 MiB per-file limit and fallback to the original bytes. The
unsupported percentage and quality levels were removed from metadata, visible
guidance and HowTo markup. The canonical path and article slug were retained.
The pre-change SSR check failed. The updated standalone check passed in Chromium
and Firefox, alongside an 18-route regression for status, headings, canonicals,
robots directives, sitemap membership, distinct metadata, Open Graph images,
JSON-LD syntax and hub links (4/4 total). No post-release search metrics exist.

### PDF search intent map

The priorities come from product defects and crawl evidence. Query terms here
describe intent and do not estimate search volume. Paths below are relative to
the PDF hub unless shown otherwise.

| Landing path               | Primary query and purpose                         | Secondary intent           | Content gap and contextual destination                                                         | Priority |
| -------------------------- | ------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------- | -------- |
| `/pdf-tools`               | ابزار PDF فارسی, discover the right operation     | ابزار ویرایش PDF           | Consolidate repeated guidance and link directly to all tools                                   | High     |
| `/merge/merge-pdf`         | ادغام PDF, combine documents in order             | یکی کردن چند PDF           | Explain page order and interactive features. Link to reorder                                   | High     |
| `/split/split-pdf`         | تقسیم PDF, create separate smaller files          | چند بخش کردن PDF           | Align the promised output count with the implementation. Link to extract pages                 | High     |
| `/compress/compress-pdf`   | کاهش حجم PDF, fit a size limit                    | فشرده‌سازی PDF گروهی       | Explain real size changes and signed documents. Link to extract pages and the size-limit guide | High     |
| `/convert/pdf-to-image`    | تبدیل PDF به عکس, export pages as images          | PDF به PNG یا JPG          | Explain per-page versus ZIP downloads. Link to image-to-PDF and OCR                            | High     |
| `/convert/image-to-pdf`    | تبدیل عکس به PDF, assemble a printable document   | تبدیل JPG به PDF           | Show page order and dimensions. Link to PDF-to-image                                           | High     |
| `/security/decrypt-pdf`    | حذف رمز PDF, save a copy using the known password | باز کردن قفل PDF           | Explain permission, retries and signature validity. Link to encryption                         | High     |
| `/security/encrypt-pdf`    | رمزگذاری PDF, require a password to open a file   | قفل کردن PDF               | Explain the actual algorithm and password roles. Link to decryption                            | High     |
| `/watermark/add-watermark` | واترمارک PDF, mark every page                     | واترمارک متنی فارسی        | Describe supported input and positioning. Link to page numbers                                 | High     |
| `/edit/rotate-pages`       | چرخاندن صفحات PDF, fix orientation                | چرخش ۹۰ درجه PDF           | Explain relative rotation and page ranges. Link to reorder                                     | Medium   |
| `/edit/reorder-pages`      | تغییر ترتیب صفحات PDF, rearrange a document       | جابه‌جایی صفحه PDF         | Provide a complete permutation example. Link to delete pages                                   | Medium   |
| `/edit/delete-pages`       | حذف صفحات PDF, keep the remaining pages           | حذف یک صفحه PDF            | Explain how it differs from extraction. Link to extract pages                                  | Medium   |
| `/extract/extract-pages`   | استخراج صفحات PDF, build one subset               | جدا کردن صفحات انتخابی PDF | Give a range example and link to split and compress                                            | Medium   |
| `/edit/add-page-numbers`   | شماره‌گذاری صفحات PDF, stamp page numbers         | افزودن شماره صفحه PDF      | Explain supported positions and number style. Link to watermark                                | Medium   |
| `/extract/extract-text`    | استخراج متن PDF, copy selectable words            | کپی متن فایل PDF           | Distinguish selectable text from scanned pages. Link to OCR and PDF-to-text                    | High     |
| `/convert/pdf-to-text`     | تبدیل PDF به متن, download editable text          | PDF به TXT                 | Explain text order and output format. Link to text extraction and OCR                          | High     |
| `/convert/word-to-pdf`     | تبدیل Word به PDF, preserve page layout           | DOCX به PDF                | Explain local desktop export and verify links from the PDF hub                                 | High     |
| `/convert/pdf-to-word`     | تبدیل PDF به Word, produce editable text in DOCX  | PDF به DOCX                | Explain layout limits and scanned input. Link to PDF-to-text                                   | High     |

## E. Security and privacy

A Chromium test on standalone `24991667` revisited the decrypt route with
an active service worker, then reloaded after disabling the browser's
network. The worker returned the offline screen and the file picker was
absent. HTTP 200 in that test represented the offline fallback. The PDF
registry now labels the hub and all 17 tools as local processing, with copy
explaining that opening the tool or loading its assets may require a
connection. The change does not alter the service-worker cache policy.
The registry regression failed against the previous tier. After the change,
22 focused assertions and all 2,242 tests in `ci:quick` passed. The Node 20
build, contracts and 11 standalone smoke checks passed. Chromium and Firefox
also verified that the hub renders the local-processing label with JavaScript
disabled.

On the standalone candidate, a Chromium request capture tested encryption,
decryption and watermarking with a synthetic PDF and unique markers for its
filename, visible text and title, both passwords and the watermark. All three
operations downloaded a PDF. No capture contained those markers or PDF body
bytes. Decryption and watermarking each attempted one same-origin history
POST containing only `tool`, `inputSummary` and `outputSummary`. The test
used an inert session cookie and intercepted the writes locally. One run also
observed a request for the footer trust seal, with no document markers.

The frozen dependency installation succeeded. `pnpm audit --prod --audit-level=high`
and `pnpm run security:secrets` both exited 0 on the starting branch. Use generated
PDF fixtures for browser validation and keep Search Console source exports outside
the repository.

## F. Test evidence

The Chromium baseline on the live release failed with exit 1. The download for the
three-page `report.pdf` decoded to the one page from `report-final.pdf`. Two local
Webpack development runs also timed out before showing outputs. They did not reach
the content assertions.

The candidate binds each result to the row identifier and gives case-insensitively
colliding download names distinct suffixes. The regression test opens downloaded
PDFs and checks their page widths for similar and identical names. It repeats the
check after removing and adding a file. The standalone build passed the test in
Chromium and Firefox (exit 0). Focused Vitest passed 18 tests in four files (exit 0).

The 30-URL sitemap audit timed out on the homepage (exit 1). A direct repeat
returned HTTP 200 in 6.90 seconds. The separate 18-URL PDF baseline completed.

The compression structure candidate passed the build and six standalone browser cases (exit 0), covering both Chromium and Firefox. Tests confirm the rewritten fixture is smaller and retains the populated form, title, attachment and rotated page geometry. A separate fixture verifies byte-for-byte fallback when rewriting does not shrink the file.

The Windows invocation of `pnpm predeploy:smoke` exited 1 because the package
script uses POSIX environment assignment. Running the same standalone smoke
runner with `SMOKE_HOST` and `SMOKE_PORT` set through PowerShell passed all 11
route checks. `pnpm ci:contracts` exited 0. The full `pnpm ci:quick` run timed
out on one finance heading test (2,223 passed, 1 failed). The same test file
passed all three tests when run on its own. The final gate still needs a pass.

The combined standalone PDF suite passed 10/10 (exit 0). Chromium and Firefox
both rejected wrong RC4 and AES-256 passwords, accepted retries and downloaded
files with the expected title, form value, page dimensions and rotation. PDF.js
independently extracted the expected text. The Node build of PDF.js emitted
standard-font warnings without failing the text assertion.

The shared PDF Worker candidate passed `pnpm build`, 21 focused unit tests
and the 10 standalone compression and decryption cases in Chromium and
Firefox. Unit coverage includes transport failures, deserialization
messages, timeout cleanup, cancellation, permanent termination, replacement
worker recovery and out-of-order replies. Browser coverage exercises
normal downloads. A manual cancellation click has not yet been verified.

Page reordering now uses qpdf page selection with the original document as
the primary input. A real browser fixture initially lost the form field in the
pdf-lib page-copy path. The updated output preserves the field and its value,
the title, attachment and page rotation while reversing page order. The
standalone reorder and decryption runs passed 6/6 in Chromium and Firefox.

A separate local qpdf probe found distinct names and original values for two
same-named fields when merging. The same probe found that an empty primary
input drops document-level attachments. A single-source subset kept the
primary attachment but removed the omitted page's form field. Before routing
merge, extract and delete through this engine, confirm policy and output for
attachments, outlines, associated page content and metadata.

The hosted Chromium shard for `11083122` failed its two decryption cases
with `Promise.withResolvers is not a function`. The failure artifact located
the error in verification on Node 20. The decryption test now imports the
legacy PDF.js build for Node. A local text-extraction probe also passed after
removing the native `Promise.withResolvers` implementation. Standalone Chromium with Node 20.20.2 passed all three focused reorder and decryption cases (exit 0).

The merge candidate uses the first input as the primary document. It retains
both source form values even when field names collide. It copies later
attachments with numeric prefixes so the tested same-named attachments both
survive. The user sees a warning about later inputs' bookmarks and accessibility
structure, and about digital signatures, before processing. The previous browser
fixture lost the document title. The updated build passed all eight merge,
reorder and decryption cases on Chromium and Firefox (exit 0).

Standalone subsetting probes found no removed fixture page text in decoded
output streams. Taking the source as primary retained its attachment and the
selected page's form. Taking an empty document as primary dropped the attachment.
These small fixtures do not establish that subsetting can be used as redaction.

Delete and extract now preserve the retained page's populated interactive form.
Delete retains document attachments and warns that bookmarks to deleted pages
can stop working. Extract builds a new document with the chosen pages and
their forms. It omits source document-level attachments and metadata. Both
browser fixtures failed before the change because their retained form vanished.
After the change the production build and all eight page-structure cases passed
in Chromium and Firefox (exit 0). The selected outputs excluded the synthetic
discarded page text in decoded Flate PDF streams. This is a fixture assertion
and does not verify secure removal of every possible reference.

Split now produces consecutive PDF parts in a ZIP. Users enter the number of
pages in each part, including with Persian digits. Choosing nonconsecutive pages
belongs to Extract. Each PDF part retains its tested form values, while source
document attachments are omitted. The product copy and metadata describe
this distinction. Inputs are limited to 50 MiB, 2–100 output parts and 100 MiB
of returned PDF parts. The prior browser baseline failed to produce the ZIP.
A five-page test reads all three PDF parts from the archive and checks their
order and form content. The split, page structure and SEO suite passed all
14 desktop Chromium and Firefox cases.

The second full local `pnpm ci:quick` run exited 0 and passed all 2,230 tests
in 289 files at the page-selection checkpoint. `pnpm predeploy:smoke` ran
successfully via Git Bash and passed all 11 routes at the merge checkpoint.

Page rotation now adds the requested angle to the inherited or existing
page rotation. Before the fix, a 270° page rotated by 90° downloaded at 90°.
The corrected browser fixture downloads that page at 0° and leaves the
unselected 180° page unchanged. Shared selection parsing supports Persian
and Arabic digits and comma separators, validates decimal page numbers as
integers and rejects malformed expressions. Set-based selection sorts
deduplicated pages, while the reorder tool retains the requested order and
validates the permutation separately. The production build, 12 browser
structure cases and 28 focused unit tests passed.

PDF-to-image now owns individual image URLs and the ZIP URL independently.
ZIP entry names and individual download extensions reflect the format that
was rendered. PDF.js resources are destroyed after counting or rendering.
Image-to-PDF keeps selected previews across generation and releases their
URLs on removal, reset or unmount. Both regressions failed on baseline
Chromium. The updated build and all four download and preview cases passed
in Chromium and Firefox (exit 0).

Watermark now uses the bundled Vazirmatn font and browser text shaping for
Persian and Latin runs. Only the mark is rasterized and it is added as a
transparent image over the original PDF. A failed font load can be retried.
The marked PDF retains the original crop box and page rotation. Chromium
and Firefox both passed the font-failure/retry and downloaded-PDF assertions,
including 25° visual rotation, top-right placement inside the crop box,
and 20% opacity. Watermark text is excluded from history. The tool copy
describes the supported text input.

Encryption now uses QPDF AES-256 in the same-origin worker. The UI accepts an
optional owner password and generates a random owner password when omitted.
Chromium and Firefox downloaded a PDF with encryption version 5 and revision 6.
PDF.js rejected a wrong password and read the original page text with the right
password. The original RC4 output failed the version assertion. In the first
AES run, a test string extended beyond the synthetic page. The corrected fixture
passed in both browsers (2/2). The production build and the 18 structure,
watermark, and decryption cases also passed.

An isolated Chromium probe tested [LibreOffice Converter
2.7.2](https://github.com/matbeedotcom/libreoffice-document-converter) with
a synthetic Persian and Latin DOCX. The registry archive matched its SHA-512
integrity value. Loopback served about 247 MB of engine data and WASM without
third-party requests. With cross-origin isolation and a CSP allowing
`wasm-unsafe-eval`, the engine attempted string evaluation, which CSP blocked.
Initialization timed out (exit 1) and produced no PDF. This identifies a
compatibility issue in this build. Conversion fidelity remains untested.

[LibreOffice WASM v0.2.0](https://github.com/eze-paz/libreoffice-wasm/tree/v0.2.0)
uses cooperative threads in same-origin iframes. Its release passed the
published SHA-256 checks. The four gzip engine assets total 80.4 MB.
Chromium, Firefox and WebKit all exposed the required WebAssembly JSPI
functions in the installed Playwright engines. A separate Chromium probe
served the package from loopback, applied a nonce to its inline bootstrap and
allowed WebAssembly compilation. The browser reported an `eval` CSP violation
when the converter loaded its cooperative worker. The probe ended without
a PDF (exit 1) and recorded no off-origin requests. The project's
`frame-ancestors 'none'` and `X-Frame-Options: DENY` also prevent embedding
the engine as packaged.

A candidate architecture would lazy-load a same-origin, versioned DOCX/PDF
engine into a dedicated Worker with a bounded job and cancel-by-termination.
Its glue must load under the existing worker policy without evaluating
JavaScript strings. Emscripten's [DYNAMIC_EXECUTION
setting](https://emscripten.org/docs/tools_reference/settings_reference.html#dynamic-execution)
shows a build option to investigate. It also disables some runtime functions,
so it does not establish that LibreOffice can be rebuilt and run this way.
Before adding such an engine, verify its source and redistribution notices,
Persian RTL shaping and font substitution, tables, images, headers and page
breaks against desktop reference PDFs. Measure cold asset transfer and peak
memory on mobile, and verify cancellation, malformed-file recovery and no
document upload in the packaged route.

The former Word-to-PDF flow opened a Word blob in a browser print window
without interpreting Word or producing PDF bytes. Mammoth omits layout
details by design, and docx-preview is constrained by HTML pagination.
The evaluated LibreOffice WASM distribution lists roughly 235 MB of
uncompressed engine and data assets and requires cross-origin isolation.
Nutrient documents browser conversion with a licensed SDK. No candidate
produced a PDF suitable for comparison against a Persian reference fixture.
An in-browser DOCX engine with verified Persian text, tables, fonts and
pagination was not established. The existing URL now provides local desktop
export instructions and has no file input or converter metadata.
The Chrome extension and use-case listing identify the route as a guide.
The current standalone guide passed in Chromium, Firefox and WebKit
(exit 0 on both test invocations). A separate public HTTP check on
`d31c5b9c` still found a file input on that route. The guide is verified in
the candidate only.
The new browser contract failed against the former converter in Chromium.
The new standalone build passed all eight guide, AES-256 and PDF SEO
assertions in Chromium and Firefox. Thirteen focused SEO and registry unit
assertions passed. The production version endpoint still reported
`d31c5b9c7f2e6746afbc31c56d95623d7b47bca1` and health reported `ok`.
References: [Mammoth](https://github.com/mwilliamson/mammoth.js),
[docx-preview](https://github.com/VolodymyrBaydalka/docxjs),
[LibreOffice WASM distribution](https://erseco.github.io/libreoffice-document-converter/),
[Nutrient Web SDK](https://www.nutrient.io/api/web/index.html),
[Microsoft Word](https://support.microsoft.com/en-us/office/collab-files/save-or-convert-to-pdf-or-xps-in-office-desktop-apps)
and [LibreOffice Writer](https://help.libreoffice.org/latest/en-US/text/shared/01/ref_pdf_export_general.html?DbPAR=WRITER).

PDF-to-Word now exports selectable text with paragraph and run direction.
It rejects documents whose pages have no text, includes a direct download
link, and reports completed pages. Cancellation discards a late Worker
response. The document size, page count, number of text runs and total text
length are bounded before the DOCX packer serializes the document tree.
The original Chromium candidate omitted the RTL paragraph property and
offered a DOCX for a multi-page document without text. After the fixes,
both browser engines passed the six DOCX cases. The full focused run,
including the Word guide and PDF search checks, passed 12/12 (exit 0).
The UI and metadata describe text-only output. Tables, images, pagination
and exact source layout are outside the converter's output contract.

An independent desktop check opened the downloaded DOCX in Microsoft Word and
confirmed editable Persian and English paragraphs and RTL reading order for the
Persian paragraph. Poppler rejected an incorrect password on a downloaded PDF,
identified AES-256 with the correct password and rendered the original page.
Both rendered samples were visually inspected.

PDF-to-image now validates file size, selected page count, canvas dimensions,
decoded pixels, and output bytes. Canvas allocation is capped at eight million
pixels per page, with a 24-million-pixel batch budget for decoded previews.
Rendering runs page by page and reports completed pages. Canceling releases the
PDF.js job and suppresses partial downloads. The oversized-canvas fixture failed
before the change. Chromium and Firefox both rejected the oversized page and
rendered the valid page on retry. All 19 page-selection unit tests passed.

Three PDF guides now distinguish a ZIP split from a selected-page extraction,
describe the actual lossless compression and text-only DOCX outputs, and link
to the relevant tools. Both browser engines verified their original URLs and
rendered links. The public sitemap sample passed 60 of 480 URLs (exit 0).

The broader browser run found that a late page-count response could reset
the selected reorder sequence. The tool now cancels the previous selection
and checks that a response belongs to the current selection before it enables
the order field. A competing-read test verifies page order in the download.
It also invalidates the old download when the input order changes.

Rotate, delete, extract and split initially kept the previous download after a
page selection changed. The Chromium baseline reproduced this on all four
routes. The updated tools clear the prior result when the page selection or
rotation angle changes, or when the user clears the file. Page parameters
stay fixed during processing. The regression observes revocation of each
previous Blob URL and parses the new PDF or ZIP to check the updated page
selection.
The standalone Chromium and Firefox run passed all 46 output and
page-structure cases (exit 0). The initial WebKit run did not show the
second extract result within the assertion timeout. Three isolated repeats
and a subsequent four-case WebKit run passed (exit 0 on both). The cause of
the initial WebKit timeout remains unverified. `pnpm ci:quick` passed 2,241
tests. The build, contracts and 11 standalone smoke checks also passed.

A 320 px dark-mode Chromium pass covered the PDF hub and all 17 catalog
routes. Image-to-PDF was the only route with horizontal overflow in that
baseline. Its actions now wrap and long names can break across lines. The
reorder and image tests passed 8/8 on the local development server across
Chromium and Firefox, including downloaded page order and the 320 px viewport
before and after image selection. An older PNG fixture had invalid chunks
and was replaced with a valid image for preview tests.

The two text tools returned both languages from a synthetic PDF but joined
distinct lines with spaces. For a two-page PDF without selectable text, Extract
Text displayed only page markers and PDF-to-Text displayed no result or
recovery. The old download also used the unchanged PDF filename when the input
extension was uppercase. The new shared browser flow reads PDF.js text
incrementally, retains line boundaries and source page order, and rejects
documents with no selectable text. It writes page markers for Extract Text and
plain paragraphs for PDF-to-Text. Chromium and Firefox passed the eight
download and recovery tests on the local development server. The targeted
Chromium baseline failed all four. The earlier reorder and mobile checkpoint
passed `pnpm ci:quick` (2,241 tests in 289 files, exit 0).

A broader Playwright run on Windows finished with 533 passes, 29 failures and
26 skips (exit 1). Failures included missing Windows image references and
Firefox homepage, OCR, PWA, and account cases. That run used the earlier
standalone candidate. A concurrent build attempt also encountered an active
standalone image-cache directory and exited 1. The subsequent build was
started after Playwright exited.

After the runner exited, the application built successfully and the canonical
standalone smoke passed all 11 route checks. The Windows package command
`pnpm predeploy:smoke` exited 1 on its POSIX environment assignments, so the
same runner was invoked through `pnpm smoke:local` with the environment set
in PowerShell. All 58 focused Chromium and Firefox cases passed on that build.
GitHub's deployment-safety lint exhausted its 2 GiB Node heap at `4e5f8123`.
The workflow now uses the core CI lint limit of 4 GiB. The same full ESLint
invocation produced a local Node 20 report with zero errors across 1,332 files.

Page numbering now places selectable page labels in the visible crop,
keeps the original rotation and title, and rejects documents with detected
signature markers. The old Chromium output lost the test page's label from
the visible text layer. The standalone download-link and signature-field
cases passed 4/4 across Chromium and Firefox. A separate Firefox run did
not emit the automatic download event. The explicit link yielded the
expected PDF in both tested browsers.

Hosted checks at `1962ef7f` identified outdated assertions for the split
tool metadata and sitemap update date. Both test files passed locally
after aligning their assertions with the actual ZIP operation (7/7).

The standalone hub regression initially failed because the heading was
hidden with JavaScript disabled. A direct import and a separate metadata
boundary did not resolve the shared loading fallback in standalone builds.
After moving the hub out of that boundary, the updated regression passed
in Chromium and Firefox. The combined browser run passed 22 cases (exit 0)
with two Firefox layout-shift measurements skipped because the browser lacks
the performance entry. The Chromium delayed-font checks recorded total
layout shifts of 0.0073 at 390 px and 0.0154 at 1350 px. `pnpm ci:quick`
passed 2,241 tests. `pnpm ci:contracts`, `pnpm build` and
`pnpm predeploy:smoke` exited 0. Standalone smoke passed all 11 checks.

## G. Git and release

All 16 GitHub checks passed for `24991667`, including Chromium shard 3,
Lighthouse CI, and release readiness artifacts. The public version and
health endpoints still reported `d31c5b9c` and HTTP 200. A separate sitemap
audit passed its 60-URL public sample (exit 0).

On `8da25f4e`, the local Node 20 standalone run of Chromium shard 3 passed
all 89 tests (exit 0). The hosted shard failed. Its artifact showed navigation
timeouts waiting for load or network idle, including traces with an unfinished
request to the external trust seal. The hosted delayed-font checks also
exceeded the layout-shift budget at 390 and 1350 pixels. The test update waits
for DOM readiness and verifies the required application state independently.
It retains the layout-shift threshold and reports the source elements on
failure. The four modified specs passed all 16 local Node 20 Chromium cases.
On `bd7ad95b`, the hosted shard no longer reported PDF navigation timeouts.
Its font-delay tests still failed. The desktop trace attributed a 0.225–0.244
shift around 1.6 s to the tool grid and its cards. The 390 px trace attributed
a 0.137 shift at the same point to the consent banner and the hub intro.
These shifts coincided with the delayed font arrival. The follow-up uses
the same font files with an optional display policy scoped to the hub,
including its shell and consent banner. This lets the fallback font stay
in use for that visit if Vazirmatn arrives late. The budget remains 0.1.
The Node 20 standalone build and contracts passed. The focused browser run
passed 10 cases with two Firefox measurement cases skipped. Chromium
reported zero shift at both widths with the delayed fonts.

A local Chromium follow-up deliberately left the external trust image
request pending. Waiting for the page load event timed out while the main
heading was already visible. Waiting for DOM readiness completed and the
heading was visible under the same conditions. This reproduces the navigation
wait failure independently of the hosted layout-shift failure.

The same standalone candidate passed a 320 px Chromium dark-mode check on
the hub and 17 routes. All 16 file inputs were reachable with Tab. Axe
reported no serious or critical violations in the main content over 36 scans
at 390 px across light and dark modes. These checks cover the initial route
state and keyboard access to the picker.

The GSC Wizard connector returned `INVALID_ARGUMENT` for property listing,
filtered search analytics, saved inspections and CrUX. The public PageSpeed
API returned HTTP 429 for the mobile hub query. These attempts did not
establish search performance, Google index coverage or field Core Web Vitals.

Branch: `codex/pdf-quality-seo-20261121`. Draft PR [#301](https://github.com/alirezasafaei-dev/persiantoolbox/pull/301). The observed 16 hosted checks passed for `22ffcad4`.
The subsequent hub change needs its own hosted checks and release verification.

## H. Open risks

Page selection fixtures cover form values, rotations, attachments and sampled
content streams. Tagged PDFs, annotation destinations, outlines, non-AcroForm
forms and cryptographically valid signatures still require operation-specific
validation. Page extraction and deletion are not redaction workflows. The
batch wrong-file regression is covered for identical and similar names in both
browser engines.

The pdf-lib worker rejects detected signature fields, byte ranges and catalog
permissions before rotation, watermarking or compression. The numbering route
also rejects these markers. These checks conservatively reject empty signature
fields. They do not validate signatures.
The Chromium baseline offered a download for the synthetic signature field.
The new build passed 30 standalone browser cases in Chromium and Firefox,
including refusal in rotation and watermarking and preservation of the form
value and title on a rotated PDF without signature markers.

A local probe using the pinned QPDF runtime created an outline entry and an
internal link to the second of two pages. Reordering kept both destinations
attached to a retained page. Deleting the destination page left both a
bookmark and a link whose targets were outside the result's page tree.
Extracting only the first page dropped the bookmark and retained the
unresolved link. The updated delete and extract worker checks explicit page
destinations against the output page tree. It removes link annotations with
omitted targets and leaves the title and children of an affected bookmark in
place while removing its navigation action. The QPDF update changes only the
necessary object dictionaries and uses a JSON inspection without stream data.
The Chromium baseline failed the affected delete and extract
download assertions, and a pinned-QPDF local object probe passed both repairs.
The new standalone build passed all 20 page-structure cases across Chromium
and Firefox, including retained form and attachment behavior, valid internal
and web links, and the remaining child bookmark.

The next candidate resolves local named destinations before selecting pages.
It reads the catalog's legacy dictionary and nested destination name tree.
This preserves page references and view parameters when extraction or splitting
omits the source name tree. Each output then drops links to pages outside its
page tree, including links between ZIP parts. External links are unchanged.
The Chromium baseline failed all three affected download assertions. A local
QPDF probe verified a Persian named destination in a split part and removal
of a cross-part link. It also produced 100 one-page parts from a synthetic
document without per-part repair because the source had no navigation targets.
The new standalone build passed all 20 page-structure browser cases,
including named links in the actual downloaded subset PDFs and split ZIP.
Chained actions and named references whose definitions cannot be resolved
remain outside the verified behavior.

The Chromium merge baseline also showed a same-named link from the second
PDF resolving to the first PDF's page. QPDF kept the first catalog's name
tree while copying both link annotations. The merge worker now resolves
named links in later inputs to explicit destinations in those inputs before
passing them to QPDF. PDF.js checks that both links in the downloaded file
resolve to the corresponding source's second page. The same fixture checks
both form values and attachments. The baseline assertion failed with exit 1.
After the worker change, the standalone page-structure suite passed 38 cases
in Chromium and Firefox with exit 0.

QPDF page editing now inspects the source object graph before merge, split,
extract, delete, and reorder. It refuses input containing signature fields,
byte ranges, or catalog permissions and displays a localized error. Merge
checks every input. Split, delete, and extract reuse the same graph inspection
that prepares navigation destinations. The Chromium baseline produced no
signature-specific refusal in the first four tests. A direct pinned-QPDF
probe accepted a normal input and rejected each of the three synthetic marker
types, including a byte range in an inline nested dictionary. Encryption and
decryption retain their separate rewrite warnings. Cryptographic signature
validation remains unverified.
After correcting an optional-selector type error in the new fixture, the
production build passed. All 36 focused stand-alone browser cases passed in
Chromium and Firefox, including all five QPDF refusals and the existing
encryption/decryption flows. All 29 focused worker and range unit cases and
the local-first gate also passed.

A separate local QPDF object probe used two pages with a structure tree and
parent-tree entries. Reordering kept both tag-to-page references. Deleting
one page left its reference in the tag tree. Extracting the first page
dropped the catalog's structure tree and kept the page's structure-parent
key. These results identify a tagged-document gap. The fixture does not
establish viewer behavior or PDF/UA conformance.
Splitting produced page keys without a catalog tag tree in both parts.
Merging a tagged first input with untagged pages kept the first input's tag
tree and left the appended pages untagged. Putting the tagged input second
left tagged page keys without a catalog tag tree.

The tagged-input Chromium baseline reproduced four silent-success paths.
Merge, split, extract and delete now refuse inputs with a structure tree or
a tagged declaration before rewriting. The user sees a localized explanation.
Reorder retains all page objects and proceeds. Its fixture verifies page and
parent-tree references, and PDF.js recognizes the paragraph and text on the
new first page. The checks do not establish PDF/UA conformance. Safe support
for modifying or combining tagged subsets remains open.
The standalone build passed all 38 page-structure cases across Chromium and
Firefox. The local-first gate and 29 focused worker and range unit cases passed.

### Additional standalone acceptance at `4b649b42`

The local standalone version endpoint reported
`4b649b42eb27cf82c393c8e2826a91943102f0cf`. These local probes all exited 0:

| Probe                                                            | Result                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Real compression input at a 390 px viewport                      | Chromium and Firefox downloaded and parsed the original 50,351,528-byte PDF when compression produced no smaller file. The 250 pages, last-page width and title matched. Download took 1.61 s in Chromium and 1.37 s in Firefox from file selection.                                         |
| Real merge limit and retry at a 393 px viewport                  | Both browsers rejected a 53,494,513-byte PDF, then merged a 50,351,472-byte input with a one-page PDF. The output had 251 pages in the expected order and the source attachment matched by SHA-256 after decompression. Selection to download took 1.02 s in Chromium and 1.19 s in Firefox. |
| Browser request observation during the two large-file operations | Zero non-read requests during compression in either browser and zero POST requests during the merge probe in either browser. The observations cover these synthetic sessions.                                                                                                                |
| Initial mobile accessibility and layout                          | Chromium with Pixel 7 emulation checked 19 sitemap paths: the hub, 17 tools and the PDF uses guide. All 38 light/dark checks returned HTTP 200, displayed the requested theme and RTL, had no horizontal document overflow and had no serious or critical axe violations in `main`.          |
| Public version and health                                        | Production still reported `d31c5b9c7f2e6746afbc31c56d95623d7b47bca1` and HTTP 200 on the health endpoint.                                                                                                                                                                                    |

The timings are single local observations. The per-tool interactive accessibility,
physical-device, peak memory, large-file and failure-recovery matrices remain
open. Field Core Web Vitals, Search Console outcomes and production acceptance
also remain open.

### Keyboard access

On `a6f7d52b`, Tab reached each of the 16 file pickers and Enter or Space
opened it in Chromium and Firefox. Five Chromium pickers needed Space.
The desktop export guide exposed no file picker. The Chromium focus-indicator
baseline failed with exit 1 because the transparent PDF-to-image input had
keyboard focus while its visible drop zone had no outline. All eight PDF
drop zones now display the theme's focus outline while their file input has
keyboard focus. The browser regression checks the PDF-to-image control in
both light and dark mode. After a fresh Node 20 build, the standalone
conversion and hub suites passed 14 cases and skipped the two Firefox CLS
cases that require Chromium (exit 0). The earlier `a6f7d52b` candidate
passed all 16 hosted checks, including Lighthouse CI and all Chromium shards.

The first combined run of the 14 PDF browser specs on `288f1a0e` passed
111 cases, skipped the two Chromium-only CLS checks in Firefox and failed
one Firefox text-extraction case (exit 1). The repeat trace showed the
cookie dialog intercepting the extraction click and the TXT link never
appearing. The test now dismisses optional consent through the visible
controls and waits for the TXT link before measuring download. It still
reads the actual file and checks its filename and bilingual page content.
All 24 repeated text cases passed in Chromium and Firefox (exit 0).
The browser matrix also confirmed the two-pixel focus indicator in all
32 combinations of eight drop zones, two browsers and two themes.
At `288f1a0e`, the Node 20 build, 11 standalone smoke checks,
`ci:quick` (2,242 tests), `ci:contracts` and all 16 hosted checks passed.

The same standalone SHA accepted four synthetic PDFs totaling 201,391,292
bytes and rejected a further 9,440,881 bytes at a 390 px viewport.
Chromium made all four downloads available in 0.89 s. The files parsed and
had the expected page widths of 400, 401, 402 and 403. The sum of the
Chromium processes' working sets was 366 MiB before selection and at most
757 MiB across three samples through processing completion. This single
Windows run gives a coarse estimate. Physical-device memory limits remain
unverified.

### Input rejection and recovery

On standalone `16a05a23`, all 42 selection and recovery cases passed across
Chromium and Firefox for split, reorder, rotate, delete, extract, page numbers
and PDF to image. These checks used separate empty PDF, malformed PDF and
plain-text selections. Each showed an error without offering a download and
then accepted a valid two-page PDF.

A second standalone probe exercised wrong format, empty content, malformed
content and a real replacement download on decrypt, watermark, text extraction,
PDF to Text, PDF to Word and Image to PDF in both browsers. All 48 checks passed.
The compression and merge probes found two defects. Compression returned the
original PDF when it contained no pages, and merge added a zero-byte PDF to its
selection. Both Chromium regression tests reproduced the defects (exit 1).
Compression now checks the parsed page count before rewriting or returning the
input. Merge rejects zero-byte files before adding them to the list.
The first post-fix run passed 52 cases. Two assertions looked for a bare
filename in the merge list, which renders the filename with its size. After
correcting the selector, all 54 compression, page-structure and encryption
cases passed in Chromium and Firefox (exit 0). The encryption regression
rejected a malformed input, used the visible retry action and verified the
replacement AES-256 download with PDF.js. The Node 20 production build and
all 11 standalone smoke checks passed.

### XFA form handling

A synthetic hybrid form carried an AcroForm field and an XFA XML stream.
The pinned QPDF engine exited 0 for all six probes. Both split parts, the
extracted subset and a merge where the XFA document was the second input
lost the XFA entry. The merge with XFA as the first input, delete and reorder
retained the entry. Form behavior after changing the page set remains
unverified.

All four Chromium baseline checks failed to find any XFA-specific refusal
(exit 1). Merge, split, extract and delete now detect the XFA entry during
document inspection and stop with a Persian error before producing output.
The fixture verifies structural detection. XFA viewer interoperability
remains unverified. The standalone page-structure suite passed all 48 cases
in Chromium and Firefox (exit 0). This includes the eight XFA checks and
the existing supported form, attachment and link assertions. The local-first
gate and TypeScript check passed. The preceding `4e6e0503` revision passed
116 combined PDF browser cases with two Firefox CLS skips and all 16
hosted checks.

### Initial page destination after deleting pages

The Chromium baseline downloaded a one-page PDF that retained an open action
pointing by name to the removed second page. The output catalog assertion
failed (exit 1). The destination repair now includes the catalog's initial
local page destination, resolves its name before selection and removes the
open action when its target page was discarded.

Four standalone QPDF probes passed (exit 0). Named and explicit targets
still resolved to a retained page, an explicit target to a discarded page
was removed, and a URI action was preserved.
All 48 standalone page-structure browser tests passed in Chromium and
Firefox (exit 0), including the downloaded one-page regression.

### Named destination tables after deleting pages

The Chromium baseline also retained a catalog destination pointing to a
removed page (exit 1). Cleanup now prunes the legacy destination dictionary
and the destination name tree, including documents whose only page
references appear in those tables. Other name trees, including embedded
files, retain their entries.

All 48 structure cases passed in the first standalone run. Four focused
Chromium and Firefox cases also passed with the expanded fixture. PDF.js
resolved both retained ASCII and Persian destinations to the remaining
page and returned no destination for the removed key. Its lookup logged a
position warning for the Persian key and resolved it through its fallback.
A direct QPDF check passed with catalog destinations only and confirmed
that the embedded-file entry remained present.

## I. Verdict

Execution in progress. No release verdict yet.
