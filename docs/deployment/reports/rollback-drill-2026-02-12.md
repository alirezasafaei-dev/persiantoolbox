# Rollback Drill Report (2026-02-12)

- Date (UTC): 2026-02-12
- Environment: production
- Drill type: automatic rollback on post-deploy validation failure
- Trigger run: https://github.com/alirezasafaeiiidev/persian_tools/actions/runs/21953747757
- Recovery confirmation run: https://github.com/alirezasafaeiiidev/persian_tools/actions/runs/21954244443

## What happened

1. Production release deployed successfully.
2. Post-deploy strict report failed.
3. Workflow executed automatic rollback step.
4. Service was restored and a subsequent strict production deploy completed successfully.

## Evidence

- `Rollback production on post-deploy failure` step in run `21953747757`: passed.
- Follow-up strict run `21954244443`: passed with keep-rollout decision.
- Post-deploy report includes healthy smoke/security/database/backup checks.

## Outcome

- Rollback path is operational.
- Recovery time was within the same workflow execution window.
