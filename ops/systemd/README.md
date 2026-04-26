# Operations Snapshot Timer (Production)

This directory contains a ready-to-use systemd one-shot service/timer pair for automated production health windows.

Files:

- `persian-tools-ops-snapshot-production.service`
- `persian-tools-ops-snapshot-production.timer`

## Install (example)

```bash
sudo cp ops/systemd/persian-tools-ops-snapshot-production.service /etc/systemd/system/
sudo cp ops/systemd/persian-tools-ops-snapshot-production.timer /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable --now persian-tools-ops-snapshot-production.timer
```

## Environment (recommended)

Keep these variables in your shared production env file (already referenced by the service):

- `OPS_WINDOW_REPEAT`
- `OPS_WINDOW_INTERVAL_MS`
- `OPS_DEGRADED_WEBHOOK`
- `OPS_DASHBOARD_TOKEN`
- `OPS_WINDOW_BASE_URL`
- `OPS_WINDOW_INCLUDE_OUTPUT`

The script writes artifacts to `docs/deployment/reports` and exits non-zero when a required healthy run fails.
