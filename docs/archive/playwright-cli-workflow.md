# Playwright CLI Workflow Runner

This repository includes a CLI-first browser workflow runner:

- Script: `scripts/playwright/run-workflow.sh`
- Example flow: `scripts/playwright/workflows/example.workflow`

## Prerequisite

```bash
command -v npx >/dev/null 2>&1
```

If this fails, install Node.js/npm first.

## Run

```bash
chmod +x scripts/playwright/run-workflow.sh
scripts/playwright/run-workflow.sh --workflow scripts/playwright/workflows/example.workflow
```

Headed mode (recommended while discovering refs):

```bash
scripts/playwright/run-workflow.sh \
  --workflow scripts/playwright/workflows/example.workflow \
  --headed
```

## Workflow file format

Use one step per line:

```text
ACTION|arg1|arg2
```

Supported actions:

- `OPEN|url`
- `GOTO|url`
- `SNAPSHOT`
- `CLICK|ref`
- `DBLCLICK|ref`
- `FILL|ref|text`
- `TYPE|text`
- `PRESS|key`
- `HOVER|ref`
- `SELECT|ref|value`
- `CHECK|ref`
- `UNCHECK|ref`
- `UPLOAD|relative/or/absolute/path`
- `TAB_NEW|url` (or `TAB_NEW` without url)
- `TAB_SELECT|index`
- `TAB_LIST`
- `GO_BACK`
- `GO_FORWARD`
- `RELOAD`
- `SCREENSHOT` or `SCREENSHOT|ref`
- `PDF`
- `SLEEP|seconds`

## Reliability behavior

- Retries each Playwright command (`--retries`, default `3`).
- On retry, automatically runs `SNAPSHOT` to refresh stale refs.
- Closes browser in cleanup.
- Copies `.playwright-cli` artifacts into `output/playwright/<timestamp>/playwright-cli`.
- Writes run logs to `output/playwright/<timestamp>/run.log`.

## Notes

- Refs (`e12`, etc.) come from the latest `SNAPSHOT`; re-snapshot after major UI changes.
- Keep artifacts under `output/playwright/` for consistent run history.
