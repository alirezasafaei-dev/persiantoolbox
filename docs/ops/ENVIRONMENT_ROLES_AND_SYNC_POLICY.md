# ASDEV Environment Roles and Sync Policy — PersianToolbox

**Status:** Mandatory by reference  
**Canonical policy:** `alirezasafaei-dev/alirezasafaeisystems/docs/governance/ENVIRONMENT_ROLES_AND_SYNC_POLICY.md`

PersianToolbox agents must use the ASDEV canonical environment names:

- `LOCAL_PC` — owner's workstation and MiMo command center.
- `AUTOMATION_SERVER` — external automation server `asdev@91.107.153.223` for always-on sync, queue, MCP, agents, and reporting.
- `IRAN_PROD_SERVER` — Iran live production deployment server. Strictly gated.
- `GITHUB_MAIN` — GitHub main branch source of truth.

## Required behavior

- Do not say "local" or "server" without the canonical name.
- Do not deploy/rollback/reload nginx/migrate/modify production without exact approval phrase.
- Do not call a deployment successful until `docs/ops/POST_DEPLOY_LIVE_VERIFICATION_POLICY.md` passes.
- Prompt/policy/queue changes belong in GitHub and must be pulled by `AUTOMATION_SERVER` sync automation.
- Hermes is the Telegram reporting owner.
- OpenClaw must not poll Telegram while Hermes is active.

## PersianToolbox-specific production note

`IRAN_PROD_SERVER` hosts the live public site. Automation may inspect and report, but production mutation remains gated.
