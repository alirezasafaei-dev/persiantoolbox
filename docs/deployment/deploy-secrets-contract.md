# Deploy Secrets Contract

This document defines the GitHub Actions secrets required by deploy workflows.

## Production (`deploy-production.yml`)

- `DEPLOY_SSH_KEY`: private SSH key for deploy user (`id_ed25519` content)
- `DEPLOY_SSH_HOST`: VPS hostname or IP
- `DEPLOY_SSH_PORT`: SSH port (numeric)
- `DEPLOY_SSH_USER`: deploy user on VPS
- `PRODUCTION_ENV_FILE_B64`: base64-encoded `production.env`

## Staging (`deploy-staging.yml`)

- `DEPLOY_SSH_KEY`
- `DEPLOY_SSH_HOST`
- `DEPLOY_SSH_PORT`
- `DEPLOY_SSH_USER`
- `STAGING_ENV_FILE_B64`: base64-encoded `staging.env`

## Encoding `.env` to Base64

Use the existing helper:

```bash
pnpm deploy:env:encode -- .env.production
pnpm deploy:env:encode -- .env.staging
```

Or standard shell:

```bash
base64 -w0 .env.production
base64 -w0 .env.staging
```

## Fail-Fast Behavior

Both deploy workflows now include a `preflight-secrets` job. If any required secret is missing or
`DEPLOY_SSH_PORT` is not numeric, the workflow fails immediately before expensive quality gates.
