[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$fixture = Join-Path ([IO.Path]::GetTempPath()) ("pt-supervisor-" + [Guid]::NewGuid().ToString('N'))
$mutexName = 'Local\PTSupervisorFixture' + [Guid]::NewGuid().ToString('N')
$source = Join-Path $PSScriptRoot 'Invoke-CodexMissionSupervisor.ps1'
$original = Get-Content -LiteralPath $source -Raw
$copy = Join-Path $fixture 'supervisor.ps1'
$pwsh = (Get-Process -Id $PID).Path
$repo = Join-Path $fixture 'no-repository'
$null = New-Item -ItemType Directory -Path $repo
[IO.File]::WriteAllText($copy, $original.Replace('Global\PersianToolbox-CodexMissionSupervisor', $mutexName))

function Assert-Check([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}

try {
  $owner = [Threading.Mutex]::new($true, $mutexName)
  try {
    $result = & $pwsh -NoProfile -File $copy -RepositoryPath $repo -WhatIf 2>&1
    Assert-Check ($LASTEXITCODE -eq 0) 'Contention must return success without releasing another process lock.'
    Assert-Check ("$result" -notmatch 'ReleaseMutex') 'Contention attempted to release a lock it did not own.'
  } finally {
    $owner.ReleaseMutex()
    $owner.Dispose()
  }

  $result = & $pwsh -NoProfile -File $copy -RepositoryPath $repo -WhatIf 2>&1
  Assert-Check ($LASTEXITCODE -eq 0 -and "$result" -match 'WHATIF') 'WhatIf must run without invoking Git.'
  Assert-Check (-not (Get-ChildItem -LiteralPath $repo -Force)) 'WhatIf wrote to the fixture.'

  $handle = [Threading.Mutex]::new($false, $mutexName)
  try {
    $holder = '$lock = [Threading.Mutex]::new($false, ''' + $mutexName + '''); $null = $lock.WaitOne(); [Environment]::Exit(0)'
    & $pwsh -NoProfile -Command $holder
    Assert-Check ($LASTEXITCODE -eq 0) 'Failed to create fixture abandoned mutex.'
    $result = & $pwsh -NoProfile -File $copy -RepositoryPath $repo 2>&1
    Assert-Check ($LASTEXITCODE -eq 1 -and "$result" -match 'abandoned') 'An abandoned lock must defer execution for reconciliation.'
    $result = & $pwsh -NoProfile -File $copy -RepositoryPath $repo -WhatIf 2>&1
    Assert-Check ($LASTEXITCODE -eq 0 -and "$result" -match 'WHATIF') 'A later invocation must be able to acquire the lock.'
    Assert-Check (-not (Get-ChildItem -LiteralPath $repo -Force)) 'Recovery probe wrote to the fixture.'
  } finally {
    $handle.Dispose()
  }
  'PASS contention, read-only WhatIf, abandoned lock recovery'
} finally {
  $resolved = (Resolve-Path -LiteralPath $fixture).Path
  $expectedParent = (Resolve-Path -LiteralPath ([IO.Path]::GetTempPath())).Path.TrimEnd('\')
  if ((Split-Path $resolved) -eq $expectedParent -and (Split-Path $resolved -Leaf) -match '^pt-supervisor-[a-f0-9]{32}$') {
    Remove-Item -LiteralPath $resolved -Recurse -Force
  }
}
