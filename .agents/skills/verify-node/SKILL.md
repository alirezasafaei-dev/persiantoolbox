# verify-node

## Goal
Verify Node.js, package manager tooling, and lockfile health before running CI.

## Steps
1. Run `node -v`, `npm -v`, and `pnpm -v` (or the repo package manager).
2. Validate lockfile presence and consistency with the package manager.
3. Capture actionable fixes if versions or lockfiles are out of policy.
