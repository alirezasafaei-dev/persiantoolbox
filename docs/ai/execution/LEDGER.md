# AI execution ledger — 2026-10-11

Baseline: origin/main cb59baa7; owner checkout 057b5b43 with pre-existing edits preserved. Isolated branch codex/pt-ai-workspace.
Live read-only /api/version cf370c54afc31e7ececc9f384f572e907a08443b; /api/health HTTP 200 ready, PostgreSQL healthy. This is endpoint evidence, not full production acceptance.

| ID    | Priority | Status       | Evidence / dependency                                                                                              |
| ----- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| A     | P1       | PASS         | 24 baseline unit tests; live identity/health; current GitHub PR/issues inspected                                   |
| B     | P1       | PASS         | Guarded request lifecycle, timeout/cancellation, draft recovery; late reply regression                             |
| C     | P1       | PASS         | Full-height shell, local sessions, safe Markdown; revocation/cross-tab/erase failures                              |
| D     | P2       | PASS         | Hub/entrypoint copy, scoped theme, mobile native dialog, marketing overlays suppressed                             |
| E     | P1       | PASS         | Enabled Chromium 10/10 repeated, disabled 1/1, ten widths/light-dark/axe; physical-device gaps in REPORT           |
| F     | P1       | PASS_LOCAL   | Quick/contracts/build/standalone smoke, PostgreSQL integration, security and independent review; details in REPORT |
| G     | P1       | READY_FOR_PR | Pre-commit snapshot: DCO commit, authorized Draft PR and exact-head CI are the next execution steps                |
| IMAGE | P1       | BLOCKED      | Issue #230: operator permission and first-party HTTP 403 unresolved; feature stays off                             |

Ruling: execute design and plan inline without additional routine approval prompts, because the supplied mission explicitly authorizes those professional decisions. Production release remains separately gated.
Ruling: preserve all unrelated owner changes and image PR work; use origin/main for chat candidate.
Ruling: local UI search Python unavailable on PATH; use verified skill accessibility/layout guidance with existing product tokens; no dependency/system installation for design search.

No merge, deployment, production environment/database/network changes performed.

Current evidence and release gaps: [REPORT.md](REPORT.md). Final GitHub SHA/PR/CI identity belongs to the delivery report, because a commit cannot contain its own SHA. This ledger records the pre-commit local candidate checkpoint.
