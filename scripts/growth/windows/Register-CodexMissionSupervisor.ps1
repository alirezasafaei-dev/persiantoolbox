[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$RepositoryPath = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'
$taskName = 'PersianToolbox-CodexMissionSupervisor'
$scriptPath = Join-Path $PSScriptRoot 'Invoke-CodexMissionSupervisor.ps1'
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -RepositoryPath `"$RepositoryPath`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration (New-TimeSpan -Days 3650)
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType InteractiveToken -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Write-Output "Registered $taskName for $RepositoryPath (every 15 minutes, MultipleInstances=IgnoreNew)."
