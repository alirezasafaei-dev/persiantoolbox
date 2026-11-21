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

| Tool             | Status  | Main gap                                                                              |
| ---------------- | ------- | ------------------------------------------------------------------------------------- |
| Merge PDF        | FAIL    | Document-level form preservation                                                      |
| Split PDF        | FAIL    | Structural contract and number of resulting files                                     |
| Compress PDF     | FAIL    | Document structure and public quality claims                                          |
| PDF to Image     | FAIL    | Individual downloads after ZIP creation                                               |
| Image to PDF     | FAIL    | Preview lifecycle                                                                     |
| Decrypt PDF      | NOT_RUN | Full acceptance matrix beyond the tested password, text, form and page-geometry cases |
| Encrypt PDF      | FAIL    | Modern encryption and reader compatibility                                            |
| Add Watermark    | FAIL    | Font loading and Persian rendering                                                    |
| Rotate Pages     | FAIL    | Relative rotation and range validation                                                |
| Reorder Pages    | FAIL    | Structural preservation and range validation                                          |
| Delete Pages     | FAIL    | Structural preservation and range validation                                          |
| Extract Pages    | FAIL    | Structural contract and range validation                                              |
| Add Page Numbers | NOT_RUN | Full acceptance matrix                                                                |
| Extract Text     | NOT_RUN | Persian text quality and full acceptance matrix                                       |
| PDF to Text      | NOT_RUN | Persian text quality and full acceptance matrix                                       |
| Word to PDF      | FAIL    | Actual Word conversion                                                                |
| PDF to Word      | FAIL    | Feature claims exceed output fidelity                                                 |

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
| `/convert/word-to-pdf`     | تبدیل Word به PDF, preserve page layout           | DOCX به PDF                | Resolve conversion capability before promising output. Link to PDF-to-Word                     | High     |
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

## G. Git and release

Branch: `codex/pdf-quality-seo-20261121`. Draft PR [#301](https://github.com/alirezasafaei-dev/persiantoolbox/pull/301). All 14 hosted checks passed for `a6830104` and `7f7ffd85`. Final candidate, required CI, and release
verification are pending.

## H. Open risks

Document structure support must be defined before promising preservation across
all editing operations. Wrong-file downloads can expose another selected document
to the person who receives the result.

## I. Verdict

Execution in progress. No release verdict yet.
