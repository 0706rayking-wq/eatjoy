$ErrorActionPreference = 'Stop'

$taskName = 'Eatjoy Google Review Patrol'
$repoDir = Split-Path -Parent $PSScriptRoot
$runner = Join-Path $PSScriptRoot 'google-review-runner.js'
$bundledNode = 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$stableRuntimeDir = Join-Path $env:LOCALAPPDATA 'EatjoyReviewBot\Runtime'
$stableNode = Join-Path $stableRuntimeDir 'node.exe'
$systemNode = Get-Command node.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source
if (!$systemNode -and !(Test-Path -LiteralPath $stableNode)) {
  if (!(Test-Path -LiteralPath $bundledNode)) { throw 'Node.js was not found.' }
  New-Item -ItemType Directory -Path $stableRuntimeDir -Force | Out-Null
  Copy-Item -LiteralPath $bundledNode -Destination $stableNode -Force
}
$nodePath = if ($systemNode) { $systemNode } else { $stableNode }

$action = New-ScheduledTaskAction `
  -Execute $nodePath `
  -Argument ('"{0}"' -f $runner) `
  -WorkingDirectory $repoDir

$triggers = @(
  New-ScheduledTaskTrigger -Daily -At '23:00'
  New-ScheduledTaskTrigger -Daily -At '23:05'
  New-ScheduledTaskTrigger -Daily -At '23:15'
)

$settings = New-ScheduledTaskSettingsSet `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
  -MultipleInstances IgnoreNew `
  -StartWhenAvailable `
  -WakeToRun `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -DontStopOnIdleEnd

$principal = New-ScheduledTaskPrincipal `
  -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) `
  -LogonType Interactive `
  -RunLevel Limited

Register-ScheduledTask `
  -TaskName $taskName `
  -Description 'Google review patrol at 23:00; silent retries at 23:05 and 23:15. Failures are logged locally and never sent to LINE.' `
  -Action $action `
  -Trigger $triggers `
  -Settings $settings `
  -Principal $principal `
  -Force | Out-Null

Write-Output "Updated scheduled task: $taskName"
