$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

$startPort = 3000
if ($env:AIMURA_PORT) {
  $startPort = [int]$env:AIMURA_PORT
}

$port = $startPort
while (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
  $port += 1
}

$url = "http://localhost:$port"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js and npm are required to run Aimura AI."
  Write-Host "Install Node.js from https://nodejs.org, then run open_aimura_windows.bat again."
  Read-Host "Press Enter to close"
  exit 1
}

if (-not (Test-Path "node_modules\next")) {
  Write-Host "Installing Aimura AI web dependencies (first run only)..."
  npm install
  if ($LASTEXITCODE -ne 0) {
    Read-Host "Install failed. Press Enter to close"
    exit $LASTEXITCODE
  }
}

if ($port -ne $startPort) {
  Write-Host "Port $startPort is busy, so Aimura AI will use port $port."
}

# Detect this PC's LAN IP so a phone on the same Wi-Fi can connect.
$lanIp = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" -and $_.PrefixOrigin -ne "WellKnown" } |
  Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "============================================================"
Write-Host "  Aimura AI is starting"
Write-Host "  On this computer : $url"
if ($lanIp) {
  Write-Host "  On your phone    : http://${lanIp}:$port"
  Write-Host "  (Keep the phone on the same Wi-Fi network as this PC.)"
}
Write-Host "============================================================"
Write-Host ""

$waiter = @"
`$url = '$url'
for (`$attempt = 0; `$attempt -lt 90; `$attempt += 1) {
  try {
    `$response = Invoke-WebRequest -UseBasicParsing -Uri `$url -TimeoutSec 1
    if (`$response.StatusCode -lt 400 -and (`$response.Content -match 'Aimura AI|__next')) {
      Start-Process `$url
      exit 0
    }
  } catch {
  }
  Start-Sleep -Seconds 1
}
Write-Host 'Aimura AI did not become ready after 90 seconds.'
Write-Host 'Leave the server window open and try the URL manually: $url'
Read-Host 'Press Enter to close'
"@

Start-Process powershell -WindowStyle Minimized -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $waiter

Write-Host "Starting Aimura AI at $url"
# Bind to 0.0.0.0 so both this PC and phones on the same Wi-Fi can open it.
npm run dev -- --hostname 0.0.0.0 --port $port
exit $LASTEXITCODE
