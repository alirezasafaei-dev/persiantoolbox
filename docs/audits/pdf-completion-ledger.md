# PersianToolbox PDF completion ledger

## Checkpoint

- Branch `codex/pdf-quality-seo-20261121`, [draft PR #301](https://github.com/alirezasafaei-dev/persiantoolbox/pull/301).
- Starting application SHA `cb3b633ee46fa59566459b95e162898eb0ba508c`. At intake GitHub showed 14 successful checks and one in progress. The PR advertised no review decision.
- Production version API reported `d31c5b9c7f2e6746afbc31c56d95623d7b47bca1`. Owner hold applies to merge, deployment and shared infrastructure changes.
- Prior evidence and the 17-tool inventory are in the [execution report](pdf-quality-seo-execution-2026-11.md). A scoped PASS applies to its tested SHA and fixture.

## Work queue

| Item                                | Priority | Status      | Dependencies                                             | Acceptance and latest SHA or evidence                                                                                                 | Next action                                                                                                               |
| ----------------------------------- | -------- | ----------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Local DOCX to PDF                   | P0       | IN_PROGRESS | Verified OpenDoc source, package and distribution review | The opt-in application preview preserves an 84-row table across pages with the expected running headers and numbered Persian footers. | Verify supported document boundaries, device limits and release distribution before enabling the converter by default.    |
| Output structure and safe rejection | P0       | IN_PROGRESS | QPDF and PDF.js fixtures                                 | `243585f3` resolves cross-document link fallback; `77f8901f` adds signature refusal to both cryptographic transforms.                 | Complete per-operation preserve and reject evidence for remaining feature classes.                                        |
| Large-file processing               | P1       | IN_PROGRESS | Matched repeatable browser workload                      | Isolated QPDF A/B now demonstrates removal of the source clone. Earlier browser samples did not establish lower total Split peak.     | Verify browser and mobile peak under a matched ZIP workload.                                                              |
| PDF.js standard assets              | P1       | PASS        | Pinned PDF.js dependency                                 | `4a056228` passed 42 Chromium/Firefox tests, five WebKit probes and 186 copied-asset comparisons.                                     | Include PDF.js, QPDF and application assets in final standalone verification.                                             |
| Split search intent and SSR         | P1       | PASS        | Finalized Search Console data                            | `cb3b633e` passed focused Chromium/Firefox and unit checks. Same URL and canonical, visible H1 and FAQ without JavaScript.            | Measure matched post-release 28-day windows when available.                                                               |
| Other SEO/GEO opportunities         | P1       | PASS        | Direct Search Console query/page data                    | `7df615a2` addresses the remaining ten pairs on five pages. Chromium/Firefox confirmed no-JavaScript guidance.                        | Verify current hosted gates and measure matched periods once released.                                                    |
| GA4 and event semantics             | P1       | IN_PROGRESS | Read-only Analytics access and consent                   | Browser report confirmed PDF page engagement; both funnel queries returned no rows. `08ea957e` implements consent-gated Split events. | Obtain organic landing/device report and validate events after release.                                                   |
| Isolated preview and package        | P1       | IN_PROGRESS | Exact SHA standalone build, HTTPS loopback               | Standalone and loopback HTTPS work locally. GitHub Staging has a secret and port conflict; WSL Docker daemon access was denied.       | Verify final build asset inventory and HTTP delivery. Identify an authorized independent hosted environment if available. |
| Existing shared Staging workflow    | P1       | BLOCKED     | Owner-approved isolated deployment target                | Existing service uses the targeted port; a Staging configuration secret is absent.                                                    | Use a separate owner-provisioned preview or reconcile Staging separately under explicit approval.                         |
| Word guide as converter acceptance  | P0       | FAIL        | Local DOCX converter                                     | Guide produces no PDF bytes and cannot pass conversion acceptance.                                                                    | Keep open under the DOCX engine item.                                                                                     |
| Physical device coverage            | P1       | BLOCKED     | Authorized physical device                               | Prior browser emulation and WebKit cover scoped cases. No physical device was attached in the recorded run.                           | Use a provisioned device if made available. Keep emulation evidence separate.                                             |
| Final 17-tool acceptance and gates  | P0       | IN_PROGRESS | Implementation and immutable candidate                   | `05cd2406` creates the per-tool historical matrix. Hosted Home/CTA and Split navigation failures were observed at `77f8901f`.         | Run final gates and complete outstanding criterion receipts.                                                              |
| Release and rollback handoff        | P0       | IN_PROGRESS | Final SHA, reviews and gates                             | Executable sequence recorded below against the manual workflow and production policy.                                                 | Attach the exact reviewed release and verified rollback SHA after release clearance.                                      |

Use `DEFERRED` for nonblocking backlog work and `N/A` only with a
technical reason. Resume by checking the worktree, PR head, and open
evidence before running the next authorized task.

## Current cycle

- Standalone smoke now fetches nine PDF assets and compares their bytes
  with the build inputs. The local build at the starting application
  SHA passed 11 route and nine asset requests. The unit check rejects
  a successful HTML fallback and corrupted binary bytes.
- OpenDoc `106345bc` has no published package or release artifact.
  Its source build requires Rust and wasm-pack. Its own export notes
  describe partial logical RTL extraction and missing PDF bookmarks
  and links. Office WASM Viewer `14598be2` has no release artifact and
  declares AGPL-3.0-or-later. Neither has passed the Persian fixture.
- The pinned QPDF repro produced AES-256 and decrypted output from a
  synthetic PDF carrying a signature byte-range marker. Both operations
  now reject that fixture before rewriting it. Decryption first validates
  the password, then inspects the password-protected object graph.
  Standalone build and smoke passed, and Chromium passed all ten tests in
  the encryption and decryption specs. Those local runs covered the
  signature patch and the standalone assertion declaration.
- GitHub quality and build checks failed on `9fa45f4b` because the smoke
  assertion lacked a TypeScript declaration. `02137f6c` adds it, and
  local typecheck and build passed. Verify GitHub checks on the new head.
- Next structural task: compare the operation-level reject and preserve
  assertions with the 17-tool evidence matrix and target any remaining
  silent data loss.

## GA4 PDF evidence

- Read the existing GA4 property in Chrome. The Pages and screens report
  showed PDF page activity for October 29 through November 25, 2026.
  These are page views and engagement time across channels.
- The Events report returned no rows for `tool_start` or
  `tool_complete` in the same window. Repository inspection confirmed
  Split PDF had no GA4 lifecycle events. Historical completion and
  abandonment rates are unavailable.
- Split PDF now queues start after input validation, completion when the
  ZIP is ready, error on failed processing, and cancel on an explicit
  cancel. Events require the existing GA4 analytics consent and use a
  fixed tool ID and public path. Unit tests cover all four commands,
  refusal and revocation. Production collection is awaiting release.
- Organic landing pages and device-level engagement still need a valid
  report. Event counts alone do not establish user-level funnel rates.

## Search Console implementation

The ten opportunity pairs outside Split mapped to these five URLs.
Changes address the intent on the existing canonical URLs.

| Tool             | Pairs | Candidate change                                                                                   |
| ---------------- | ----: | -------------------------------------------------------------------------------------------------- |
| Rotate           |     4 | Title and description for selected-page rotation, scan example, and link to reorder                |
| Reorder          |     2 | Title and description for page order, keyboard guidance, and links to delete and extract           |
| Add Page Numbers |     2 | In-page numbering guidance for placement and ranges, with a link to watermark                      |
| Merge            |     1 | Ordered merge title and description, with links to the workflow for adjusting the result           |
| Extract Pages    |     1 | Selected-page PDF title and description, with a contextual link to the separate ZIP split workflow |

Keep the canonical identities and compare matched finalized 28-day
periods after release. No ranking or CTR outcome is established. The
single visible overlapping query between Split and Merge still does
not establish cannibalization.

The first browser run found all five new guidance sections hidden
without JavaScript in both engines. Moving the five pages and their OG
routes into the existing PDF hub layout fixed the shared loading
fallback. The Node 20 build and 16 focused Chromium/Firefox E2E cases
passed, including the five no-JavaScript checks in each engine, the
17-tool indexability check, Split recovery and downloaded ZIP order.

GitHub's run on `77f8901f` timed out during Split's navigation,
before its no-JavaScript assertions. The trace already showed the H1
in the document. The test now waits for DOM readiness and retains its
content and canonical assertions. That run also failed the home-page
popular-tools viewport assertion after the anchor updated the URL.
The home-page failure did not recur in the hosted suite on `5abb00b9`.

The predecessor `5abb00b9` passed all 16 GitHub checks. A Chromium
probe on that exact standalone SHA showed that all 19 sitemap URLs
returned HTTP 200 and the expected canonical, but that only Split,
the hub, and the uses guide exposed a visible H1 without JavaScript.
The remaining PDF routes now use the PDF layout outside the shared
loading fallback, and tool entry components render immediately.
Their processing libraries still load on demand. The Node 20 build
and 52 focused Chromium and Firefox cases passed, covering visible
headings and canonicals for all 19 routes, the five earlier guidance
checks, the existing indexability check, and a real GIF-to-PDF
download in both engines. Candidate-wide browser gates follow.

## Word to PDF checkpoint

The isolation runner now builds native Rust and WASM without changing
shared settings. The upstream source at `91775489` reproduces the footer
geometry defect in a native layout regression. The short mixed-script
line has glyph-run origins from 997,444 to 1,000,001 twips against a test
measure of 9,360 twips. In the published alpha's PDF, text matrices put
the footer at 49,925 to 50,072 points on a 595.3-point-wide page. The
Latin control stays within the page. The fielded layout was carrying
directional start alignment from its wide measurement line into the
final run origins. The application still serves the Word guide.

The [experimental source patch](fixtures/opendoc-fielded-rtl.patch) rebases
each shaped text group to its measured visual origin. The pinned source
build reproduced the published alpha's failing case. With the patch,
all seven native field-flow tests, all ten native header/footer tests,
and all three `check-opendoc-footer.mjs` PDF cases passed. Build with
Rust 1.96 using `cargo build --locked -p opendoc-viewer --release --target
wasm32-unknown-unknown --features wasm,core-fonts,pdf` and emit web glue
with `wasm-bindgen 0.2.129`, matching the lockfile. The local generated
WASM SHA-256 was
`2eb727b31b802cd0db79ff7c18d9cdd2265a90dfcbe9bbd2d25bc5554cba8353`.

Chromium with Pixel 7 emulation, Firefox, and WebKit each emitted a
46,701-byte PDF from the six-page mixed-script fixture in an isolated
same-origin worker. PDF inspection found the header and the Persian
footer with the correct page number on all six pages, numeric cells for
42 ordered rows, the embedded image, and text after the explicit page
break. Some table text continues on the following page. The browser
probe observed zero non-GET or cross-origin page requests and zero
reported CSP violations. The page policy did not grant WASM execution,
which was limited to the worker response. This remains an isolated
engine result. Integration, independent layout fidelity, malformed input
handling and device resource limits remain open.

### Pagination comparison against Word

A local Word 16.0.20228.20110 export served as the reference for the
synthetic mixed-script document. The default-spacing fixture placed all
42 table rows on page one and its explicit break on page two in Word.
OpenDoc with the footer fix and Vazirmatn produced six pages with the
automatic-width table and three with the fixed-width control. The
fixed-width table used about 17.7 points per row in OpenDoc and 12 points
in Word. With exact 12-point spacing authored in the fixture, both
engines put the entire fixed-width table on page one. With Arial 11 points
declared in a separate fixed-width control and the same installed face
registered locally in both engines, both used two pages and the first
and last row baselines were about 702 and 163 points. Arial was a local
comparison control and is not bundled with the project.

Using Noto Naskh Arabic or Noto Sans Arabic as fallback covered the
fixture's characters but did not match the reference pagination. An
isolated trial that normalized Arabic fallback line height and adjusted
table width measurement matched the reference's page allocation for the
fixed-width table. The automatic-width fixture still emitted three
pages. It preserved all 42 rows but wrapped some short cell text. The
trial is not part of the app or a general font metrics policy. Diagnose
the measured and available cell widths before selecting a layout fix.

The WASM trace identified a line-break boundary. It reported integer
edges of 742 and 2,966 twips for text requiring 742.1777 and 2,966.0254
twips. The measured-width experiment uses the ceiling of the shaped
edge for intrinsic measurement and accounts for resolved cell margins,
spacing and borders. It uses physical left alignment for measurement
while leaving bidirectional shaping in place. Together with the trial
Arabic fallback line height, both table fixtures now preserve all 42
ordered rows on the first page and the explicit break on the second,
matching local Word exports. See the opt-in regression
[`check-opendoc-pagination.mjs`](../../scripts/quality/check-opendoc-pagination.mjs).
The earlier footer-only build fails the automatic-width case with six
pages. All three footer regression cases passed on the measured build.

Chromium with Pixel 7 emulation, Firefox and WebKit each also exported
the two-page automatic-width document with its image and numbered
Persian footers. The isolated worker produced 42,387 bytes with no
reported missing glyphs, CSP violations or outbound page requests. This
does not establish exact coordinates or wider document compatibility.
The Persian fallback metric remains experimental and the application
does not yet include the engine.

### Isolated Word-to-PDF resource profile

The guarded OpenDoc prototype built from `91775489` was exercised with
10-, 50- and 100-page synthetic DOCX files, using eight mixed Persian and
English paragraphs per page and an explicit break before each page marker.
The input files were 8,810 to 9,994 compressed bytes and contained no
images. Three fresh runs per size in each of Chromium (Pixel 7 emulation),
Firefox and WebKit passed. The test parsed every generated PDF and checked
the ordered marker and Persian text on every page. There were no observed
cross-origin requests or CSP violations in the probe.

| Pages | Chromium median | Firefox median | WebKit median | WASM memory after export |
| ----: | --------------: | -------------: | ------------: | -----------------------: |
|    10 |          395 ms |         356 ms |        453 ms |             10,682,368 B |
|    50 |          737 ms |         773 ms |        995 ms |             14,483,456 B |
|   100 |        1,192 ms |       1,385 ms |      1,746 ms |             19,529,728 B |

Browser times include starting the worker and delivering its result to
the Playwright probe. The largest measured 16-ms timer interval during
100-page conversion was 58 ms in Chromium, 82 ms in Firefox and 59 ms
in WebKit. These are event-loop samples on the test host. A separate Node
Worker measured the engine's linear-memory capacity. Capacity did not
shrink after freeing the document, so a per-operation worker can release
the whole instance at termination. The profile does not measure total
browser memory, physical-device performance or image-heavy documents.
Do not derive an upload limit from this text-only profile.

The measured WASM SHA-256 was
`b05f93f327fe7709258c4cf4bd02356e830c9beb36037829b4114c9b67ae35a5`.

The same isolated engine also exported a 4,606,886-byte synthetic DOCX
containing 12 distinct 1,600 × 1,200 JPEG images. Each of three runs in
Chromium (Pixel 7 emulation), Firefox and WebKit produced the same
4,629,538-byte PDF. Each download had 12 ordered Persian-text pages
with an image paint operator on every page. Poppler rendered all 12
images and pixel checks verified both color bands and the distinct page
order. Median time to ready was 269 ms, 284 ms and 388 ms respectively.
The worker's WASM linear memory reached 31,850,496 bytes in all runs.
The probe moved the result via a transferable buffer and a Blob download.
The timing excludes fetching the download bytes and parsing them.

A separate run per browser cancelled an operation after posting the file
to its worker, before the conversion completed. The prototype rejected it
with `AbortError` and returned a byte-identical PDF on immediate retry.
The PDF download object URL was revoked after the probe retrieved it.
The four-page PNG control used the same per-image dimensions, a
6,962,187-byte input and 50,528,256 bytes of worker linear memory in
each engine. One run per engine produced the same 6,945,238-byte PDF.
It passed page order, text and Poppler color checks for all four pages.
The PNG and JPEG cohorts differ in compressed size and page count.
These checks cover synthetic same-origin prototype workloads. Peak
browser process memory and physical devices still need separate evidence.

### Application preview

The candidate has an opt-in converter on the existing Word-to-PDF route.
To run it locally, pass the evaluated OpenDoc package directory to
`node scripts/stage-word-pdf-preview.mjs <package-directory>`, then start
the local app with `NEXT_PUBLIC_WORD_PDF_PREVIEW=1`. The staging script
verifies all runtime files and notices before copying them. The generated
runtime directory is ignored by Git. Build the preview in an isolated
worktree. For a normal build, leave the flag unset and keep the runtime
outside `public/`. The build rejects staged runtime files when the preview
is disabled because standalone packaging copies the public directory.

Each conversion transfers the file to a fresh same-origin module worker.
The preview closes the worker on successful output, failure, cancellation,
timeout or navigation away. The output URL is revoked when the selection
changes or the route unmounts. The production policy's page-level WASM
permission is unchanged. An exact worker URL receives the narrower worker
CSP only when the preview is enabled.

The preview caps compressed input at 8 MiB, output at 24 MiB and page
count at 100. A 101-page synthetic DOCX produced a page-specific alert
and no download. The retry with a two-page DOCX opened successfully
and contained the expected second-page text in Chromium, Firefox and
WebKit. This is a page-limit check, separate from memory profiling.
The patched ZIP reader also checks a 48 MiB expanded total
and 16 MiB per entry at admission, before reading document parts. These
ceilings do not measure transient allocations when decoding media or
laying out pages.

For the pinned source build, use
`bash scripts/build-word-pdf-preview.sh <OpenDoc-git-checkout> <new-output-directory>`
with Rust 1.96.0, its `wasm32-unknown-unknown` target, a host linker and
wasm-bindgen CLI 0.2.129. The command extracts the pinned revision into
a temporary directory and applies the [preview patch](fixtures/opendoc-word-preview.patch).
The staging command above checks the resulting runtime files by SHA-256.
The preview build also verifies the tracked Vazirmatn fallback font and
its OFL notice by SHA-256. Standalone smoke verifies both over HTTP.
A fresh WSL Ubuntu 24.04 build matched the staged engine and upstream
notice hashes from the separate build. Build also needs Node.js to gather
license texts from the locked WASM Cargo dependency graph, embedded
fonts and ECMA-376 data. It copies the Rust standard library copyright
file from the pinned toolchain. The standalone smoke checks all ten
preview assets when the flag is on. The collector records license
expressions and verbatim notices. It does not decide license choices or
authorize public distribution. Broader compatibility remains open.

The standalone smoke verifies the PDF.js worker and every installed
CMap, standard font and accompanying notice over HTTP. It compares
response bytes with the pinned dependency, so missing or stale copies in
`public/` fail the check. On application SHA `8cf55604`, the updated
smoke passed 11 routes and 199 PDF asset checks with the Word preview
enabled, including all 186 PDF.js files.

On `7aeb880e`, the preview-enabled standalone build passed the focused
invalid-input, retry, real PDF download and worker CSP test in Chromium,
Firefox and WebKit over isolated HTTPS. The earlier WebKit development
run did not enable conversion after file selection.

On application SHA `a85a4c20`, the Word route downloaded a two-page PDF
with 42 ordered table rows, mixed Persian and English, a running header
and a numbered Persian footer on each page, a page break, and a PNG on
page two. The Playwright assertions inspect PDF text and operators and
check the footer anchor's horizontal bounds. The five runs passed on
desktop Chromium, Firefox and WebKit and on Pixel 7 and iPhone 13
emulations. This fixture has one table that fits on the first page.
Physical devices and general Word layout fidelity remain open.

On application SHA `04439365`, the 84-row fixture exercised a table
that flows across multiple pages. Each table page contained rows, and
their combined sequence matched the source exactly. The explicitly
separated final page contained the body marker and PNG. Every page
retained the running header and its own Persian page number. The
standalone HTTPS test passed in Chromium, Firefox, WebKit, Pixel 7
emulation and iPhone 13 emulation. The 42-row two-page control also
passed in the three desktop engines after sharing the fixture helper.

For the same application SHA, the normal build and `ci:quick` passed
(293 files and 2,256 tests). The loopback standalone smoke passed 11
route and nine PDF asset checks. The default standalone public directory
had no staged Word engine. The preview build and its staged-file hash
check also passed. On GitHub, [Lighthouse CI](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/45972515585/job/140416267037)
measured performance scores of 0.66 on Home and 0.63 on Blog against
the 0.75 threshold. Those lab results leave the hosted gate open.

The official Rust 1.96 release and installer passed checksum checks. A
temporary WSL toolchain installed the WASM target, but the pinned
`wasm-pack 0.13.1 --locked` build exceeded the available execution
window. The detached attempt lost its temporary directory and left no
verifiable artifact. Windows and the Windows-mounted WSL attempt failed
with component rename and directory conflicts. No OpenDoc WASM bundle
or DOCX conversion result exists.

Nutrient documents local browser conversion and self-hosted assets. Its
license and CSP requirements need evaluation before integration.
Current Word-to-PDF conversion acceptance is FAIL. The smallest
repeatable OpenDoc unblock is an isolated persistent runner with
Rust 1.96, the WASM target and wasm-pack 0.13.1. Build the pinned source
there and test the generated PDF against the mixed RTL fixture before
choosing an engine.

The official npm package `@casualoffice/opendoc-viewer@0.1.0-alpha.1`
became an independent evaluation path. Its tarball matched registry
SHA-512 and contained Apache-2.0 notices and an 11,173,494-byte WASM
module. The package did not include the optional font directory. The
engine reported missing Persian glyphs with core fonts. Registering
local Vazirmatn as the Arabic-script fallback cleared that diagnostic.

A local-only Worker prototype emitted identical six-page PDFs in
Chromium with Pixel 7 emulation, Firefox and WebKit. The page CSP used
same-origin scripts and workers. WASM permission was confined to the
worker response. The browser probes observed zero non-GET or
third-party requests and no reported CSP violations. The parsed PDF
contained the header, a PNG, the last table row and content after the
explicit page break. This verifies selected output properties, not
layout parity or physical-device memory.

The mixed Persian document lost its footer. A separate minimal
two-page DOCX reproduced the loss with a Persian run followed by a
Latin marker and a PAGE field. The source footer XML held both the
marker and the field. The PDF contained neither on both pages. The
Latin-only control retained the footer and page numbers, with and
without the local fallback font. Core fonts and explicit Vazirmatn
registration also failed on the mixed footer. This release does not
meet the Word-to-PDF acceptance bar. Re-evaluate a fixed engine against
both fixtures before integrating it.

The published bundle identifies upstream source revision
`9177548903e1546f64061b914598a840e1cfa042`. For the minimal two-page
fixture, Poppler at 96 DPI rendered the Latin footer on the first
page. The mixed footer was visibly absent. A full-page pixel scan
found the same header and body bands in both PDFs with no additional
painted band in the mixed case. OpenDoc's own page PNG renderer also
showed empty footer bands on both mixed pages, while both Latin pages
contained visible footer text. The failure therefore occurs before
PDF text extraction and also affects the engine's raster output.
Explicit RTL paragraph and run settings did not recover the footer.

The field interaction is narrower than a general Persian-footer failure.
Persian-only and mixed Persian/Latin footer paragraphs without a
`PAGE` field appeared at all three tested footer distances (720,
1,200 and 1,800 twips). Adding the field after the Persian text in the
same paragraph removed the whole paragraph at each distance. Putting
the field first or on a separate paragraph retained the content in
this fixture. These variants isolate a reproducible upstream
layout case. Rewriting users' documents to move their fields would
change their layouts and does not satisfy conversion acceptance.

Run the [focused footer check](../../scripts/quality/check-opendoc-footer.mjs)
with `node scripts/quality/check-opendoc-footer.mjs <package-directory>`
against an unpacked, verified Viewer package. It generates synthetic DOCX
inputs in memory and checks the actual exported PDF. The two controls
pass on `0.1.0-alpha.1`, and the mixed footer with trailing `PAGE`
returns exit 1. The pinned engine's pagination pass resolves fields
after placing each footer and repositions runs starting at the first
field. This is a source-level lead. A patched engine has yet to pass
the fixture.

## Split PDF resource profile

The QPDF runtime used to collect the complete MEMFS directory after
every part, including the original `input.pdf`. Split now requests
only `output.pdf`. The regression uses the actual WASM engine and
checks identical output bytes, excluded source bytes, and the
original exit behavior when the requested output is absent.

An isolated Node 24.19.0 Windows profile compared both collection modes
of the same runtime. The deterministic 33,574,583-byte PDF had 40 pages
and a 32 MiB attachment generated from an AES-CTR byte stream. Each fresh
process extracted twenty two-page parts with QPDF and retained the
outputs. The five runs per mode alternated order. The part bytes
matched in all ten runs (`--static-id`; combined SHA-256
`ab18d5ad055f336db9a4495cd60b4d13dfa5bce9365a3daae85275ac4270b0df`).

| QPDF file collection | Median wall time | Median peak RSS | Maximum peak RSS | Input bytes returned cumulatively |
| -------------------- | ---------------: | --------------: | ---------------: | --------------------------------: |
| Whole directory      |           605 ms |       219.7 MiB |        222.8 MiB |                 671,491,660 bytes |
| Requested outputs    |           284 ms |        93.0 MiB |         96.1 MiB |                           0 bytes |

These figures isolate QPDF extraction and exclude ZIP assembly and
browser workers.

The standalone browser A/B on `385d534b` compared five fresh Chromium
runs per mode in alternating order on the same Windows host. Both modes
used Pixel 7 emulation (412 × 839 CSS pixels), the same synthetic input
and ZIP workflow. The baseline changed only the served loopback worker
call to collect the whole directory. The candidate used its regular
output-only request. The 40-page input weighed 33,574,583 bytes and
included a large document attachment. Each run downloaded a 29,758-byte
ZIP. ZIP CRC checks passed and all 20 PDFs parsed with two pages and the
expected first-page widths.

| Split browser profile | Median selection to ZIP ready | Median sampled peak private memory | Maximum sampled peak | Median rise over idle |
| --------------------- | ----------------------------: | ---------------------------------: | -------------------: | --------------------: |
| Whole directory       |                      3,962 ms |                          651.3 MiB |            708.6 MiB |             539.7 MiB |
| Requested outputs     |                      3,442 ms |                          574.5 MiB |            579.1 MiB |             437.4 MiB |

Private memory sums the Chromium processes observed during the profile,
with 40 to 48 samples per run. These measurements cover this attachment-heavy
fixture. Large ZIP payloads and physical-device memory remain unverified.

## Compression cancellation

The Chromium regression held the selected file read and reproduced the
busy state persisting after Cancel. Each batch now owns a worker client.
Cancel detaches and terminates that client and restores the controls
immediately. A late rejection cannot alter the next batch, and finished
batches also release their worker.

The Node 20 build passed. The compression suite passed all 14 Chromium
and Firefox cases, and the cancellation regression passed in WebKit.
The retry produced a readable two-page PDF in the expected order.

The decryption regression likewise held the first file read open.
Cancel now restores the controls immediately. Once detached, a read
cannot start a worker or update the replacement operation. The Node 20
build and all eight decryption cases in Chromium and Firefox passed.
WebKit also passed the cancellation and retry case. Each retry proved
that the downloaded PDF opened without a password.

## Encryption cancellation

The Chromium baseline held the second file read and confirmed that the
processing UI had no cancel control. Cancel now detaches and terminates the
worker and allows a retry while the previous read settles. Completion,
failure, reset and unmount also release the worker that the tool owns.

The Node 20 build passed. On isolated standalone HTTPS, the three existing
signature-refusal and three malformed-input/AES-256 cases passed. The new
regression passed in Chromium, Firefox and WebKit after correcting the
synthetic text placement and supplying the verifier's standard fonts.
The retry download opened with the supplied password, retained its page
dimensions and text, and was the sole download. Releasing the earlier read
did not display its late error. Physical-device and peak-memory coverage
remain open.

Read-only Production checks returned HTTP 200 for both version and health.
The version endpoint reported `771366adb58ac1290c6cfa192ecd803d849a426f`,
the merge for PR #302. This is a separate live checkpoint from PR #301.

## PDF to Image cancellation

Chromium reproduced the loss of keyboard focus when the cancel button
disappeared. Cancel now returns focus to the enabled Convert button.
The regression retries while the canceled file read is still pending,
downloads a PNG, checks its decoded dimensions, and confirms that a late
read failure leaves the output URL and visible state intact.

The Node 20 build passed. In isolated standalone HTTPS, Chromium,
Firefox and WebKit each passed cancellation with retry, oversized-canvas
rejection with smaller-page recovery, and the ZIP test comparing its PNG
entry with the individual download. Physical-device limits remain open.

## Tagged PDF output follow-up

The Chromium baseline downloaded a PDF from each operation, and both
fixtures failed because the new drawing instructions were outside an
artifact section. Watermark now encloses its image in an artifact, and
page numbering uses a pagination artifact. The modified watermark
fixture retains the existing structure tree and checks that its page
reference survives. Both checks inspect the actual downloaded PDF and
retain their geometry assertions. The production-mode build and all
four focused Chromium and Firefox cases passed. These assertions do
not establish PDF/UA conformance or cover XFA.

Separate XFA checks on the application code from `a1975879` confirmed
that Rotate, Compress, and Watermark each returned rewritten PDF bytes
with the original synthetic XFA stream intact. Numbering preserved the
stream in Chromium, Firefox and WebKit downloads. The checks compare
decoded XML and do not validate interactive XFA rendering.

The earlier two WebKit failures on `385d534b` did not recur in ten
serial or twelve two-worker focused executions. The full-suite
timeouts remain recorded because their cause was not established.

## Release and rollback handoff

The application code at `822fa2d6` passed all 16 hosted checks, as did the
documentation checkpoint `8f71adbf`. The local standalone Chromium
and Firefox suite at `8f71adbf` completed with 204 passes and two
Chromium-only skips. Release gates remain open for a final candidate
that meets the Word-to-PDF requirements.

1. Obtain owner clearance for the release hold and any release-blocking
   product decision. Record the reviewed candidate and rerun mandatory
   gates on the exact resulting main SHA after review and integration.
2. Read public health and the full version SHA, record the verified
   rollback target, and use the [manual production workflow](../../.github/workflows/deploy-production.yml)
   under the [production safety policy](../ops/PRODUCTION_DEPLOY_SAFETY.md).
   The workflow resolves the confirmed main ref to a full SHA. Leave
   migrations and recovery flags disabled for a routine release.
3. Verify the immutable inactive slot before switching traffic. Validate
   database backup, health, SHA, standalone manifest, CSS and JavaScript,
   PDF.js Worker, CMaps, standard fonts and QPDF WASM. Exercise PDF tools
   with synthetic downloads and preserve the previous slot.
4. Verify public health, SHA, routes and assets twice with the required
   stabilization interval. Run the independent browser verification and
   record its evidence under the [live verification policy](../ops/POST_DEPLOY_LIVE_VERIFICATION_POLICY.md).
5. On post-switch deployment failure, use the workflow's automatic
   restoration and verify the previous SHA and assets publicly. If
   manual intervention is needed, obtain the required authorization and
   use the canonical rollback script in the production safety policy.
