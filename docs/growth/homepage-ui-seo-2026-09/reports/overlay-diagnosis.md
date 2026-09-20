# PT-04 overlay diagnosis

- Reproduced: `2026-09-20` on local Chromium against the isolated development server.
- Behavior change: **not implemented; owner approval is required**.

## Producer and timing

The install invitation is produced by `components/ui/ServiceWorkerRegistration.tsx`, mounted from `components/ui/ClientRuntimeBoot.tsx`; `SmartCTA` does not own it. `beforeinstallprompt` is deferred and the UI becomes eligible after `POPUP_TIMING.PWA_INSTALL_DELAY_MS` (45 seconds). The consent banner is independently mounted by `components/ui/ClientOverlays.tsx` and remains visible while `readAnalyticsConsent()` returns `null`.

## Controlled reproduction

The browser test dispatched a cancellable `beforeinstallprompt`, installed Playwright's controlled clock, then advanced 46 seconds after hydration.

| State | Consent banner | Install invitation | Result |
| --- | --- | --- | --- |
| Unknown consent, no install dismissal | visible | visible | Confirmed overlap risk |
| Accepted consent | hidden | visible | Expected independent invitation |
| Rejected consent | hidden | visible | Expected; rejection is a resolved choice, not acceptance |
| Unknown consent, `pwa-install-dismissed=1` | visible | hidden | Existing dismissal is preserved |

`SmartCTA` welcome additionally requires 45 seconds **and** 480px scroll with engagement count zero. Its z-index is 40, while consent and install use 50, so it can add another lower layer after the same time threshold when the user has scrolled. Exit intent requires 90 seconds, fine pointer and engagement count at least 3.

## Proposed change for separate approval

In `ServiceWorkerRegistration.tsx`, read the existing consent state before setting `showInstall`. While consent is `null`, keep the deferred install event but do not display it. Subscribe to `ANALYTICS_CONSENT_EVENT`; once either accepted **or rejected** state is written, re-evaluate the existing delay and dismissal gates. Event order:

1. Capture `beforeinstallprompt` and preserve `deferredPrompt`.
2. Wait for both the 45-second delay and a non-null consent state.
3. Re-read `pwa-install-dismissed`; if absent, show the install invitation.
4. Never write consent, enable analytics, reinterpret rejection as acceptance, or clear install dismissal.
5. Preserve `appinstalled`, install outcome and cleanup behavior.

Recommended tests should cover unknown + delay (hidden), accepted + delay (visible), rejected + delay (visible), and dismissed returning visitor (hidden). No timing code was changed in this PR candidate.
