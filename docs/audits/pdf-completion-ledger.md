# PersianToolbox PDF completion ledger

## Checkpoint

- Branch `codex/pdf-quality-seo-20261121`, [draft PR #301](https://github.com/alirezasafaei-dev/persiantoolbox/pull/301).
- Starting application SHA `cb3b633ee46fa59566459b95e162898eb0ba508c`. At intake GitHub showed 14 successful checks and one in progress. The PR advertised no review decision.
- Production version API reported `d31c5b9c7f2e6746afbc31c56d95623d7b47bca1`. Owner hold applies to merge, deployment and shared infrastructure changes.
- Prior evidence and the 17-tool inventory are in the [execution report](pdf-quality-seo-execution-2026-11.md). A scoped PASS applies to its tested SHA and fixture.

## Work queue

| Item                                | Priority | Status      | Dependencies                                                     | Acceptance and latest SHA or evidence                                                                                                 | Next action                                                                                                               |
| ----------------------------------- | -------- | ----------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Local DOCX to PDF                   | P0       | BLOCKED     | Persistent isolated Rust/WASM runner or approved licensed engine | Pinned OpenDoc build produced no artifact. Existing guide cannot convert.                                                             | Run the mixed Persian DOCX fixture on a verified local engine under the current CSP.                                      |
| Output structure and safe rejection | P0       | IN_PROGRESS | QPDF and PDF.js fixtures                                         | `243585f3` resolves cross-document link fallback; `77f8901f` adds signature refusal to both cryptographic transforms.                 | Complete per-operation preserve and reject evidence for remaining feature classes.                                        |
| Large-file processing               | P1       | IN_PROGRESS | Matched repeatable browser workload                              | Isolated QPDF A/B now demonstrates removal of the source clone. Earlier browser samples did not establish lower total Split peak.     | Verify browser and mobile peak under a matched ZIP workload.                                                              |
| PDF.js standard assets              | P1       | PASS        | Pinned PDF.js dependency                                         | `4a056228` passed 42 Chromium/Firefox tests, five WebKit probes and 186 copied-asset comparisons.                                     | Include PDF.js, QPDF and application assets in final standalone verification.                                             |
| Split search intent and SSR         | P1       | PASS        | Finalized Search Console data                                    | `cb3b633e` passed focused Chromium/Firefox and unit checks. Same URL and canonical, visible H1 and FAQ without JavaScript.            | Measure matched post-release 28-day windows when available.                                                               |
| Other SEO/GEO opportunities         | P1       | PASS        | Direct Search Console query/page data                            | `7df615a2` addresses the remaining ten pairs on five pages. Chromium/Firefox confirmed no-JavaScript guidance.                        | Verify current hosted gates and measure matched periods once released.                                                    |
| GA4 and event semantics             | P1       | IN_PROGRESS | Read-only Analytics access and consent                           | Browser report confirmed PDF page engagement; both funnel queries returned no rows. `08ea957e` implements consent-gated Split events. | Obtain organic landing/device report and validate events after release.                                                   |
| Isolated preview and package        | P1       | IN_PROGRESS | Exact SHA standalone build, HTTPS loopback                       | Standalone and loopback HTTPS work locally. GitHub Staging has a secret and port conflict; WSL Docker daemon access was denied.       | Verify final build asset inventory and HTTP delivery. Identify an authorized independent hosted environment if available. |
| Existing shared Staging workflow    | P1       | BLOCKED     | Owner-approved isolated deployment target                        | Existing service uses the targeted port; a Staging configuration secret is absent.                                                    | Use a separate owner-provisioned preview or reconcile Staging separately under explicit approval.                         |
| Word guide as converter acceptance  | P0       | FAIL        | Local DOCX converter                                             | Guide produces no PDF bytes and cannot pass conversion acceptance.                                                                    | Keep open under the DOCX engine item.                                                                                     |
| Physical device coverage            | P1       | BLOCKED     | Authorized physical device                                       | Prior browser emulation and WebKit cover scoped cases. No physical device was attached in the recorded run.                           | Use a provisioned device if made available. Keep emulation evidence separate.                                             |
| Final 17-tool acceptance and gates  | P0       | IN_PROGRESS | Implementation and immutable candidate                           | `05cd2406` creates the per-tool historical matrix. Hosted Home/CTA and Split navigation failures were observed at `77f8901f`.         | Run final gates and complete outstanding criterion receipts.                                                              |
| Release and rollback handoff        | P0       | IN_PROGRESS | Final SHA, reviews and gates                                     | Executable sequence recorded below against the manual workflow and production policy.                                                 | Attach the exact reviewed release and verified rollback SHA after release clearance.                                      |

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
