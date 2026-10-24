# Deployment dependency security checkpoint — 2026-10-23

PR #243 was merged, but its production deployment stopped at the unchanged
production dependency audit. The deployment job did not run. The earlier PR
checks are historical evidence, not a substitute for this later audit.

## Direct package corrections

- Next.js resolves to 16.4.3, above the 16.4.1 security floor for
  [GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw),
  [GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr), and
  [GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r).
- DOMPurify resolves to 3.4.17 for
  [GHSA-cg2g-xh64-v4q7](https://github.com/advisories/GHSA-cg2g-xh64-v4q7),
  [GHSA-mrv2-3pqr-j5jr](https://github.com/advisories/GHSA-mrv2-3pqr-j5jr), and
  [GHSA-c6gr-qvv4-5v3f](https://github.com/advisories/GHSA-c6gr-qvv4-5v3f).

These are dependency findings; this checkpoint does not claim an exploit was
demonstrated against the live site.

## Zod: installed edge and bundled validator are different

`@imgly/background-removal` 1.7.0 declares Zod 3, but its exported ESM and CJS
bundles embed Zod 3.24.2 without importing the separately installed dependency
at runtime. Its declarations do import Zod types. The exact-parent override to
Zod 4.6.6 replaces a runtime-unused vulnerable installed edge. A declaration-only
pnpm patch imports `zod/v3` to preserve the existing public `Config` type. It does
**not** patch or replace the embedded validator. A compiler test checks that
`Config` is not `any` and rejects an invalid model even with `skipLibCheck` enabled.

For [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5),
the current application path does not provide attacker-controlled collections
to array/set/map schemas: the private configuration schema has no such schema,
and the application supplies only its fixed progress callback. Image bytes are
processed separately. This is a bounded reachability conclusion, not a claim
that every use of the library or its embedded Zod is safe.

`background-removal-validation-boundary.test.ts` checks both shipped bundle
formats for external Zod imports, private-schema exports and collection schemas,
and checks the actual application call with the TypeScript AST. It also rejects
additional importers in the production source directories. The package is
pinned to the reviewed 1.7.0 release. Any package or configuration change must
receive renewed review; a failed boundary test must not be relaxed to obtain a
green audit. The production audit and its severity threshold remain unchanged.

An upstream report should request removal of the unused dependency and a rebuilt
bundle. No upstream message has been sent by this task. A rebuilt upstream
release still requires review of the embedded code before changing the pin.

## Release boundary

This dependency change is a different revision from the owner-approved PR #243.
Its tests, security checks and review must finish before requesting approval of
the new release. Do not retry the blocked production version or bypass its audit.
