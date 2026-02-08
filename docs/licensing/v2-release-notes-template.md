# Release Notes Template — License Migration (`v2.0.0`)

## Summary

Starting from `v2.0.0`, Persian Tools is distributed under a dual-license model:

- Non-Commercial license (free)
- Commercial license (paid)

## Version Boundary

- `<= v1.1.x`: MIT (unchanged)
- `>= v2.0.0`: Dual-licensed

## What Changed

1. `LICENSE` updated for dual-license boundary.
2. `package.json#license` changed to `SEE LICENSE IN LICENSE`.
3. Licensing docs synced in `docs/licensing/`.

## Contributor Governance

- External contributions follow `DCO + CLA` hybrid policy.
- See:
  - `DCO.md`
  - `docs/licensing/cla-individual.md`
  - `docs/licensing/cla-corporate.md`
  - `docs/licensing/cla-operations.md`

## Validation

- `pnpm licensing:validate`
- `pnpm ci:contracts`

## Notes

- Prior MIT releases remain MIT-licensed.
