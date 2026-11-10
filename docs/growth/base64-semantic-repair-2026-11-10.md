# Base64 semantic repair — 2026-11-10

Status: the candidate passed local verification and is prepared for draft review. It is not deployed. Production remains `35c06923ad6b79cd75305698bff868084659fe32`, the owner-approved PR #260–#262 release verified by [the successful production workflow](https://github.com/alirezasafaei-dev/persiantoolbox/actions/runs/42876900704).

## Reproduced defects and bounded repair

The public Base64 page returned HTTP 200 but had no H1 in its raw server response or hydrated DOM. Its tool title used H2 and its output title H3. The route also manually emitted a financial-category breadcrumb while ToolPageShell emitted a registry-backed text-tools breadcrumb inside `@graph`.

The candidate promotes the existing tool title to H1 and output title to H2. It removes the redundant manual BreadcrumbSchema and unused imports, leaving the shared registry-generated text-tools breadcrumb as the single source of truth. Conversion logic, local processing, dependency versions and global styles are unchanged.

Visual review caught an intermediate regression: unlayered global heading rules enlarged the new H1 from 36px to 48px on desktop and enlarged the result heading from 30px to 36px. Scoped important responsive utilities preserve the original title sizes of 24/30/36px and output sizes of 20/24/30px at mobile/tablet/desktop breakpoints, including their original line-heights.

## Verification

| Check                                                                        | Result                                                                                  |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Existing focused SEO/heading baseline                                        | PASS: 10 tests                                                                          |
| Original regression tests against the unchanged live release                 | Expected FAIL: absent H1 and output H2                                                  |
| Intermediate candidate refinement tests                                      | Expected FAIL: enlarged headings and duplicate breadcrumb                               |
| `pnpm ci:quick` on the final application patch                               | PASS: lint, TypeScript, local-first contract and 2,108 tests in 271 files               |
| `pnpm ci:contracts`                                                          | PASS                                                                                    |
| `pnpm build` after final source cleanup                                      | PASS                                                                                    |
| Canonical `pnpm smoke:local`, `SMOKE_HOST=127.0.0.1`, `SMOKE_PORT=3100`      | PASS: 11 checks; equivalent to `predeploy:smoke` with PowerShell environment assignment |
| Maintained `base64-tool.spec.ts` against the rebuilt standalone server       | PASS: 14 executions across desktop/mobile browser contexts                              |
| Viewport coverage within the maintained tests                                | 390px, 768px and 1440px in every context, including standard desktop CI                 |
| Raw-response H1, hydrated H1 and single registry breadcrumb                  | PASS                                                                                    |
| Mixed Persian/Latin Unicode encode/decode, title/output size and line-height | PASS                                                                                    |
| Visual inspection                                                            | Desktop and mobile screenshots reviewed; original heading typography preserved          |

The live and local evidence are deliberately separate: the live release reproduced the defect; the rebuilt local candidate passed the regression tests. The first hosted run on `dab821fa550de5a886094b1f69b07c7497ae69f7` passed quality, build, contracts, smoke, security, CodeQL, Lighthouse and three E2E shards. Shard 4 failed because the pre-existing comprehensive Base64 test required an H2. Its strict heading expectation is updated to H1 while retaining its actual conversion assertion; final-head checks must run again. No Google indexing or ranking improvement is inferred from local tests.

The browser diagnostic recorded no runtime JavaScript page errors and no unexpected first-party HTTP error responses. It did record cancelled `/account` prefetch fetches (`net::ERR_ABORTED`, `next-router-prefetch: 1`); these entries are retained as diagnostic notes, not reported as zero failed requests. No converter/chunk/font failure was observed. Existing cookie-consent UI was not changed. Screenshots, traces and raw diagnostics remain outside the public repository.

## Search Console follow-up

The latest November 10 read-only inspection reports the English Student MVP guide as submitted and indexed, with the expected Google canonical and crawl time `2026-11-10T17:09:46Z`. Earlier inspection had reported it crawled but unindexed; the latest verdict supersedes that status without implying a new crawl time.

Services and PDF compression still have no reported crawl time. The latest API response labels them unknown, whereas the earlier inspection reported discovered but currently unindexed. This is a change in the reported classification, not evidence of a new crawl or a successful index. No duplicate indexing request was submitted.

Fresh public checks confirmed HTTP 200, self-canonical metadata, no noindex and sitemap membership for both pages. PDF compression has a direct homepage link. Services has no direct homepage link, and a bounded source search found no internal href to it; internal discovery needs a separate follow-up rather than claiming that sitemap inclusion guarantees discovery or that this alone caused Google's status.

## Publication boundary

The owner approved the earlier three releases only. This candidate requires approval of its own reviewed revision before merge or deployment. Hosted checks and any later release verdict belong to that exact revision. Private Search Console exports, credentials, customer data, production configuration and raw deployment logs are excluded.
