# OCR early file selection recovery

## Scope and design

Preserve a file selected in the server-rendered OCR input before the client component hydrates. Read the existing native input selection once on mount through the same image-validation/preview path as ordinary change events. Preserve local-only processing, same-origin OCR assets, CSP, keyboard access and existing extraction behavior. No dependency or server change is needed.

The owner authorized the reviewed integration/release on 2026-11-06. PR #250 was merged at `1b6cccddf2b3bbd1b5981d8bfcdae10c4b51d7a9`. Main CI exposed an OCR retry-pass; local repeats reproduced missing file preview (3/5 failed without retries). Native change/FileReader instrumentation then recorded five selected inputs, with the reader starting only in the one successful run (4/5 failed). The diagnostic code was removed. Production workflow `42204420647` was cancelled during its gate before deployment; public production remains `b6c2c33dfd5c4a55d55c3ed965636862b6d0e129` at observation. This follow-up is a separate reviewable correction; these observations do not authorize silently replacing the reviewed release candidate.

## Implementation and verification

1. `tests/components/PersianOcr.test.tsx`: server-render markup, select a synthetic file before `hydrateRoot`, and assert recovered preview/action or image-type validation. Retain ordinary post-mount selection coverage. RED observed: two hydration cases fail; ordinary selection passes.
2. `components/features/pdf-tools/PersianOcr.tsx`: factor existing selection validation/preview into one stable callback, use it from `onChange`, and recover the native input file on mount. Independent review's related deferred-read race requires a generation guard, clearing stale previews on valid replacement and invalidating callbacks during cleanup; its regression must also be observed RED/GREEN.
3. `tests/e2e/hydration-local-ocr.spec.ts`: add a deterministic browser regression that holds application scripts, selects a synthetic image from server HTML, releases scripts and requires visible preview and enabled extraction. Retain existing real OCR/CSP/same-origin assertions without weaker timeouts or retries.
4. Run focused unit RED/GREEN, the deterministic browser RED/GREEN and repeated original OCR extraction against canonical standalone output. Keep original failure receipts outside Git.
5. Run full quick/contracts/build/canonical smoke and relevant browser checks, independent review, licensing/secret scans and strict production audit before a signed commit and task PR.
6. Record exact-head hosted results and release boundaries. Do not claim production verification from local or CI evidence. Do not resume the cancelled production run against an obsolete candidate.
