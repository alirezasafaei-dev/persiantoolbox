# Focus correction integration - 2026-11-17

This candidate combines independently reviewed PR #291 (current handoff),
PR #292 (localized invoice monetary inputs), and PR #293 (Next.js security patch)
on main revision `15c8680d75bae8dbef4b0ba2ab45abd62d694d69`.

The source references are:

- Docs: `b3bd09ae560663e2c6a44d812b5a919a07f63338`.
- Invoice: `ba12da8e191a0dd0c7637bb9587cc3e952c3e7f3`.
- Security: `d10af650a58e880f7ce37052664e6e88a1dd5405`.

No additional application behavior is introduced during assembly. The invoice
audit's original dependency-blocker wording is updated to distinguish the
included patch from the unchanged production runtime. Source-PR checks do not
prove the combined candidate. Do not merge the source PRs separately after
releasing this integration.

Production market data availability remains unresolved. Neither this candidate
nor the provider contact attempt establishes a redistribution license. The
focus remains address conversion, invoices, work certificates and formal
letters; no unrelated generic-tool backlog work is included.

## Verification boundary

Combined-candidate local checks passed: `pnpm ci:quick` (2,221 tests, 288 files),
`pnpm ci:contracts`, production build and 11 canonical standalone smoke routes
on 127.0.0.1:3100. Production dependency audit plus its existing validator
reported zero findings at every severity. Documentation links passed.
These results are separate from the source-branch evidence. Production
deployment requires explicit owner approval of the final
revision, successful hosted checks, canonical release and live acceptance.
No indexing request, paid operation or production mutation has been performed.
