# =============================================================================
#  Umbrella OS — Infrastructure Start (PowerShell)
# =============================================================================
# Starts PostgreSQL (pgvector), Redis, and MinIO via Docker Compose.
#
# Usage:
#   .\infra\scripts\start-infra.ps1
# =============================================================================

$ErrorActionPreference = "Stop"
$InfraDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ComposeFile = Join-Path $InfraDir "docker-compose.yml"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  UMBRELLA OS — STARTING INFRASTRUCTURE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
try {
    docker --version | Out-Null
} catch {
    Write-Host "[ERROR] Docker is not installed." -ForegroundColor Red
    Write-Host "Install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
}

try {
    docker info 2>&1 | Out-Null
} catch {
    Write-Host "[ERROR] Docker daemon is not running. Start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "[1/3] Starting services..." -ForegroundColor Yellow
docker compose -f $ComposeFile up -d

Write-Host ""
Write-Host "[2/3] Waiting for health checks..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "[3/3] Service status:" -ForegroundColor Yellow
docker compose -f $ComposeFile ps

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  INFRASTRUCTURE RUNNING" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  PostgreSQL: localhost:5432  (user: umbrella, db: umbrella_os)"
Write-Host "  Redis:      localhost:6379"
Write-Host "  MinIO:      localhost:9000  (console: localhost:9001)"
Write-Host ""
