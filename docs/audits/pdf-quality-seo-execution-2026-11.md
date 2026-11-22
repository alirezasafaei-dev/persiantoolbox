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

### Compression structural contract

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
| Add Page Numbers | NOT_RUN | Full acceptance matrix                                                                                                   |
| Extract Text     | NOT_RUN | Persian text quality and full acceptance matrix                                                                          |
| PDF to Text      | NOT_RUN | Persian text quality and full acceptance matrix                                                                          |
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

The former Word-to-PDF flow opened a Word blob in a browser print window
without interpreting Word or producing PDF bytes. Mammoth omits layout
details by design, and docx-preview is constrained by HTML pagination.
The evaluated LibreOffice WASM distribution lists roughly 235 MB of
uncompressed engine and data assets and requires cross-origin isolation.
Nutrient documents browser conversion with a licensed SDK. Neither option
was integrated or measured against this project's Persian fixtures.
An in-browser DOCX engine with verified Persian text, tables, fonts and
pagination was not established. The existing URL now provides local desktop
export instructions and has no file input or converter metadata.
The Chrome extension and use-case listing identify the route as a guide.
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

Hosted checks at `1962ef7f` identified outdated assertions for the split
tool metadata and sitemap update date. Both test files passed locally
after aligning their assertions with the actual ZIP operation (7/7).

## G. Git and release

Branch: `codex/pdf-quality-seo-20261121`. Draft PR [#301](https://github.com/alirezasafaei-dev/persiantoolbox/pull/301). All 14 hosted checks passed for `a6830104` and `7f7ffd85`. Final candidate, required CI, and release
verification are pending.

## H. Open risks

Document structure support must be defined before promising preservation across
all editing operations. Wrong-file downloads can expose another selected document
to the person who receives the result.

## I. Verdict

Execution in progress. No release verdict yet.
