# Deprecation Policy

## Policy

- No breaking removals without a published migration path.
- Deprecated routes/features must be documented with replacement and sunset date.
- Minimum deprecation period: one minor release cycle.

## Required Metadata

Each deprecation notice must include:

- affected route/API/component
- replacement path
- first deprecated version
- planned removal version

## Enforcement

PRs introducing deprecations must update:

- `MIGRATION.md`
- `docs/migration/redirect-map.csv` (if URL-related)
- `CHANGELOG.md`
