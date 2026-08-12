# Hetzner OpenClaw control-plane runbook

## Decision

Use `AUTOMATION_SERVER` (`asdev@91.107.153.223`) as the always-on OpenClaw
gateway and Codex control plane. Keep GitHub as the canonical mission queue and
audit trail. Notion is an optional input/output adapter: a Notion outage must
not stop an already materialized GitHub mission.

`IRAN_PROD_SERVER` is outside this rollout. Do not deploy, reload services,
migrate data, or mutate production. Hermes remains the Telegram owner; OpenClaw
must not poll Telegram while Hermes is active.

## Architecture

- `AUTOMATION_SERVER`: private OpenClaw gateway, scheduler, Codex CLI, repository
  checkout, and mission execution.
- GitHub: branches, signed commits, Draft PRs, checks, reviews, and durable queue
  evidence.
- Notion: optional planning view. Never proxy a user's browser session or store
  credentials in the repository.
- Windows workstation: optional Android/emulator worker, reached only through an
  authenticated private tunnel when a mission explicitly needs it.

## Hard gate

Run as the dedicated unprivileged automation account:

```bash
cd ~/persiantoolbox-control
scripts/growth/agent-loop/preflight-hetzner-control-plane.sh
```

Continue only when the final line is `PREFLIGHT_OK`. In particular, the
unauthenticated Notion API probe must return JSON with HTTP 401. An HTML/403
edge response is a network-path failure; do not spend credentials or install
the gateway until that route works.

## Reviewed installation

Choose and record reviewed, pinned package versions before installation. Do not
pipe a remote installer into a shell.

```bash
export OPENCLAW_VERSION='<reviewed-version>'
export CODEX_VERSION='<reviewed-version>'
scripts/growth/agent-loop/install-hetzner-openclaw.sh
```

The installer is intentionally interactive at OpenClaw onboarding and Codex/GitHub
authentication. Secrets remain in their native credential stores, never `.env`
files committed to Git.

## Acceptance evidence

Do not call the rollout complete until all evidence exists:

1. preflight output ends with `PREFLIGHT_OK`;
2. the OpenClaw user service is enabled and active;
3. `openclaw gateway status` is healthy without a public unauthenticated listener;
4. GitHub and Codex authentication pass under the automation user;
5. a read-only Codex canary reports the repository state without modifying files;
6. one bounded mission produces a signed commit, pushed mission branch, Draft PR,
   and passing required checks;
7. no production, Telegram ownership, branch-protection, or secret policy changed.

If any gate fails, preserve the logs with secrets redacted, leave existing
services unchanged, and report the exact failing command and exit code.
