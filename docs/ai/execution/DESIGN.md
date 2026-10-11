# PersianToolbox AI workspace — 2026-10-11

Owner brief: the attached master mission authorizes autonomous design, implementation, tests, signed commits, task-branch pushes and Draft PRs. Merge/deployment and production changes require separate approval.

## Product design

Dedicated full-height RTL application at `/ai/chat`, replacing the marketing shell. Desktop sidebar (280px) and compact header; mobile native dialog navigation; one scrollable transcript and docked, safe-area-aware composer. Preserve existing semantic theme tokens, Vazirmatn and restrained blue identity. Native controls with visible focus and 44px targets. Empty state offers three prompts that populate and focus the composer.

Messages remain selectable. Assistant Markdown uses the existing remark parser and an allowlisted React renderer: no raw HTML, remote images or unsafe schemes. Code is LTR, independently scrollable, with real copy controls. No simulated streaming or unsupported model selection.

Composer: 1800 UTF-16 units, Enter/Shift+Enter, IME guard, bounded auto-height, synchronous request guard, 35-second client deadline, explicit stop, restored draft on failure. Cancellation cannot confirm cancellation upstream and may consume quota. Stale results cannot modify another conversation. Errors are localized by HTTP status; upstream text is never displayed.

## Local sessions and privacy

Multiple sessions, per-session drafts, rename/delete/clear actions. Memory-only by default. Explicit checkbox opts into browser-local persistence, with clear erasure/revocation and shared-device warning. Limit to 20 conversations and 100 turns each; validate version, field types, roles, lengths and total storage size before restoration. No server transcript storage or synchronization. Cross-tab revocation must stop this tab writing old history back; other-tab edits must not silently overwrite drafts. Backend context remains only two preceding exchanges (older turns truncated to 400 units).

## Backend and separate image workstream

Keep fixed Cloudflare provider, non-stream JSON, signed visitor, origin checks, PostgreSQL transaction quotas (5/visitor/day, 2/minute, 40/global/day, 5/minute), 16KB body, provider deadline, free-plan attestation and no paid fallback. No database migration for this UI.

Image PR #229 and issue #230 remain independent/default-off. Current issue reports provider HTTP 403 and unresolved permission; repeat inference only after that external access gate is resolved. WSL evidence is not Iran-host acceptance.

## Acceptance

Focused unit/API tests, repeated Chromium mocked journeys, ten widths 320–1920px, light/dark, keyboard/dialog, axe, safe rendering, local deletion, stale/cancelled requests. Full existing quick/contracts/build/standalone-smoke/licensing/security gates. Screenshots are actual browser renders. Record any physical keyboard, provider, database, performance or hosted-CI gaps explicitly. Production ready only after applicable gates pass; owner visual/release acceptance remains distinct.
