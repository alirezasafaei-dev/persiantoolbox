# Merge Runbook

## Merge requirements
- CI checks must be green
- At least 1 approving review is required
- CODEOWNERS review is required where applicable
- PR conversations should be resolved (or explicitly non-blocking)

## Before merging
- PR is up to date with `main`
- All required checks are passing
- Review decision: Approved (non-author)

## Merge strategy
Use the repository’s default merge method (recommended: Squash & merge for clean history).

## After merging
- Confirm `main` checks are green on the merge commit
- Pull latest `main` locally
- Tag a release candidate or patch if applicable
