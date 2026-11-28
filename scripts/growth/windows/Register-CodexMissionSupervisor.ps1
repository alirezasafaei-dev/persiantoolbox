[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
  [ValidateSet('Install', 'Restore')]
  [string]$Action = 'Install',
  [string]$RepositoryPath = (Get-Location).Path,
  [string]$PortfolioPath,
  [Parameter(Mandatory)]
  [string]$RuntimePath,
  [switch]$OwnerApproved
)

$ErrorActionPreference = 'Stop'
$taskName = 'PersianToolbox-CodexMissionSupervisor'
$backup = Join-Path $RuntimePath 'previous-task.xml'
if (-not $WhatIfPreference -and -not $OwnerApproved) { throw 'Explicit owner approval is required.' }

if ($Action -eq 'Restore') {
  if (!(Test-Path -LiteralPath $backup -PathType Leaf)) { throw 'Scheduled task backup is unavailable.' }
  if ($PSCmdlet.ShouldProcess($taskName, 'Restore prior registration')) {
    Register-ScheduledTask -TaskName $taskName -Xml (Get-Content -LiteralPath $backup -Raw) -Force | Out-Null
  }
  return
}

$repo = (Resolve-Path -LiteralPath $RepositoryPath).Path
$portfolio = (Resolve-Path -LiteralPath $PortfolioPath).Path
$runtime = [IO.Path]::GetFullPath($RuntimePath)
$script = Join-Path $repo 'scripts/growth/windows/Invoke-CodexMissionSupervisor.ps1'
$pwsh = (Get-Command pwsh.exe -CommandType Application | Select-Object -First 1).Source
foreach ($item in @($repo, $portfolio, $runtime, $script)) {
  if ($item -match '["\r\n]' -or $item.EndsWith('\')) { throw 'Invalid scheduled task path.' }
}
if (!(Test-Path -LiteralPath $script -PathType Leaf) -or
    !(Test-Path -LiteralPath (Join-Path $repo 'node_modules/tsx/dist/cli.mjs') -PathType Leaf) -or
    !(Test-Path -LiteralPath (Join-Path $portfolio 'MASTER_BACKLOG.json') -PathType Leaf) -or
    !(Test-Path -LiteralPath (Join-Path $portfolio 'ACTIVE_STATE.json') -PathType Leaf)) {
  throw 'Reviewed checkout, dependencies and canonical inputs are required.'
}
if (!( $PSCmdlet.ShouldProcess($taskName, 'Back up first registration and install disabled'))){ return }

$null = New-Item -ItemType Directory -Force -Path $runtime
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing -and !(Test-Path -LiteralPath $backup)) {
  $xml = Export-ScheduledTask -TaskName $taskName
  $xml | Set-Content -LiteralPath $backup -Encoding Unicode
}
$arguments = '-NoProfile -NonInteractive -File "{0}" -RepositoryPath "{1}" -PortfolioPath "{2}" -RuntimePath "{3}"' -f $script, $repo, $portfolio, $runtime
$taskAction = New-ScheduledTaskAction -Execute $pwsh -Argument $arguments
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration (New-TimeSpan -Days 365)
$settings = New-ScheduledTaskSettingsSet -Disable -MultipleInstances IgnoreNew -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 2)
$principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $taskAction -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Write-Output 'Registered disabled. Enabling requires a separate acceptance decision.'
