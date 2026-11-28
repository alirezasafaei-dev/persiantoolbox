[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$RepositoryPath = (Get-Location).Path,
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$taskName = 'PersianToolbox-CodexMissionSupervisor'
$mutexName = 'Global\PersianToolbox-CodexMissionSupervisor'
$logPath = Join-Path $RepositoryPath '.codex\mission-supervisor.log'
$healthPath = Join-Path $RepositoryPath '.codex\mission-supervisor-health.json'
$mutex = [Threading.Mutex]::new($false, $mutexName)

function Write-SanitizedLog([string]$Message) {
  $safe = $Message -replace '(?i)(token|secret|password|private[_-]?key|authorization)\s*[:=]\s*[^\s]+', '$1=[REDACTED]'
  $safe | Add-Content -LiteralPath $logPath -Encoding UTF8
}

function Write-HealthEvidence([string]$Status, [int]$ExitCode, [string]$Output) {
  $safe = $Output -replace '(?i)(token|secret|password|private[_-]?key|authorization)\s*[:=]\s*[^\s]+', '$1=[REDACTED]'
  $selected = if ($safe -match 'Claiming mission:\s*([^\s]+)') { $Matches[1] } else { $null }
  $prUrl = if ($safe -match 'https://github\.com/[^\s]+/pull/\d+') { $Matches[0] } else { $null }
  $blocker = if ($safe -match 'Idle:\s*(.+)') { $Matches[1].Trim() } elseif ($Status -ne 'completed') { $safe.Substring(0, [Math]::Min(500, $safe.Length)) } else { $null }
  @{ lastCycle = (Get-Date -Format o); selectedMission = $selected; status = $Status; exitCode = $ExitCode; prUrl = $prUrl; blockerReason = $blocker } | ConvertTo-Json | Set-Content -LiteralPath $healthPath -Encoding UTF8
}

$ownsMutex = $false
$locationPushed = $false
try {
  try {
    $ownsMutex = $mutex.WaitOne(0)
  } catch [Threading.AbandonedMutexException] {
    # WaitOne grants ownership on abandonment. Defer the cycle for reconciliation.
    $ownsMutex = $true
    Write-Warning 'Previous supervisor abandoned its lock. Reconcile the previous cycle before executing.'
    exit 1
  }
  if (-not $ownsMutex) { exit 0 }
  if ($WhatIf) {
    Write-Output 'WHATIF: the supervisor lock is available. No repository or executor actions were performed.'
    exit 0
  }
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $logPath) | Out-Null
  Push-Location -LiteralPath $RepositoryPath
  $locationPushed = $true
  $status = (& git status --porcelain 2>&1 | Out-String).Trim()
  if ($status) { throw 'Supervisor requires a clean worktree.' }
  & git fetch --prune origin
  if ($LASTEXITCODE -ne 0) { throw 'Unable to fetch the supervisor branch.' }
  $branch = (& git branch --show-current).Trim()
  if ($branch -ne 'codex/agent-control-plane') {
    & git switch codex/agent-control-plane
    if ($LASTEXITCODE -ne 0) { throw 'Unable to switch supervisor to codex/agent-control-plane.' }
  }
  & corepack prepare pnpm@9.15.0 --activate
  $output = & corepack pnpm agent-loop:run --executor codex 2>&1 | Out-String
  Write-SanitizedLog "$(Get-Date -Format o) $output"
  $cycleExit = $LASTEXITCODE
  $cycleStatus = if ($cycleExit -eq 0) { 'completed' } else { 'failed' }
  Write-HealthEvidence $cycleStatus $cycleExit $output
  if ($cycleExit -ne 0) { exit $cycleExit }
  if ((& git status --porcelain | Out-String).Trim()) { throw 'Cycle ended with a dirty worktree.' }
  $branch = (& git branch --show-current).Trim()
  if ($branch -like 'codex/mission-*') { & git switch codex/agent-control-plane }
} catch {
  Write-SanitizedLog "$(Get-Date -Format o) FAILED: $($_.Exception.Message)"
  exit 1
} finally {
  if ($locationPushed) { Pop-Location }
  if ($ownsMutex) { $mutex.ReleaseMutex() }
  $mutex.Dispose()
}
