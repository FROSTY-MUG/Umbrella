# =============================================================================
#  Umbrella OS — Full Development Server Start (PowerShell)
# =============================================================================
# Starts both the FastAPI backend and Next.js frontend concurrently.
#
# Usage:
#   .\infra\scripts\dev-start.ps1
# =============================================================================

$ErrorActionPreference = "Continue"
$UmbrellaRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  UMBRELLA OS — STARTING DEVELOPMENT SERVERS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Activate venv if exists
$venvActivate = Join-Path $UmbrellaRoot ".venv\Scripts\Activate.ps1"
if (Test-Path $venvActivate) {
    & $venvActivate
    Write-Host "[OK] Python venv activated" -ForegroundColor Green
}

# Check data lake
$dataDir = Join-Path $UmbrellaRoot "data\raw"
if (-not (Test-Path $dataDir)) {
    Write-Host "[INFO] Initializing data lake..."
    python (Join-Path $UmbrellaRoot "umbrella.py") data init
}

# Ensure packages/ exists
$packagesDir = Join-Path $UmbrellaRoot "packages"
if (-not (Test-Path $packagesDir)) {
    New-Item -ItemType Directory -Path $packagesDir -Force | Out-Null
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:8000  (FastAPI)"
Write-Host "  Frontend: http://localhost:3000  (Next.js)"
Write-Host ""

Push-Location $UmbrellaRoot
pnpm run dev:all
Pop-Location
