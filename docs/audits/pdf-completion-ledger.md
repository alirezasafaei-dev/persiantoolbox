# PersianToolbox PDF completion ledger

## Checkpoint

- Branch `codex/pdf-quality-seo-20261121`, [draft PR #301](https://github.com/alirezasafaei-dev/persiantoolbox/pull/301).
- Starting application SHA `cb3b633ee46fa59566459b95e162898eb0ba508c`. At intake GitHub showed 14 successful checks and one in progress. The PR advertised no review decision.
- Production version API reported `d31c5b9c7f2e6746afbc31c56d95623d7b47bca1`. Owner hold applies to merge, deployment and shared infrastructure changes.
- Prior evidence and the 17-tool inventory are in the [execution report](pdf-quality-seo-execution-2026-11.md). A scoped PASS applies to its tested SHA and fixture.

## Work queue

| Item                                | Priority | Status      | Dependencies                               | Acceptance and latest SHA or evidence                                                                                                                                                                                   | Next action                                                                                                               |
| ----------------------------------- | -------- | ----------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Local DOCX to PDF                   | P0       | IN_PROGRESS | Licensed browser engine under existing CSP | Word guide remains a guide. Earlier LibreOffice builds failed CSP before producing output. Require mixed Persian/Latin, RTL, tables, images, header/footer and page breaks in the actual PDF.                           | Inspect pinned OpenDoc and Office WASM Viewer. Run a local fixture if a viable distribution is available.                 |
| Output structure and safe rejection | P0       | IN_PROGRESS | QPDF and PDF.js fixtures                   | `243585f3` resolved cross-document link fallback. Require operation-level coverage of forms, attachments, metadata, destinations, outlines, chained actions, page geometry, encryption, signatures, tagged PDF and XFA. | Probe remaining data-loss paths and add targeted downloaded-output regressions.                                           |
| Large-file processing               | P1       | PENDING     | Matched repeatable browser workload        | `e6ade6f9` releases split worker before ZIP. Individual 839.4 and 843.6 MiB observations do not establish a reduction.                                                                                                  | Isolate QPDF and ZIP allocations, then benchmark matched runs before changing the pipeline.                               |
| PDF.js standard assets              | P1       | PASS        | Pinned PDF.js dependency                   | `4a056228` passed 42 Chromium/Firefox tests, five WebKit probes and 186 copied-asset comparisons.                                                                                                                       | Include PDF.js, QPDF and application assets in final standalone verification.                                             |
| Split search intent and SSR         | P1       | PASS        | Finalized Search Console data              | `cb3b633e` passed focused Chromium/Firefox and unit checks. Same URL and canonical, visible H1 and FAQ without JavaScript.                                                                                              | Measure matched post-release 28-day windows when available.                                                               |
| Other SEO/GEO opportunities         | P1       | PENDING     | Direct Search Console query/page data      | `b1d43d5b` records 20 opportunities. Split accounts for ten. Overlap is insufficient to establish cannibalization.                                                                                                      | Apply intent-specific changes to rotate, reorder, numbering, merge and extract; verify crawlable HTML and links.          |
| GA4 and event semantics             | P1       | IN_PROGRESS | Read-only Analytics access; consent        | Admin API returned 403 `SERVICE_DISABLED`. No valid funnel or field metrics obtained.                                                                                                                                   | Try the authorized Analytics browser session or another read-only official path. Inspect instrumentation independently.   |
| Isolated preview and package        | P1       | IN_PROGRESS | Exact SHA standalone build, HTTPS loopback | Standalone and loopback HTTPS work locally. GitHub Staging has a secret and port conflict; WSL Docker daemon access was denied.                                                                                         | Verify final build asset inventory and HTTP delivery. Identify an authorized independent hosted environment if available. |
| Existing shared Staging workflow    | P1       | BLOCKED     | Owner-approved isolated deployment target  | Existing service uses the targeted port; a Staging configuration secret is absent.                                                                                                                                      | Use a separate owner-provisioned preview or reconcile Staging separately under explicit approval.                         |
| Word guide as converter acceptance  | P0       | FAIL        | Local DOCX converter                       | Guide produces no PDF bytes and cannot pass conversion acceptance.                                                                                                                                                      | Keep open under the DOCX engine item.                                                                                     |
| Physical device coverage            | P1       | BLOCKED     | Authorized physical device                 | Prior browser emulation and WebKit cover scoped cases. No physical device was attached in the recorded run.                                                                                                             | Use a provisioned device if made available. Keep emulation evidence separate.                                             |
| Final 17-tool acceptance and gates  | P0       | PENDING     | Implementation and immutable candidate     | The execution report holds partial earlier tool evidence.                                                                                                                                                               | Fill the per-tool matrix against exact receipts; run mandatory quality, browser, asset, security and licensing gates.     |
| Release and rollback handoff        | P0       | PENDING     | Final SHA, reviews and gates               | [Deploy safety](../ops/PRODUCTION_DEPLOY_SAFETY.md) and [live verification](../ops/POST_DEPLOY_LIVE_VERIFICATION_POLICY.md) govern the release.                                                                         | Prepare candidate and rollback evidence. Keep changes off live infrastructure under the current hold.                     |

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
The home-page failure remains open.
