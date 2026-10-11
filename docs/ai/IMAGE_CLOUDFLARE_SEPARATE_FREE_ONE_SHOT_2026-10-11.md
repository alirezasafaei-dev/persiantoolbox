# Cloudflare Workers AI Image — Dedicated Free Account One-Shot Acceptance

**Date:** 2026-10-11 UTC
**Scope:** One manual fixed-prompt inference from owner's authorized Windows workstation; independent Workers Free account; no application deployment
**Repository:** [persiantoolbox PR #239](https://github.com/alirezasafaei-dev/persiantoolbox/pull/239)
**Source/test SHA:** `be0b600a0cf337201a5f34d0d56c99446718d7a6` (isolated detached read-only worktree)
**Result:** **MODEL INFERENCE PASS / COST METRIC NOT MEASURED / PRODUCTION NO-GO**

## Evidence checklist

| Gate                                              | Result                           | Grounding / limits                                                                                                                                                                    |
| ------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner creates distinct Cloudflare account         | **OWNER_REPORTED_PASS**          | Owner confirmed creation in this conversation; dashboard account identity and plan type not independently read                                                                        |
| New ID format                                     | **PASS**                         | 32 hexadecimal characters; value withheld from logs/docs                                                                                                                              |
| New ID compared with existing local chat ID       | **PASS**                         | Case-insensitive unequal; compared in memory on authorized workstation                                                                                                                |
| New token different from chat token               | **PASS**                         | Compared in memory; no credentials printed                                                                                                                                            |
| New token active                                  | **PASS**                         | Cloudflare official `GET /user/tokens/verify`: HTTP 200, status `active`                                                                                                              |
| New token can search image account models         | **PASS**                         | Official `GET /accounts/{new}/ai/models/search`: HTTP 200, success, selected fixed model listed                                                                                       |
| New token can query old chat account models       | **DENIED AS REQUIRED**           | Identical read-only query against old local chat account returned HTTP **403**; strong evidence against cross-account AI read access, not proof of all possible API permission scopes |
| Dashboard Workers Free / billing API confirmation | **OWNER_ATTESTED / API NOT_RUN** | Owner Free-account decision and local Free flag; no authenticated billing/dashboard proof available to this session                                                                   |
| Token RBAC least-privilege list                   | **NOT_VERIFIED**                 | Must confirm Workers AI Read/Edit with **only** new account in Cloudflare Dashboard. Old account HTTP 403 does not establish absence of unrelated permissions in the new account      |
| Local credential-file ACL                         | **PASS**                         | NTFS inheritance disabled; only current user, SYSTEM and Administrators explicit ACL; no broad Authenticated Users/Users grants                                                       |
| Credential file Git ignored                       | **PASS**                         | `git check-ignore` success; file not staged, copied or committed                                                                                                                      |
| Credentials isolated from existing chat           | **PASS (local)**                 | Local image/chat IDs and tokens distinct; live production chat credentials were not read, changed or moved                                                                            |
| Public feature flag                               | **OFF**                          | Local `FEATURE_AI_IMAGE_ENABLED=false`; production runtime/config untouched                                                                                                           |
| Negative one-shot test                            | **PASS**                         | Unconfigured CLI exit 1 and `IMAGE_ONE_SHOT=NO_GO_OR_FAILED` before any network request                                                                                               |
| One real image model call                         | **PASS**                         | Fixed official API model, one explicit invocation, no retry                                                                                                                           |
| Iran-server authenticated inference               | **NOT_RUN**                      | Test ran on Windows internet egress, **not** the Iran VPS                                                                                                                             |
| Cloudflare Workers AI Neurons dashboard           | **ACCOUNT_SNAPSHOT_PASS**        | Owner screenshot: today 172.8 / 10,000 Neurons, fixed FLUX.1 Schnell under Text-to-image; snapshot is account-wide, not the one-shot delta                                            |
| Individual one-shot Neuron usage                  | **NOT_MEASURED**                 | No pre-inference balance screenshot; account total cannot attribute consumption to one request                                                                                        |
| Public site feature activation                    | **NOT_RUN**                      | Unmerged draft PR; no deployed feature                                                                                                                                                |

## Real one-shot results

```text
status=PASS
model=@cf/black-forest-labs/flux-1-schnell
output=1024x1024 JPEG
imageBytes=22030
elapsedMs=2016
oneShotProcessExit=0
```

The one-shot entrypoint `pnpm exec tsx scripts/ai/image-one-shot.ts` was run in a detached checkout with `AI_IMAGE_SMOKE_AUTHORIZATION=authorize-single-inference`, an owner-attested Free-plan flag and locally established distinct account/token. The request used the **fixed harmless synthetic prompt** and `steps=4` to the official Cloudflare `/ai/run/` API. The provider adapter validated the response format and re-encoded a JPEG using Sharp; the CLI reported metadata only and retained **no image file**.

**Only one authentic image-generation request was deliberately sent.** Before that there were separate **read-only** token verification and model-list requests, plus one cross-account read-only negative authorization test. No API token, complete account ID, model image or private prompt was disclosed to ChatGPT/GitHub or saved in a report; credentials remained on the owner's authorized Windows computer. The temporary process environment was cleared when the command completed.

## Cloudflare dashboard usage snapshot — 2026-10-11 (owner-supplied)

**Evidence:** Owner supplied a screenshot of the **new image account** Workers AI → Usage dashboard after the successful one-shot. Dashboard displays **Neurons used today: 172.8 / 10k**, **Text-to-image** → `@cf/black-forest-labs/flux-1-schnell` **172.8 Neurons**, and a chart with **Last 24 hours** selected. This is a direct **owner-provided UI observation**, not a billing API response, token-scope audit or proof that the account is forever Free. The screenshot itself (which contains an account URL/ID and browser personal UI) was **not** copied to the repository.

**Account allowance at screenshot time:** consumed **172.8 Neurons (1.728%)**; difference against displayed daily 10,000 allowance **9,827.2 (98.272%)**. This is a point-in-time arithmetic remainder, not a current/live balance and not a promise of zero billing after any external account upgrade.

**Attribution limitation:** The dashboard figure aggregates all use in the displayed scope. A **before** reading for the one-shot was not captured, so the observed account total **cannot** be called the measured per-image cost, and a chart spike cannot establish the number of separate requests. The illustrative 57.6 Neurons estimate below remains an **estimate**; 172.8 Neurons is **actual displayed aggregate**, not a reason to infer that three image generations were performed.

## Cost calculation, individual request usage NOT measured

Cloudflare [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) (updated October 9, 2026) documents `FLUX.1 Schnell` at 4.80 Neurons per 512×512 tile plus 9.60 Neurons per step. An ordinary 1024×1024 output has 4 tiles and the request used 4 steps, implying an **illustrative estimate of 57.6 Neurons** (`4×4.80 + 4×9.60`) rather than an actual observed billing delta. Workers Free receives 10,000 Neurons per UTC day, with no paid overage unless the account is externally upgraded. Only the new account's **actual Workers AI dashboard usage** can validate the consumed Neurons.

## Security and remaining NO-GO

- Source file initially used chat-specific `AI_CLOUDFLARE_*` variable names; these were changed **locally** to `AI_IMAGE_CLOUDFLARE_*`, `AI_IMAGE_FREE_PLAN_CONFIRMED=true`, `AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED=true`, `FEATURE_AI_IMAGE_ENABLED=false`. The chat settings were neither altered nor imported into production.
- The secret file is ignored by Git, scoped by NTFS ACL, and **never transferred to the test Linux host, VPS, GitHub or this conversation**.
- Verify the Cloudflare token's exact account resource and Workers AI Read/Edit permission list, rather than assuming model-list success proves least privilege.
- **Dashboard aggregate Neurons observed:** 172.8 / 10,000 from owner screenshot; individual request Neuron delta still NOT_MEASURED. Perform a separately approved Iran-egress model test **without** copying the token into public logs or modifying production.
- Independently review trusted client IP / Cloudflare ingress rate limiting, dashboard monitoring/alerting, physical mobile, true browser 200% zoom and manual screen reader.
- PR stays Draft; final production deployment and public enablement require separate explicit owner approval under `AGENTS.md` and production deploy safety runbooks.

**Disposition:** Limited local official-model feasibility is **PASS**. Live product release is **NO-GO** until the remaining operational and approval gates are closed.
