## Snapshot Summary

- Fixed Node 20 build blocker by making sqlite backend optional at runtime.
- Full local quality gates passed: lint, typecheck, build, ci:quick, e2e:ci.
- Production VPS deployed to new release path and switched in PM2.
- Health endpoints and HTTPS header checks succeeded post-deploy.
- HSTS enabled on production runtime via ENABLE_HSTS=1 in PM2 env.
