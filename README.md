<!-- asdev:template_id=readme-minimum version=1.0.0 source=standards/docs/readme-minimum.md -->

# Project Name

Short description of the project.

## Scope

- In scope:
- Out of scope:

## Local Development

```bash
# setup commands
```

## Testing

```bash
# test commands
```

## Contributing

See `CONTRIBUTING.md`.

## Deployment Ops

- Env templates:
  - `env.staging.example`
  - `env.production.example`
- Deploy and rollback scripts:
  - `ops/deploy/deploy.sh`
  - `ops/deploy/rollback.sh`
- Deploy workflows:
  - `.github/workflows/deploy-staging.yml`
  - `.github/workflows/deploy-production.yml`
- VPS runbook:
  - `docs/vps-deploy-runbook.md`
- Encode env for GitHub Secrets:
  - `pnpm deploy:env:encode -- .env.production.real`
- Generate post-deploy report:
  - `pnpm deploy:post:report -- --base-url=https://persian-tools.ir --environment=production --git-ref=<tag-or-sha>`

## License

State license or internal-use policy.
