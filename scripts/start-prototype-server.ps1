$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$port = 4173
$url = "http://127.0.0.1:$port/"

function Test-PrototypeServer {
  try {
    $response = Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 2
    return $response.StatusCode -eq 200 -and $response.Content.Contains('<div id="app"></div>')
  } catch {
    return $false
  }
}

if (Test-PrototypeServer) {
  Write-Host "Prototype server is already running: $url" -ForegroundColor Green
  Start-Process $url
  exit 0
}

$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listener) {
  Write-Host "Port $port is already used by another application." -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

$pythonCandidates = @(
  "C:\Users\Administrator\AppData\Local\Programs\Python\Python313\python.exe",
  "C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
)
$python = $pythonCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $python) {
  $pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue
  if ($pythonCommand) { $python = $pythonCommand.Source }
}
if (-not $python) {
  Write-Host "Python was not found. The prototype server cannot start." -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

Start-Process -WindowStyle Hidden -FilePath $python -ArgumentList "-m", "http.server", $port, "--bind", "127.0.0.1" -WorkingDirectory $root
Start-Sleep -Milliseconds 800

if (-not (Test-PrototypeServer)) {
  Write-Host "Prototype server failed to start. Check Python and port $port." -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

Write-Host "Prototype server started: $url" -ForegroundColor Green
Start-Process $url
Read-Host "The server will keep running in the background. Press Enter to close"
