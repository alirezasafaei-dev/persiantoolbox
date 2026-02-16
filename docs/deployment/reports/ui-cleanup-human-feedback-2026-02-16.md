# UI Cleanup Report (Human QA Feedback)

- Date (UTC): 2026-02-16
- Scope: `persiantoolbox` only
- Out of Scope: `asdev-portfolio`

## Implemented Changes

1. Removed `validation-tools` from primary product surfaces:

- Main navigation
- Home quick tasks and category cards
- Popular/recent tool lists
- Breadcrumb map
- Tools registry category entries

2. Disabled standalone `validation-tools` route for active usage:

- `/validation-tools` now redirects to `/tools`.

3. Removed non-textual feature from text tools:

- Date conversion block removed from `text-tools` page.

4. Fixed financial tool card UI issues:

- Removed repeated `TOMAN` badges.
- Fixed icon wrapper class collision in shared `ToolCard`.

5. Simplified chrome:

- Removed secondary trust navigation block.
- Replaced footer with minimal compact footer.

## Verification

- Local quality gate: `pnpm ci:quick` -> passed
- Route behavior: `/validation-tools` -> `307` redirect to `/tools`

## Notes

- Dev server was started for manual QA and then stopped on request.
