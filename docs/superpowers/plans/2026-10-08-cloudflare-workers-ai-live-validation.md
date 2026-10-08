# Cloudflare Workers AI Live Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate and harden the PersianToolbox online Persian chat MVP against the real Cloudflare Workers AI Free service from the Iran VPS.

**Architecture:** Keep the browser on the same-origin PersianToolbox API, use one fixed Cloudflare-hosted chat model through the direct account REST endpoint, and consume atomic PostgreSQL quota before inference. Keep the feature disabled until owner-authorized database migration, protected environment configuration, merge, and deployment.

**Tech Stack:** Next.js 16, TypeScript, React, PostgreSQL, Vitest, Playwright, Cloudflare Workers AI REST API.

**Spec:** `docs/ai/ONLINE_CHAT_MVP_2026-10-08.md`

## Global Constraints

- Use only `@cf/zai-org/glm-4.7-flash`; no model fallback or AI Gateway route.
- Keep `FEATURE_AI_CHAT_ENABLED=false` outside isolated tests.
- Never print, copy, commit, or upload credential values.
- Do not migrate production, deploy, merge, restart services, or enable public AI.
- Record every required check as PASS, FAIL, BLOCKED, or NOT_RUN.

---

### Task 1: Live Provider Contract

**Files:**

- Modify: `lib/ai/providers/cloudflare.ts`
- Test: `lib/ai/providers/cloudflare.test.ts`

**Interfaces:**

- Consumes: `OnlineChatProvider.completeChat(messages, signal)`
- Produces: one direct REST request returning `ChatReply` or `AiProviderError`

- [x] Add failing tests for reasoning-disabled requests and 401/403/5xx classification.
- [x] Run `pnpm vitest --run lib/ai/providers/cloudflare.test.ts` and observe the intended failures.
- [x] Add `chat_template_kwargs.enable_thinking=false`, keep one fixed model, and classify only 429 as throttling.
- [x] Re-run the focused provider tests.

### Task 2: Quota and UI Verification

**Files:**

- Test: `lib/ai/quota.test.ts`
- Test: `components/ai/ChatWorkspace.test.tsx`
- Test: `tests/e2e/ai-chat.spec.ts`

**Interfaces:**

- Consumes: `consumeAiQuota`, `getOrCreateAiVisitor`, and `ChatWorkspace`
- Produces: regression evidence for atomic caps, fail-closed database behavior, RTL, mobile, keyboard, and accessibility behavior

- [x] Add transaction and database-failure quota tests.
- [x] Add Persian keyboard/copy/reset component tests.
- [ ] Add stable enabled-state mobile Playwright coverage with an intercepted same-origin API response; current Playwright evidence covers the disabled rollout gate, while jsdom covers keyboard/response behavior.
- [x] Run focused Vitest and Playwright checks.

### Task 3: Security and Release Evidence

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `docs/ai/ONLINE_CHAT_MVP_2026-10-08.md`
- Create: `docs/ai/reports/CLOUDFLARE_WORKERS_AI_IR_LIVE_VALIDATION_2026-10-08.md`

**Interfaces:**

- Consumes: live Cloudflare/VPS measurements and repository security gates
- Produces: owner-reviewable, secret-free GitHub evidence

- [x] Verify official Free allocation/model eligibility and direct REST routing.
- [x] Run limited Persian inference from the Iran VPS without exposing credentials.
- [x] Patch dependency versions required by the repository security gate.
- [x] Run `pnpm ci:quick`, `pnpm ci:contracts`, `pnpm build`, AI tests, Playwright, secret scan, and dependency audit.
- [x] Record exact outcomes and remaining owner-only gates in both AI documents.
- [ ] Inspect staged content, create a DCO-signed commit, push the existing PR branch, and update PR #211.
