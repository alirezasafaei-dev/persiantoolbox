# Snapshot Summary

- Activated real CI gates in `.github/workflows/ci-core.yml`.
- Added `security:scan` script and forced secure MCP SDK override in `package.json`.
- Verified gates locally: `pnpm security:scan`, `pnpm ci:quick`, `pnpm ci:contracts` all pass.
