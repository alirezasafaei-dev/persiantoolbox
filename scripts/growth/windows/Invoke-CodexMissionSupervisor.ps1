[CmdletBinding(SupportsShouldProcess)]
param(
  [Parameter(Mandatory = $false)]
  [string]$RepositoryPath = (Get-Location).Path,
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$taskName = 'PersianToolbox-CodexMissionSupervisor'
$mutexName = 'Global\PersianToolbox-CodexMissionSupervisor'
$logPath = Join-Path $RepositoryPath '.codex\mission-supervisor.log'
$mutex = [Threading.Mutex]::new($false, $mutexName)

function Write-SanitizedLog([string]$Message) {
  $safe = $Message -replace '(?i)(token|secret|password|private[_-]?key|authorization)\s*[:=]\s*[^\s]+', '$1=[REDACTED]'
  $safe | Add-Content -LiteralPath $logPath -Encoding UTF8
}

try {
  if (-not $mutex.WaitOne(0)) { exit 0 }
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $logPath) | Out-Null
  Push-Location -LiteralPath $RepositoryPath
  $status = (& git status --porcelain 2>&1 | Out-String).Trim()
  if ($status) { throw 'Supervisor requires a clean worktree.' }
  & git fetch --prune origin
  if ($WhatIf) {
    Write-SanitizedLog "$(Get-Date -Format o) WHATIF: fetch succeeded; one Codex mission cycle would run."
    exit 0
  }
  $output = & pnpm agent-loop:run --executor codex 2>&1 | Out-String
  Write-SanitizedLog "$(Get-Date -Format o) $output"
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  if ((& git status --porcelain | Out-String).Trim()) { throw 'Cycle ended with a dirty worktree.' }
  $branch = (& git branch --show-current).Trim()
  if ($branch -like 'codex/mission-*') { & git switch codex/agent-control-plane }
} catch {
  Write-SanitizedLog "$(Get-Date -Format o) FAILED: $($_.Exception.Message)"
  exit 1
} finally {
  Pop-Location -ErrorAction SilentlyContinue
  if ($mutex) { $mutex.ReleaseMutex() | Out-Null; $mutex.Dispose() }
}
