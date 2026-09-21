# Homepage Next Phase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put homepage task routes earlier on mobile, prove search-placeholder contrast, coordinate the PWA install invitation with resolved consent, and close or evidence-gate the remaining GSC work.

**Architecture:** Keep the existing homepage components and move one existing section without duplicating content. Add browser-level measurements for order, offset, zoom, overflow, and rendered placeholder contrast. In `ServiceWorkerRegistration`, coordinate existing prompt, delay, dismissal, installation, and consent signals through refs and one eligibility function while preserving independent consent semantics.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4, CSS Modules, Vitest/jsdom, Testing Library, Playwright, pnpm 9.

## Global Constraints

- Persian RTL, light/dark themes, keyboard access, body-text size, complete essential copy, and touch targets must be preserved.
- Keep all six existing task labels, destinations, icons, search behavior, URLs, privacy choices, PWA delay, and install dismissal behavior.
- Placeholder contrast must be measured in rendered light and dark themes and must be at least 4.5:1; change only scoped search styling if measurement fails.
- Accepted and rejected v2 consent both resolve the install gate; unknown or invalid consent does not.
- The install component must not write consent, enable analytics, or reinterpret rejection.
- Raw GSC exports and private queries stay outside the public repository; do not invent unavailable metrics.
- No new dependency, global palette change, pricing/payment/tool change, merge, workflow dispatch, staging change, or production deployment.
- Every commit uses DCO sign-off. Work remains in `D:\My_Projects\persiantoolbox-home-next-phase` on `feat/home-next-phase-20260920`.

---

## File map

- `components/HomePage.tsx`: owns homepage section order; only the existing task and value-proof blocks move.
- `components/ui/ServiceWorkerRegistration.tsx`: owns PWA prompt capture, delay, consent eligibility, dismissal, outcome, and cleanup.
- `tests/e2e/home-next-phase.spec.ts`: owns mobile section-order/offset measurements, zoom/overflow checks, and rendered placeholder-contrast measurements.
- `tests/components/ServiceWorkerRegistration.test.tsx`: owns consent/install state-transition and storage-failure regression coverage.
- `docs/growth/homepage-ui-seo-2026-09/reports/next-phase-candidate.md`: records before/after measurements, screenshots, checks, exact SHAs, GSC evidence state, and release boundaries.
- `docs/growth/homepage-ui-seo-2026-09/reports/next-phase/screenshots/`: stores the four approved mobile theme screenshots and the 200% zoom screenshot.

### Task 0: Make the existing Playwright server command cross-platform

**Files:**

- Modify: `playwright.config.ts`
- Create: `tests/unit/playwright-config.test.ts`

**Interfaces:**

- Consumes: Playwright 1.63 `webServer.env` support.
- Produces: the same development server variables without POSIX-only inline assignment syntax.

- [ ] **Step 1: Write and run a failing config contract**

Import the Playwright config, assert the development server command does not begin with inline environment assignments, and assert `webServer.env` contains the test allowlist and analytics ID. Run the focused Vitest file and expect failure on the current POSIX-prefixed command.

- [ ] **Step 2: Move test variables to `webServer.env`**

Keep the Next.js command unchanged apart from removing the inline assignments. Add `env` only for the development server, preserving `process.env` plus the two test values.

- [ ] **Step 3: Verify the contract and a real Playwright startup**

Run the focused Vitest contract and then the mobile RED test. The contract must pass and Playwright must reach the actual assertion rather than fail during server startup. Commit this prerequisite with the next GREEN task so the branch is never intentionally red.

### Task 1: Establish mobile and contrast RED evidence

**Files:**

- Create: `tests/e2e/home-next-phase.spec.ts`
- Create: `docs/growth/homepage-ui-seo-2026-09/reports/next-phase-candidate.md`

**Interfaces:**

- Consumes: homepage headings `#task-heading`, `.tool-search-input`, and the existing value-proof section.
- Produces: Playwright measurements `{ width, taskHeadingTop, firstTaskTop, firstValueProofTop }` and `{ theme, foreground, background, ratio }` written to test output and the candidate report.

- [ ] **Step 1: Write the failing order and offset test**

Add a Playwright test that sets resolved rejected consent before navigation, iterates over 360×800 and 390×844, and evaluates document offsets:

```ts
const taskHeading = page.locator('#task-heading');
const taskSection = taskHeading.locator('xpath=ancestor::section[1]');
const firstTask = taskSection.locator('a').first();
const firstValueProof = page.locator('section[aria-label="مزیت‌های شروع رایگان"] article').first();

const metrics = await page.evaluate(() => {
  const top = (selector: string) =>
    Math.round(document.querySelector(selector)!.getBoundingClientRect().top + scrollY);
  return {
    taskHeadingTop: top('#task-heading'),
    firstTaskTop: Math.round(
      document
        .querySelector('#task-heading')!
        .closest('section')!
        .querySelector('a')!
        .getBoundingClientRect().top + scrollY,
    ),
    firstValueProofTop: top('section[aria-label="مزیت‌های شروع رایگان"] article'),
  };
});

expect(metrics.firstTaskTop).toBeLessThan(metrics.firstValueProofTop);
await expect(firstTask).toBeVisible();
```

Also assert `document.documentElement.scrollWidth <= innerWidth` and that the task heading precedes the value-proof section in DOM order.

- [ ] **Step 2: Run the mobile test and capture RED**

Run:

```powershell
$env:PLAYWRIGHT_SKIP_FIREFOX='1'
pnpm exec playwright test tests/e2e/home-next-phase.spec.ts --project=chromium --grep "task routes precede"
```

Expected: FAIL because the current value-proof section precedes the task section. Record both current offsets in `next-phase-candidate.md`; do not edit production markup yet.

- [ ] **Step 3: Add rendered contrast measurement**

In the same test file, add helpers that parse `rgb()`/`rgba()`, alpha-composite transparent ancestors until an opaque background is reached, linearize sRGB channels, and calculate `(lighter + 0.05) / (darker + 0.05)`. Force `LazyToolSearch` to load by clicking its preparation button, then read:

```ts
const input = page.getByRole('combobox', { name: 'جستجوی ابزار' });
const colors = await input.evaluate((element) => ({
  foreground: getComputedStyle(element, '::placeholder').color,
  inputBackground: getComputedStyle(element).backgroundColor,
  parentBackground: getComputedStyle(element.parentElement!).backgroundColor,
}));
```

Run in light and dark themes and assert each computed ratio is at least `4.5`.

- [ ] **Step 4: Run contrast measurement and classify the result**

Run:

```powershell
pnpm exec playwright test tests/e2e/home-next-phase.spec.ts --project=chromium --grep "placeholder contrast"
```

Expected: either PASS with measured ratios, requiring no production color change, or FAIL below 4.5:1, which authorizes only the scoped correction described in Task 2. Record exact colors and ratios.

- [ ] **Step 5: Keep RED evidence uncommitted**

Confirm the working tree contains only the new test and report. Do not commit an intentionally failing test; retain the observed RED output in the report and carry both files into the GREEN commit in Task 2.

### Task 2: Move task routes earlier and prove mobile acceptance

**Files:**

- Modify: `components/HomePage.tsx`
- Modify only if contrast fails: the scoped search rule owner found by `rg -n "tool-search-input" app components shared -g '*.css' -g '*.tsx'`
- Modify: `tests/e2e/home-next-phase.spec.ts`
- Modify: `docs/growth/homepage-ui-seo-2026-09/reports/next-phase-candidate.md`
- Create: `docs/growth/homepage-ui-seo-2026-09/reports/next-phase/screenshots/*.png`

**Interfaces:**

- Consumes: RED acceptance from Task 1.
- Produces: task-first homepage DOM order and verified light/dark placeholder contrast without altered link labels or destinations.

- [ ] **Step 1: Move the existing task section**

In `components/HomePage.tsx`, move the entire `section[aria-labelledby="task-heading"]` block so it appears immediately after `<HomeHero toolCount={totalToolsCount} />`. Move the value-proof section unchanged to follow it. Do not duplicate or rewrite either block.

- [ ] **Step 2: Apply a scoped contrast fix only if Task 1 failed**

If a rendered theme is below 4.5:1, add a `::placeholder` rule scoped to `.tool-search-input` in its existing stylesheet. Select the closest existing semantic foreground token that produces at least 4.5:1 in both themes. If Task 1 passed, make no CSS change and record `NO_CHANGE_REQUIRED`.

- [ ] **Step 3: Run the focused GREEN tests**

Run:

```powershell
pnpm exec playwright test tests/e2e/home-next-phase.spec.ts tests/e2e/home.spec.ts --project=chromium
```

Expected: PASS for order, offsets, contrast, search, CTA, and narrow-width overflow. Confirm the before/after first-task offset decreases at both widths.

- [ ] **Step 4: Verify zoom, keyboard order, and touch targets**

Extend the focused test to set `document.documentElement.style.zoom = '2'`, verify no horizontal overflow at a 360px viewport, Tab from the hero into the first task link in DOM order, and assert each task link bounding box has height at least 44px.

Run the test again and expect PASS.

- [ ] **Step 5: Capture candidate screenshots**

Capture full-page screenshots at 360×800 and 390×844 in both light and dark themes, plus 360×800 at 200% zoom, under `reports/next-phase/screenshots/`. Set consent before navigation so overlays do not invalidate layout evidence.

- [ ] **Step 6: Run focused static checks and commit**

Run:

```powershell
pnpm exec prettier --check components/HomePage.tsx tests/e2e/home-next-phase.spec.ts docs/growth/homepage-ui-seo-2026-09/reports/next-phase-candidate.md
pnpm typecheck
git diff --check
```

Expected: PASS. Then commit:

```powershell
git add components/HomePage.tsx tests/e2e/home-next-phase.spec.ts docs/growth/homepage-ui-seo-2026-09/reports/next-phase-candidate.md docs/growth/homepage-ui-seo-2026-09/reports/next-phase/screenshots
git commit -s -m "feat(home): prioritize mobile task access"
```

### Task 3: Coordinate consent and install invitation with TDD

**Files:**

- Create: `tests/components/ServiceWorkerRegistration.test.tsx`
- Modify: `components/ui/ServiceWorkerRegistration.tsx`
- Modify: `docs/growth/homepage-ui-seo-2026-09/reports/next-phase-candidate.md`

**Interfaces:**

- Consumes: `readAnalyticsConsent()`, `ANALYTICS_CONSENT_EVENT`, `POPUP_TIMING.PWA_INSTALL_DELAY_MS`, and `pwa-install-dismissed`.
- Produces: install eligibility requiring deferred prompt + elapsed delay + resolved v2 consent + no dismissal + not installed.

- [ ] **Step 1: Build the component test harness**

Use Testing Library, fake timers, a resolved `navigator.serviceWorker.register`, and a cancellable event augmented with `prompt` and `userChoice`:

```ts
function dispatchInstallPrompt(outcome: 'accepted' | 'dismissed' = 'dismissed') {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
    prompt: ReturnType<typeof vi.fn>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });
  window.dispatchEvent(event);
  return event;
}
```

Clear storage before each test, use `vi.useFakeTimers()`, and restore timers and navigator properties after each test.

- [ ] **Step 2: Write and verify the unknown-consent RED test**

Render the component, dispatch the prompt, advance `PWA_INSTALL_DELAY_MS`, and assert `screen.queryByText('نصب اپلیکیشن')` is null.

Run:

```powershell
pnpm vitest --run tests/components/ServiceWorkerRegistration.test.tsx -t "keeps install hidden while consent is unknown"
```

Expected: FAIL because current code displays the invitation after the delay.

- [ ] **Step 3: Add accepted/rejected event, dismissal, installation, and cleanup tests**

For accepted and rejected states, first assert hidden after the prompt and delay, call `writeAnalyticsConsent()` with the corresponding v2 state, then assert visible. Add tests proving an existing dismissal remains hidden, `appinstalled` hides and persists dismissal, a throwing `localStorage.getItem` does not crash, and `unmount()` removes the consent listener.

Run the file and confirm failures are caused by missing consent coordination or unsafe dismissal reads, not test setup.

- [ ] **Step 4: Implement minimal consent-aware eligibility**

In `ServiceWorkerRegistration.tsx`:

```ts
import { ANALYTICS_CONSENT_EVENT, readAnalyticsConsent } from '@/shared/consent/analyticsConsent';

const consentResolvedRef = useRef(false);

function isInstallDismissed(): boolean {
  try {
    return localStorage.getItem('pwa-install-dismissed') === '1';
  } catch {
    return false;
  }
}
```

Inside the effect, initialize `consentResolvedRef.current = readAnalyticsConsent() !== null`. Define `maybeShowInstall()` to require `pendingPromptRef.current`, `installDelayPassedRef.current`, `consentResolvedRef.current`, and `!isInstallDismissed()`. Call it after prompt capture, delay completion, and `ANALYTICS_CONSENT_EVENT`. Register and remove the consent listener with the existing install listeners. Clear pending prompt state on install, dismissal, and accepted/dismissed `userChoice` completion.

- [ ] **Step 5: Run GREEN and regression tests**

Run:

```powershell
pnpm vitest --run tests/components/ServiceWorkerRegistration.test.tsx tests/unit/analytics-consent.test.ts tests/unit/service-worker-registration-contract.test.ts
```

Expected: PASS with no React act errors or leaked fake timers.

- [ ] **Step 6: Run controlled overlay E2E and commit**

Add or reuse a Playwright test that dispatches `beforeinstallprompt`, advances the controlled clock beyond 45 seconds, and verifies unknown/accepted/rejected/dismissed/appinstalled states. Expect no simultaneous consent and install invitation.

Then run formatting, typecheck, and `git diff --check`, update the candidate report, and commit:

```powershell
git add components/ui/ServiceWorkerRegistration.tsx tests/components/ServiceWorkerRegistration.test.tsx tests/e2e/home-next-phase.spec.ts docs/growth/homepage-ui-seo-2026-09/reports/next-phase-candidate.md
git commit -s -m "fix(pwa): defer install prompt until consent resolves"
```

### Task 4: Evidence-gate GSC/GEO and finish the candidate

**Files:**

- Modify: `docs/growth/homepage-ui-seo-2026-09/reports/next-phase-candidate.md`
- Modify if PR #48 has merged before finalization: `docs/growth/homepage-ui-seo-2026-09/TASKS.md`

**Interfaces:**

- Consumes: authorized GSC data if available, all previous task evidence, and current GitHub remote truth.
- Produces: an honest `DONE` or `BLOCKED` GSC status and a reviewable exact-head candidate.

- [ ] **Step 1: Check authorized GSC availability without exposing secrets**

Inspect only relevant variable names plus set/empty state and length; do not print values. Check whether an authorized local export path or authenticated repository command exists. If no valid source is available, record `BLOCKED` with the exact required export fields and continue. Do not query private data through an unapproved account.

- [ ] **Step 2: Analyze only if complete authorized input exists**

For complete current/prior 28-day exports, compute page/query deltas and segment by country/device, reconcile Page indexing reasons, and record source-backed priorities. Keep raw rows outside git. If any required date/property/filter metadata is missing, retain `BLOCKED` rather than producing partial claims.

- [ ] **Step 3: Run final repository gates**

Run, in order:

```powershell
pnpm ci:quick
pnpm ci:contracts
pnpm build
$env:SMOKE_HOST='127.0.0.1'; $env:SMOKE_PORT='3100'; pnpm smoke:local
$env:PLAYWRIGHT_SKIP_FIREFOX='1'; pnpm exec playwright test tests/e2e/home-next-phase.spec.ts tests/e2e/home.spec.ts tests/e2e/mobile-ux.spec.ts --project=chromium
pnpm exec prettier --check components/HomePage.tsx components/ui/ServiceWorkerRegistration.tsx tests/components/ServiceWorkerRegistration.test.tsx tests/e2e/home-next-phase.spec.ts docs/growth/homepage-ui-seo-2026-09/reports/next-phase-candidate.md
git diff --check
pnpm licensing:validate
```

Expected: all applicable gates PASS. Record any environment-specific NOT_RUN/FAIL exactly; do not weaken a test or gate.

- [ ] **Step 4: Finalize evidence and commit**

Record exact base/head SHAs, changed files, before/after offsets, contrast ratios, screenshot paths, consent/install matrix, commands and exit codes, GSC status, `MERGED: no`, and `DEPLOYED: no`.

If PR #48 is still open, do not edit its overlapping task board; keep status in the new report and issue #47. Commit:

```powershell
git add docs/growth/homepage-ui-seo-2026-09/reports/next-phase-candidate.md docs/growth/homepage-ui-seo-2026-09/TASKS.md
git commit -s -m "docs: record homepage next-phase evidence"
```

- [ ] **Step 5: Push and open a non-merged PR**

Push `feat/home-next-phase-20260920`, open a PR against current `main`, list exact local evidence, and state that owner merge approval and all deployment approval are absent. Wait for exact-head CI and update issue #47 with links and results. Do not merge or deploy.

---

## Plan self-review result

- Spec coverage: mobile order/measurement, contrast, consent/install states, GSC evidence gate, tests, signed commits, reporting, and release boundaries all map to Tasks 1–4.
- Placeholder scan: no deferred implementation markers or undefined helper names remain.
- Type consistency: consent event/key names match `shared/consent/analyticsConsent.ts`; timing name matches `POPUP_TIMING.PWA_INSTALL_DELAY_MS`; selectors match existing homepage markup.
- Execution mode: inline via `superpowers:executing-plans` because this session is not authorized to dispatch subagents.
