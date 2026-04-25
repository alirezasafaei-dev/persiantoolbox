# Performance Delta Report (2026-02-16)

## Command
- `pnpm lighthouse:ci`
- Re-run after quick tuning attempt: `pnpm lighthouse:ci`

## Result Summary
- SEO/A11y/Best-Practices assertions: passed
- Performance assertion (`minScore=0.82`): warnings on multiple routes

## Warning Routes
- `/tools` -> 0.76
- `/topics` -> 0.74
- `/pdf-tools/merge/merge-pdf` -> 0.75
- `/image-tools` -> 0.76
- `/date-tools` -> 0.75
- `/loan` -> 0.75
- `/salary` -> 0.74

## Decision
- Status: `warning`
- Action: keep as optimization backlog before stricter release policy.
- Note: re-run on 2026-02-16 showed no material score lift on target routes.
