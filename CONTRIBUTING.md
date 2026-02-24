# Contributing

All commits must be signed with a `Signed-off-by` trailer.
Governance references:

- DCO.md
- docs/licensing/cla-individual.md
- docs/licensing/cla-corporate.md

Quality and security checks before PR:

- `pnpm lint`
- `pnpm test:ci`
- `pnpm build`
- `pnpm typecheck`
- `pnpm security:secrets`
- `pnpm security:scan`
