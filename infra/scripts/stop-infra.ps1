# =============================================================================
#  Umbrella OS — Stop Infrastructure (PowerShell)
# =============================================================================

$InfraDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Write-Host "Stopping Umbrella OS infrastructure..." -ForegroundColor Yellow
docker compose -f (Join-Path $InfraDir "docker-compose.yml") down
Write-Host "Infrastructure stopped." -ForegroundColor Green
