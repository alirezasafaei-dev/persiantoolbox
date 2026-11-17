# Next.js security patch plan

**Goal:** remove the verified Next.js production dependency advisory without
changing audit thresholds, suppressing findings or modifying application scope.

**Design:** update the existing Next.js dependency from 16.4.3 to the exact
official patch 16.4.5 and regenerate the pnpm lockfile. This is an existing
dependency update, not a new dependency. Keep the invoice fix independently
reviewable on its own branch. Official release and advisory identify 16.4.5 as
patched: https://github.com/vercel/next.js/releases/tag/v16.4.5 and
https://github.com/advisories/GHSA-mfr8-8qww-v76h.

- [ ] Run `pnpm update next@16.4.5 --save-exact`; inspect lockfile scope and package integrity metadata.
- [ ] Read installed Next.js guidance before any required compatibility code change. Do not modify application behavior speculatively.
- [ ] Run production dependency audit and its existing report validator. Retain genuine network failures separately from vulnerability results.
- [ ] Run `pnpm ci:quick`, `pnpm ci:contracts`, `pnpm build`, and canonical `pnpm smoke:local` with host 127.0.0.1 and port 3100.
- [ ] Review dependency diff, document results, run security/secret checks and licensing, sign and push a task commit, and prepare a PR.
- [ ] Require fresh exact-head hosted verification and owner release approval before production deployment. No existing gate may be weakened to make CI pass.

## Initial evidence

The existing main baseline audit reports one moderate Next.js finding and no
high/critical findings. PR291 security-audit failed on this baseline. Official
release notes list seven moderate security repairs. No live exploit is claimed.
The initial package update encountered registry ECONNRESET retries; preserve
the running handle and inspect terminal output before retrying.
