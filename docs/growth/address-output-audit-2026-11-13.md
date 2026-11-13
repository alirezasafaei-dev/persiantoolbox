# Address output audit — 2026-11-13

The owner-approved 14-day focus program prioritizes address conversion, invoices,
work certificates and formal letters (80%); OCR/writing evaluation (15%) and
specialist discovery (5%). This is the first bounded application correction.

## Observed release state

PR #276 is already merged as `4f5c00c1d0a90efb8c7552556341b4103c63998c`.
Its canonical deployment run 43383990561 failed public verification on DNS
timeouts and automatically rolled back. Fresh public version/health on November
13 still reported `d584a617a5f30442dc20b3251085cf0ef6c12787`, status ok, ready true.
Do not repeat the merged place-name implementation or redeploy automatically.
The documented SSH key was unavailable in the current WSL environment; server
resolver diagnosis was not performed. No infrastructure changes were made.

Existing private PR #275 receipts were inspected: the HTTP receipt identifies
the expected SHA and the paced browser receipt records completed checks. These
are historical evidence, not a fresh full policy acceptance. Current endpoint
checks alone do not establish full live-browser acceptance of either release.

## Reproduced defect and correction

Manual spelling corrections were held separately from generated output. Line
corrections were ignored, city corrections reached only some views, and the
single-line value, maps and readable template could retain the original value.
The UI said the correction was saved while the user could copy old output.

One resolved output now supplies every output consumer, including templates,
maps and the user-initiated error report. Its single-line value is rebuilt using
the existing strict/readable format rules. Saved corrections and unfinished
edits expire when the source form changes; changing output mode preserves them.
No conversion dictionary or payment/credit rules were changed.

## Synthetic scenarios and acceptance criteria

`features/text-tools/address-audit.test.ts` contains 21 synthetic fixtures with
literal expected results: ordinary street; Fereshteh, Shahrzad and Polur names;
ZWNJ, zero-width space and NBSP separators; messy whitespace; Latin/Arabic plaque
digits; unit; floor; Persian/Latin postal codes including a leading zero;
Shahrekord and Bandar Abbas cities; East Azerbaijan province; Vanak district;
incomplete street; empty optional fields; and a 30-part long street.

Multiple Latin spellings are not inherently failures. The dictionary convention
is pinned for regression detection; acceptance requires preserving place identity,
not translating substrings such as شهر or پل inside a proper name. Official
spelling must be chosen from the recipient's own reference when necessary.

Six component regressions exercise both output modes, line/city corrections,
clipboard, templates, decoded map links, report JSON, mode switching, new source
input and an unfinished edit. The initial three tests reproduced old output.
Test matcher/strict fixture typing issues encountered during implementation were
corrected; they were not product failures.

## Verification

- `pnpm ci:quick`: PASS, 2,182 tests in 282 files, lint/typecheck/local-first gate.
  Existing lint warnings remain; no lint errors.
- `pnpm ci:contracts`: PASS, including licensing and documentation links.
- `pnpm build`: PASS on the final application changes.
- Canonical `pnpm smoke:local` with `SMOKE_HOST=127.0.0.1`, `SMOKE_PORT=3100`:
  PASS, 11 standalone routes. PowerShell requires explicit environment assignment.
- Chromium 1440px and 390px: PASS for the three proper-name regressions,
  manual correction and clipboard in both modes, structured/free-text entry,
  Persian postal digits, incomplete-input gating and horizontal overflow.
  Screenshots inspected; physical keyboard/phone and reload draft persistence
  are NOT_RUN. The form currently has session-only state; reload persistence is
  a follow-up rather than an implied feature.
- No page exceptions or synthetic address marker in observed request URLs/bodies.
  Background requests did include aborted account prefetches, a local HTTPS
  prefetch error and a blocked external trust badge. These are retained warnings;
  a completely clean network run is not claimed. An initial browser-script
  failure selected a nonexistent confirmation label; corrected selector passed.
- Independent read-only review: no remaining actionable findings; 47 focused
  tests, typecheck, scoped lint, local-first and diff whitespace checks passed.

Raw logs, screenshots and browser scripts remain private outside Git. These are
local candidate results; hosted CI and production acceptance are separate gates.

## Privacy and measurement

Conversion and corrections stay in the browser. Opening a map intentionally
places the output in the selected provider's URL. Sending feedback opens a
mailto draft containing input/output; this audit did not send mail or open maps.
The address-specific telemetry dispatches local custom events with allowlisted
field/mode/confidence metadata. Start/complete analytics use tool/category only;
the copied address is not added to analytics by this patch. A local custom event
alone is not proof that a server dashboard receives copy counts.

Completion currently means the four required fields are nonempty and a result
is generated. It does not establish postal validity, successful delivery or a
purchase. Real completion rates and task-time distributions remain unmeasured.

## Other priority tools and remaining work

| Tool             | Current source evidence                                                                                   | Next bounded audit                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Invoice studio   | Local drafts, export funnel and credit confirm/cancel paths exist; prior Word/PDF release evidence exists | Measure synthetic task time, draft recovery and actual free output; audit credit failures without consuming real credit |
| Work certificate | Local draft storage and shared export funnel exist                                                        | Twenty synthetic destination-specific cases, output/validation and mobile checks                                        |
| Formal letter    | Local draft storage and shared export funnel exist                                                        | Twenty synthetic cases, preview/output and mobile checks                                                                |

The supplied GSC baseline covers October 13–November 9 versus the previous 28
days: address 434/422 clicks, certificate 169/109, invoice 102/21, letter 60/16.
These are owner-supplied page figures, not newly queried data or measured sales.
The main domain must be separated from llm; exact-query position and page totals
must remain separate. No revenue target or ranking guarantee is established.

Remaining address findings to triage independently: free-text keyword parsing
is heuristic, postal-code validity lacks dedicated feedback, state is not restored
after reload, and copy events need end-to-end measurement verification. These
were not folded into the correction without their own reproductions and tests.

Merge and staging/production deployment require explicit owner approval. A new
deployment must retain all canonical verification and rollback requirements.
