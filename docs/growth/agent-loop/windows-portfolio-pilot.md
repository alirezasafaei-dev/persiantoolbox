# Windows portfolio pilot

This pilot extends the existing agent-loop CLI and Windows runner. It reads the portfolio backlog and active state and publishes a local receipt for its fixed, zero-cost OPS-002 intake validation. The receipt is evidence of intake, not completion of OPS-002. The pilot consumes no model quota and accepts no task-supplied executable, prompt, or external operation. The legacy Codex/OpenCode executor stays outside the scheduled pilot.

Run the commands below from a reviewed PersianToolbox checkout. Set the portfolio path to the existing private checkout's portfolio-control directory and the runtime path to a dedicated directory under LOCALAPPDATA. Use NTFS for atomic receipt publication. Keep runtime files outside both Git checkouts. Only the owner or a trusted local operator should have write access to these directories.

```powershell
pnpm exec tsx scripts/growth/agent-loop/index.ts portfolio doctor $PortfolioPath $RuntimePath
pnpm exec tsx scripts/growth/agent-loop/index.ts portfolio run $PortfolioPath $RuntimePath
pnpm exec tsx scripts/growth/agent-loop/index.ts portfolio daily $PortfolioPath $RuntimePath
pwsh -NoProfile -File scripts/growth/windows/Register-CodexMissionSupervisor.ps1 -PortfolioPath $PortfolioPath -RuntimePath $RuntimePath -WhatIf
```

Other CLI actions are queue, providers, budget, approvals, weekly, poll, pause, resume, stop, emergency-stop and clear-emergency. Poll has a five-minute bound and runs only local intake. Pause and stop are observed between cycles. Emergency-stop prevents later cycles until clear-emergency is followed by resume. The current read-only validation requires no child-agent cancellation. Do not use a receipt as authority to execute a provider or alter the canonical mission state.

After acceptance, the installer takes OwnerApproved, saves the previous scheduler XML if present and registers the reviewed runner disabled. Preview does not write. Restore uses the saved XML and may reinstate the prior trigger and enabled state. The installer does not alter the power plan. Before enabling, verify the registration applies to the intended interactive identity and review end-to-end isolation and restart behavior. Full model dispatch, headless sign-in, verified power handling, charge enforcement for paid providers and actual reboot acceptance are outside this pilot.
