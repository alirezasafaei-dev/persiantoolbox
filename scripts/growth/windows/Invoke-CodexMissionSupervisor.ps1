[CmdletBinding()]
param(
  [string]$RepositoryPath = (Get-Location).Path,
  [string]$PortfolioPath,
  [string]$RuntimePath,
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$mutexName = 'Global\PersianToolbox-CodexMissionSupervisor'
$mutex = [Threading.Mutex]::new($false, $mutexName)
$ownsMutex = $false
try {
  try {
    $ownsMutex = $mutex.WaitOne(0)
  } catch [Threading.AbandonedMutexException] {
    $ownsMutex = $true
    Write-Warning 'Previous supervisor abandoned its lock. Reconcile the previous cycle before executing.'
    exit 1
  }
  if (-not $ownsMutex) { exit 0 }
  if ($WhatIf) {
    Write-Output 'WHATIF: the supervisor lock is available. No repository or executor actions were performed.'
    exit 0
  }
  if (-not $PortfolioPath -or -not $RuntimePath) {
    throw 'Explicit portfolio and local runtime directories are required.'
  }
  $entry = Join-Path $RepositoryPath 'scripts/growth/agent-loop/index.ts'
  $tsx = Join-Path $RepositoryPath 'node_modules/tsx/dist/cli.mjs'
  $node = (Get-Command node.exe -CommandType Application | Select-Object -First 1).Source
  if (!(Test-Path -LiteralPath $entry -PathType Leaf) -or !(Test-Path -LiteralPath $tsx -PathType Leaf)) {
    throw 'The reviewed checkout and local dependencies are required.'
  }
  # A fresh PowerShell invocation owns this process environment. Keep only
  # platform variables needed by the fixed local Node/tsx validation.
  $allowedEnvironment = @('SystemRoot', 'SystemDrive', 'WinDir', 'TEMP', 'TMP', 'ComSpec', 'PATHEXT', 'PATH')
  Get-ChildItem Env: | Where-Object { $_.Name -notin $allowedEnvironment } | ForEach-Object {
    [Environment]::SetEnvironmentVariable($_.Name, $null, 'Process')
  }
  & $node $tsx $entry portfolio run $PortfolioPath $RuntimePath
  exit $LASTEXITCODE
} catch {
  Write-Error -ErrorAction Continue 'Supervisor cycle rejected or unavailable. Use portfolio doctor to inspect readiness.'
  exit 1
} finally {
  if ($ownsMutex) { $mutex.ReleaseMutex() }
  $mutex.Dispose()
}
