# Growth Quality Pass — Implementation Plan

> **For agentic workers:** Use compose:subagent to implement this plan task-by-task.

**Goal:** Unlock hidden SEO value, fix stale data, improve error UX, and add loading skeletons.

**Architecture:** 5 independent micro-tasks — each touches different files, no cross-dependencies.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, React Suspense

---

### Task 1: Unlock 4 Hidden Tools from SEO

**Covers:** SEO growth — 4 high-value financial tool pages currently deindexed

**Files:**

- Modify: `lib/tools-registry.ts` (4 entries: bank-rate-comparator, living-cost, rent-vs-buy, loan-vs-investment)

- [ ] **Step 1:** Change `indexable: false` → `indexable: true` for all 4 tools
- [ ] **Step 2:** Run `pnpm typecheck && pnpm vitest --run` to verify
- [ ] **Step 3:** Commit

---

### Task 2: Remove Duplicate Page Numbers Tool

**Covers:** SEO — eliminate duplicate content for "add page numbers" feature

**Files:**

- Modify: `lib/tools-registry.ts` (remove `paginate-add-page-numbers` entry or merge into `add-page-numbers`)

- [ ] **Step 1:** Identify which entry is newer/better, remove the older duplicate
- [ ] **Step 2:** Verify no other files reference the removed path
- [ ] **Step 3:** Run typecheck + tests
- [ ] **Step 4:** Commit

---

### Task 3: Fix Hardcoded Social Proof Counter

**Covers:** Trust signals — remove stale hardcoded numbers

**Files:**

- Modify: `components/HomePage.tsx` (line ~185)

- [ ] **Step 1:** Replace hardcoded "۱۲,۵۰۰" with a dynamic count from tool registry or remove the specific number
- [ ] **Step 2:** Run typecheck + tests
- [ ] **Step 3:** Commit

---

### Task 4: Improve Error Page Navigation

**Covers:** Error UX — global error boundary needs proper navigation

**Files:**

- Modify: `app/error.tsx`

- [ ] **Step 1:** Add homepage link + tools link + back button to error boundary
- [ ] **Step 2:** Match styling with 404 page pattern
- [ ] **Step 3:** Run typecheck + tests
- [ ] **Step 4:** Commit

---

### Task 5: Add Loading Skeletons

**Covers:** Perceived performance — Suspense loading states

**Files:**

- Create: `app/loading.tsx` (global loading skeleton)
- Modify: `app/(tools)/tools/page.tsx` (wrap in Suspense)
- Modify: `app/(tools)/image-tools/page.tsx` (wrap in Suspense)
- Modify: `app/(tools)/text-tools/page.tsx` (wrap in Suspense)

- [ ] **Step 1:** Create global `app/loading.tsx` with skeleton UI
- [ ] **Step 2:** Wrap category pages in Suspense boundaries
- [ ] **Step 3:** Run typecheck + tests
- [ ] **Step 4:** Commit

---

## Final Verification

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm vitest --run` — 435 tests pass
- [ ] `pnpm build` — successful
