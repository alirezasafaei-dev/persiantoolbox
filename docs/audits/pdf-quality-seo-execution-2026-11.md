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

| Item  | Baseline finding                                                                                                 | Current acceptance          |
| ----- | ---------------------------------------------------------------------------------------------------------------- | --------------------------- |
| P0-01 | Batch compression resolved the output by a substring of the file name.                                           | PASS on the local candidate |
| P0-02 | Copying pages into a fresh document can discard interactive forms and document-level structure.                  | FAIL                        |
| P0-03 | Wrong-password handling can repeat the rejected password. The successful path renders a new image-only document. | FAIL                        |
| P0-04 | The worker client leaves requests pending when a worker stops replying.                                          | FAIL                        |

## C. Tool acceptance

Acceptance refers to the complete requirements of this execution. The previous audit
had individual smoke results, including successful file creation on several routes.

| Tool             | Status  | Main gap                                          |
| ---------------- | ------- | ------------------------------------------------- |
| Merge PDF        | FAIL    | Document-level form preservation                  |
| Split PDF        | FAIL    | Structural contract and number of resulting files |
| Compress PDF     | FAIL    | Document structure and public quality claims      |
| PDF to Image     | FAIL    | Individual downloads after ZIP creation           |
| Image to PDF     | FAIL    | Preview lifecycle                                 |
| Decrypt PDF      | FAIL    | Rejected password and structural preservation     |
| Encrypt PDF      | FAIL    | Modern encryption and reader compatibility        |
| Add Watermark    | FAIL    | Font loading and Persian rendering                |
| Rotate Pages     | FAIL    | Relative rotation and range validation            |
| Reorder Pages    | FAIL    | Structural preservation and range validation      |
| Delete Pages     | FAIL    | Structural preservation and range validation      |
| Extract Pages    | FAIL    | Structural contract and range validation          |
| Add Page Numbers | NOT_RUN | Full acceptance matrix                            |
| Extract Text     | NOT_RUN | Persian text quality and full acceptance matrix   |
| PDF to Text      | NOT_RUN | Persian text quality and full acceptance matrix   |
| Word to PDF      | FAIL    | Actual Word conversion                            |
| PDF to Word      | FAIL    | Feature claims exceed output fidelity             |

## D. Search work

Begin with the inaccurate tool claims and with intent differentiation between split
and extract, and between the two PDF-to-text entry points. Follow with SSR content,
schema meaning, contextual links and legacy redirects. Search Console data and lab
or field Web Vitals for this scope have not yet been verified. No organic lift is
established.

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

## G. Git and release

Branch: `codex/pdf-quality-seo-20261121`. Final candidate, required CI, and release
verification are pending.

## H. Open risks

Document structure support must be defined before promising preservation across
all editing operations. Wrong-file downloads can expose another selected document
to the person who receives the result.

## I. Verdict

Execution in progress. No release verdict yet.
