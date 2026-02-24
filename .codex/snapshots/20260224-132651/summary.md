## Snapshot Summary

- Added Node 20 compatible optional loading for `node:sqlite` in site settings storage.
- Re-ran local quality gates (`lint`, `typecheck`, `build`, `ci:quick`) successfully.
- Deployed new production release on VPS via SSH and PM2.
- Verified production process cwd switched to new release and health endpoints returned OK/ready.
- Enabled HSTS only in production runtime via `ENABLE_HSTS=1` on server ecosystem env.
