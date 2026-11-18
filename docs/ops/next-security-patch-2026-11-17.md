# Next.js security patch - 2026-11-17

The unchanged main baseline resolved Next.js 16.4.3 and reported one moderate
production dependency finding, GHSA-mfr8-8qww-v76h. The official
[16.4.5 release](https://github.com/vercel/next.js/releases/tag/v16.4.5)
contains the security correction. No live exploit is claimed.

Pin the existing Next.js dependency to 16.4.5 and regenerate the pnpm 9.15.0
lockfile. Associated platform SWC/env packages and Next peer identities change.
Resolution also refreshes caniuse-lite, tslib through @swc/helpers and the
protobufjs type-only @types/node edge. No direct dependency is added, no audit
threshold or security workflow is changed, and no application code is modified.

Verification on the patch candidate:

- Installed Next.js version: 16.4.5.
- Frozen lockfile validation: PASS.
- Production dependency audit and existing report validator: PASS, zero in all five severity classes.
- `pnpm ci:quick`: PASS, 2,217 tests in 288 files; lint retains existing warnings.
- `pnpm ci:contracts`: PASS.
- `pnpm build`: PASS.
- Canonical `pnpm smoke:local`, 127.0.0.1:3100: PASS, 11 standalone routes.

The installer initially retried registry ECONNRESET errors and then completed.
The existing Storybook 8 Next peer-range warning persists; Storybook acceptance
was not run. No claim of full Storybook compatibility is made. Production,
hosted exact-head checks and post-deploy browser acceptance remain separate.

The invoice localized-number candidate is PR #292, independently reviewed and
not included in this dependency patch. Do not infer a production repair from
local results, or retry old release workflows on unpatched source.
