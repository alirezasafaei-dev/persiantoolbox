# Production dependency audit follow-up - 2026-10-31

A fresh strict production audit while verifying PR #245 reported two Moderate advisories and no High/Critical findings. The JSON command returned 1, so the previous zero-advisory checkpoint could not be reused.

- [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4): `glob` cancellation can leave filesystem traversal running after rejection; fixed in 14.0.2.
- [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249): `minimatch` pattern preprocessing can amplify CPU/memory consumption; fixed in 11.0.1.

`pnpm why --prod` traced both to the existing Sentry bundler dependency. This identifies the dependency path; no remotely exploitable application path is claimed.

## Correction

Use targeted pnpm overrides for `glob@13.0.6` to 14.0.2 and `minimatch@10.2.6` to 11.0.1. Retain unrelated legacy glob/minimatch ranges. The patched packages support the repository's Node 20 CI and Node 22/24 execution versions. Their major-version changes still require application build and smoke verification; compatible engine declarations alone are insufficient proof.

Regenerate and install the frozen lockfile. The dependency subtree also updates `path-scurry` to 3.0.0 and introduces transitive `@isaacs/nonrecursive-glob-match@1.0.3`; no direct dependency is added. The override's matching resolution also updates existing typedoc/test-exclude minimatch edges. No workflow, threshold, security hook or registry-error protection is weakened.

Security-floor assertions failed before the override and passed afterward. The combined focused invoice/security suite passed 34 tests. A fresh `pnpm audit --prod --audit-level=high --json` returned a valid report with all five severity counters zero and exit 0; the repository audit-report validator also exited 0. The route used the already-running local proxy in child-process environment variables only; no VPN, DNS or persistent proxy setting was changed.

Final sequential local gates passed on the combined dependency/invoice candidate: `pnpm ci:quick` (260 files / 1,941 tests), `pnpm ci:contracts`, `pnpm build`, and canonical standalone `pnpm smoke:local` (11 checks), all exit 0. The earlier dependency floor and strict audit failures were reproduced before correction. Repository secret scanning passed. Independent review and exact-head hosted results belong in the delivery receipt. This correction does not establish production deployment or complete PDF reader acceptance. PR #245 remains Draft with mixed-direction PDFium search unresolved.
