# AI workspace implementation plan

Goal: deliver the approved Persian-first workspace using the existing backend.
Architecture: client workspace orchestrates scoped components and validated browser-local sessions; server pages retain feature-gated metadata. No new dependencies.
Spec: [DESIGN.md](DESIGN.md). Execution: inline under executing-plans, followed by one independent branch review.

- [x] A: baseline/API audit and live version/health; record evidence in LEDGER.md.
- [x] B: reproduce cancellation/stale request and error leakage with component tests; implement guarded request lifecycle in ChatWorkspace.tsx.
- [x] C: tests for session validation/privacy and Markdown safety; implement lib/ai/local-conversations.ts and components/ai/ChatMarkdown.tsx, then integrated shell/styles/session controls.
- [x] D: update app/ai/chat/page.tsx and app/ai/page.tsx; truthful availability, theme, mobile dialog, metadata and context copy.
- [x] E: extend tests/e2e/ai-chat-enabled.spec.ts; mocked inference, browser screenshots, width/theme matrix, keyboard and axe; focused API tests.
- [x] F: run ci:quick, ci:contracts, build, canonical standalone predeploy smoke, licensing and security checks. Independent review, fix, retest, evidence report.
- [ ] G: inspect staged diff/ignored files; current GitHub policies; DCO commit, authorized task-branch push, Draft PR, exact-head CI and clean worktree.

Review focus: delayed result after switch; unmount/cancel; revoked persistence in another tab; corrupted/oversized storage; unsafe Markdown URLs/HTML; IME/mobile keyboard; no retry after uncertain inference.
