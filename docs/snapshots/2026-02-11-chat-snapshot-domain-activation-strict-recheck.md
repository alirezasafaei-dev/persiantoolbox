# Snapshot: Domain Activation Follow-up and Strict Production Recheck

Date: 2026-02-11
Scope: `persian_tools` post-activation verification on VPS + production strict check

## Summary

1. Production deployment succeeded on VPS with release `production-21909639332-c1f8aca7e243`.
2. A strict production recheck was executed using public domain base URL:
   - Workflow run: `21910200157`
   - Inputs: `base_url=https://persiantoolbox.ir`, `post_report_strict=true`
3. Strict post-deploy checks failed with `fetch failed` on all smoke endpoints and headers.
4. Automatic rollback was triggered and completed successfully.
5. Production service was restored to previous healthy release:
   - `production-21909639332-c1f8aca7e243`

## Evidence

- Successful non-strict production run:
  - `https://github.com/alirezasafaeiiidev/persian_tools/actions/runs/21909639332`
- Strict production recheck run (failed by design due strict checks):
  - `https://github.com/alirezasafaeiiidev/persian_tools/actions/runs/21910200157`
- Failure stage:
  - `Generate production post-deploy report` (`--strict=true`)
- Rollback stage:
  - `Rollback production on post-deploy failure` (executed and healthy)

## Operational Conclusion

1. VPS deployment pipeline and rollback safety are working correctly.
2. Public-domain strict verification is still blocked by network/DNS/SSL reachability of `persiantoolbox.ir` from GitHub runner perspective.
3. Next action owner is operator-side DNS/CDN verification, then strict rerun.

## Additional Technical Probe (Post-failure)

1. Public DNS still did not resolve from `1.1.1.1` and `8.8.8.8` at check time.
2. Direct origin checks showed:
   - `http://185.3.124.93` responds (`nginx` default page).
   - `http://185.3.124.93` with `Host: persiantoolbox.ir` and `Host: staging.persiantoolbox.ir` responds from Next.js app.
   - `https://185.3.124.93` with SNI/resolve for `persiantoolbox.ir` and `staging.persiantoolbox.ir` fails TLS handshake (`unexpected EOF while reading`).
3. Practical interpretation: app/runtime is up, but HTTPS origin path and/or CDN SSL chain still needs operator-side correction before strict go-live verification can pass.
