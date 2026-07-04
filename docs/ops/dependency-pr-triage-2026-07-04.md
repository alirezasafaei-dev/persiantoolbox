# Dependency PR Triage — 2026-07-04

## Open PRs Reviewed (from gh pr list)
- #88: @commitlint/cli 21.0.2 → 21.1.0 (dev, LOW risk)
- #87: @vitest/coverage-v8 2.1.8 → 2.1.9 (dev, LOW)
- #86: tsx 4.21.0 → 4.22.4 (dev, LOW)
- #85: prettier 3.8.4 → 3.9.1 (dev, LOW)
- #84: tailwindcss 3.4.19 → 4.3.2 (runtime, HIGH — hold until staging + visual regression healthy)
- #83: semantic-release 23.1.1 → 25.0.5 (build/release, HIGH — hold until release pipeline reviewed)
- #82: autoprefixer (dev, LOW)
- #81: lint-staged (dev, LOW)
- #80: @next/bundle-analyzer (dev, LOW)
- #79: testing-stack group (MEDIUM — run full tests)
- Others non-dep.

## Classification and Recommendations
- Tailwind 4: HIGH risk. Hold. Requires visual regression + staging.
- semantic-release 25: HIGH. Hold. Pipeline review needed.
- Testing stack: MEDIUM. Recommend after full vitest + e2e.
- Patch/minor dev: LOW/MEDIUM. Can merge after tests pass.
- No auto-merge.

## Special Rules Applied
- Tailwind major: HIGH, hold.
- semantic-release major: HIGH, hold.

## Next
Re-triage after staging restore.
