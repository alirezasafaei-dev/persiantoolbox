# PersianToolbox AI — Remaining access / owner gates only

Canonical repository: `alirezasafaei-dev/persiantoolbox`.
PR: [#211](https://github.com/alirezasafaei-dev/persiantoolbox/pull/211).
Issue: [#210](https://github.com/alirezasafaei-dev/persiantoolbox/issues/210).

## Already completed by ChatGPT / do not repeat

- Live Iranian VPS → direct Workers AI Persian inference was validated by Codex, see the earlier report.
- Exact application quota INSERT/UPDATE SQL and migration were tested in an **isolated PostgreSQL 16 database within the authorized Windows WSL Ubuntu**. Concurrent admission and transaction rollback passed. This does **not** replace an application-to-Postgres integration test.
- The enabled Persian chat UI was exercised by Playwright/Chromium **with mocked backend**. Send, Persian response, rate-limit error, reset, 375px mobile and Axe serious/critical checks passed.
- Long-conversation input cap fixed; privacy/trust disclosure scoped to AI; sitemap and internal AI links gated on activation.
- Review branch and its newest reports before taking action.

## Remaining Codex scope (only if required permission becomes available)

### GATE-A — dedicated Cloudflare token (requires owner-authorized Cloudflare admin access)

1. Use the owner's existing authenticated Cloudflare session, or request a one-time owner interaction. Do **not** extract browser cookies or take credentials from another project.
2. Create a **new, account-scoped, least-privilege token** limited to Workers AI read/inference. Do not modify existing Novax Workers, KV, D1, routes or account plan.
3. Save the new token only in the approved protected secret store. Do not put it in stdout, CLI args, GitHub, screenshots, logs, prompt, diff or an unencrypted config file.
4. Read current Workers plan in dashboard again. Record `OWNER_CONFIRMED` if it can be seen by owner, `API_VERIFIED` only if the authorized billing API actually confirms tier. Any change to Paid **blocks rollout**.
5. Verify only that new token can perform one bounded free-model inference from Iran after accounting protections. Do not request paid models or any auto-charge features.

**Current status:** BLOCKED — the accessible legacy credential can invoke AI but lacks Token Edit/Subscription Read permissions. A programmatic attempt must stop on 403; do not work around admin restrictions.

### GATE-B — native Node.js DB integration / authorized staging — COMPLETE

1. Set up a dedicated and authorized nonproduction PostgreSQL instance (do not connect tests to prod).
2. Prove Next.js `POST /api/ai/chat` with real test DB, explicit feature flags and a **mock provider** while preventing external AI calls.
3. Test signed visitor persistence, 2/minute same visitor, 5/minute global, 5/day per visitor, 40/day global, all quota rollback under 20 concurrent HTTP requests, and clear failure if DB is down.
4. Verify no raw prompts are written to DB/logs and retry/503/429 behavior remains safe.
5. Record exact PASS/FAIL/NOT_RUN and tests in PR. Do not downgrade mocks to “live Cloudflare” evidence.

**Current status:** DONE on 2026-10-08 in an isolated PostgreSQL 16 cluster. The full HTTP → Next.js route → signed cookie → transactional quota service → PostgreSQL → loopback mock provider → Persian response chain passed, including 20 concurrent requests, exact quota caps, rollback, database outage/503, recovery, secret/prompt log checks, and disabled-feature fail-closed behavior. See [the final integration report](reports/AI_CHAT_FINAL_INTEGRATION_AND_ACCESS_GATES_2026-10-08.md). Production DB remained untouched.

### GATE-C — owner-only merge and release approval

- The owner must separately approve PR merge, controlled production DB migration, production deploy via the documented blue/green workflow, protected env values and public feature activation.
- Never treat approval of this test mission as authority to merge, deploy, switch traffic, restart production or alter Novax.
- Keep `FEATURE_AI_CHAT_ENABLED=false` before final review; public route stays noindex when off. Confirm Workers Free immediately before enabling.
- Production rollout order: reviewed DCO PR → merge approval → authorized DB migration and backups → deploy approval → blue-green deploy → isolated smoke → **separate** feature-flag enable approval → verified live UX and cost monitoring.

## Reporting

Update PR #211 and Issue #210, without exposing credentials, with `FINAL_STATUS`, new commit SHA, tested commands, exact blockers, and evidence. Do not open duplicate issues or create unrelated workflows.
