# Release Notes — Blue-Green Public Deploy

**Date:** 2026-07-09  
**Method:** `deploy-blue-green.sh`  
**Host:** public VPS (ubuntu · nginx · PM2)  
**Release SHA:** `37ba34775fd4` (main)  
**Release dir:** `persiantoolbox-releases/37ba34775fd4-20260709T002756Z`  
**Active slot after cutover:** **green** · nginx → **127.0.0.1:3003**

---

## Pre-deploy (already done)

- Quality pack (homepage/trust/meta)
- SEO content factory for all tools
- GSC-driven titles (OCR, address)
- Typecheck/tests green on key packs

---

## Deploy outcome

| Check | Result |
|-------|--------|
| QA gate | PASS |
| Build | PASS |
| New slot ready | PASS (commit 37ba347) |
| Nginx switch | PASS → 3003 |
| Smoke pages | `/` blog about pricing tools contract loan salary 200 |
| Cleanup | old blue deleted |

---

## Follow-up (post this release)

- Redeploy HEAD ≥ `0736c84` for blog Medium package + roadmap docs  
- Editorial hubs → `/blog/topic/*` fix  
- OCR path re-smoke (one timeout observed in agent probe)  
- Not claiming 10/10 yet  

---

## Topology reminder

| Layer | Role |
|-------|------|
| Public DNS + nginx | Live product |
| ASDEV IRAN `:3100` | Separate app-layer control plane target |
