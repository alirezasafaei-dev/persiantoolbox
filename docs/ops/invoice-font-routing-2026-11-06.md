# Invoice font route repair — 2026-11-06

## Problem and scope

At 15:06 UTC the public runtime reported `0195bbc3164960f54f782d3abe1f541153518dae` and health `status=ok`, `ready=true`. `/fonts/Vazirmatn-Regular.ttf` returned HTTP 404; Bold returned 200. Read-only inspection of the loaded Nginx configuration confirmed the production font location still used the historical checkout alias. A local transform of that observed configuration changed exactly that alias, with no other bytes changed. No production mutation was performed.

The canonical blue/green engine now reconciles only that known production location to `persiantoolbox_backend` before strict current-release public checks. It rejects ambiguous hosts, locations, unknown routes and included font directives. Staging, other vhosts, TLS/security headers and the immutable Next static store are preserved. Unexpected configuration stops deployment rather than broadening the edit.

The engine first verifies the active slot's two invoice fonts against its release bytes. Reconciliation retains a mode-0600 backup, preserves the original owner/group/mode, installs atomically, tests Nginx, reloads gracefully and compares public font bytes. Install, syntax, reload or public verification failure restores the original configuration. A successful repair follows the named upstream across future switches and rollback. This library cannot be run as an independent deployment entrypoint.

Release asset verification now covers both invoice TTFs alongside UI WOFF2 fonts, requiring HTTP 200, nonempty bodies, supported font MIME and byte equality with the runtime reference. Rollback, prior-slot audits and static-store provisioning explicitly select their own release references; a newer source checkout is not evidence of older font bytes.

## Verification evidence

| Check                                               | Result                                                                                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Transform regressions                               | PASS: production-only replacement, idempotency, staging preservation, malformed/unknown/ambiguous rejection                                                  |
| Loaded-inventory regressions                        | PASS: exact file selection, duplicate production rejection, staging-only rejection                                                                           |
| Shell transaction fixture                           | PASS: normal/idempotent; loopback/public/syntax/reload/unsafe-target failures; restored bytes/mode and retained protected backup                             |
| Real HTTP gate fixture                              | PASS: valid fonts accepted; missing, HTML MIME, empty and corrupt fonts rejected; distinct previous-release bytes accepted with explicit reference           |
| `pnpm ci:quick`                                     | PASS: 266 files / 2,007 tests, exit 0; final focused deployment/routing run also passed 51 tests                                                             |
| Initial full test attempt                           | FAIL: one existing Search Console import timed out at 5 seconds; focused rerun and subsequent full run passed without changing its timeout/test              |
| `pnpm ci:contracts`                                 | PASS, exit 0                                                                                                                                                 |
| `pnpm build`                                        | PASS, exit 0                                                                                                                                                 |
| `pnpm --config.shell-emulator=true predeploy:smoke` | PASS, exit 0, 11 canonical standalone route checks; emulator interprets the package's POSIX environment assignments on Windows                               |
| Chromium standalone download                        | PASS, retries 0: both actual font responses 200, SHA-256 matching shipped fonts, downloaded parseable PDF                                                    |
| Downloaded PDF                                      | One page; visually inspected using Poppler; PDF.js found `React 19`, `INV-0001` and total `۱۶۰٬۰۰۰`                                                          |
| Independent review                                  | Cross-release reference findings corrected; inventory coverage finding corrected. No remaining demonstrated transaction correctness/security defect reported |

The shell operational fixture replaces external processes and remains separate from the real JavaScript transform and real HTTP gate tests. It proves transaction behavior, not a live Nginx reload. Local browser download proves the built application path, not public routing after deployment. PDF.js extraction and visual review do not independently prove every PDF reader's search/copy behavior.

## Release boundary and remaining work

This change is not yet merged or deployed. Owner approval for PR #251 does not authorize this separate hotfix. After the new PR's exact-head checks and explicit merge/deploy approval, use only the canonical production workflow. Require fresh protected backup, verified inactive slot, retained rollback and strict public checks. Then download an actual invoice through the public hostname, verify both font responses/bytes, inspect the mixed-script PDF and recheck release/rollback identity and neighboring services. Until that evidence exists, the public invoice defect remains open.

No environment files, private Nginx dump, production backups, API keys or synthetic binary verification artifacts belong in this commit. Test PDFs/screenshots and raw logs are retained locally outside tracked source.
