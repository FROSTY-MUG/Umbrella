# =============================================================================
#  Umbrella OS — Windows PowerShell Environment Setup
# =============================================================================
# Run in elevated PowerShell (Administrator)
#
# Usage:
#   .\infra\scripts\setup-windows.ps1
# =============================================================================

param(
    [switch]$InstallWSL,
    [switch]$InstallDocker,
    [switch]$SetupVenv,
    [switch]$All
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  UMBRELLA OS — WINDOWS ENVIRONMENT SETUP" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$UmbrellaRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

# --- Check current state ---
Write-Host "[1/6] Environment Audit" -ForegroundColor Yellow

$checks = @()

# Python
$pythonVer = try { python --version 2>&1 } catch { "Not installed" }
$checks += @{ Name = "Python"; Value = $pythonVer; OK = $pythonVer -match "Python 3" }

# Node
$nodeVer = try { node --version 2>&1 } catch { "Not installed" }
$checks += @{ Name = "Node.js"; Value = $nodeVer; OK = $nodeVer -match "v\d+" }

# pnpm
$pnpmVer = try { pnpm --version 2>&1 } catch { "Not installed" }
$checks += @{ Name = "pnpm"; Value = $pnpmVer; OK = $pnpmVer -match "\d+\.\d+" }

# WSL
$wslStatus = try { wsl -l -v 2>&1 } catch { "Not available" }
$hasUbuntu = $wslStatus -match "Ubuntu"
$checks += @{ Name = "WSL2 Ubuntu"; Value = $(if ($hasUbuntu) { "Installed" } else { "Not installed" }); OK = $hasUbuntu }

# Docker
$dockerVer = try { docker --version 2>&1 } catch { "Not installed" }
$checks += @{ Name = "Docker"; Value = $dockerVer; OK = $dockerVer -match "Docker" }

# GPU
$gpuInfo = try { nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>&1 } catch { "No NVIDIA GPU" }
$checks += @{ Name = "GPU"; Value = $gpuInfo; OK = $gpuInfo -notmatch "No NVIDIA" }

foreach ($c in $checks) {
    $badge = if ($c.OK) { "[PASS]" } else { "[WARN]" }
    $color = if ($c.OK) { "Green" } else { "Yellow" }
    Write-Host "  $badge $($c.Name): $($c.Value)" -ForegroundColor $color
}

# --- Drive audit ---
Write-Host ""
Write-Host "[2/6] Storage Audit" -ForegroundColor Yellow
Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -gt 0 } | ForEach-Object {
    $freeGB = [math]::Round($_.Free / 1GB, 2)
    $totalGB = [math]::Round(($_.Used + $_.Free) / 1GB, 2)
    $marker = if ($freeGB -ge 130) { " <-- RECOMMENDED for DATA_ROOT" } elseif ($freeGB -ge 50) { " <-- viable" } else { "" }
    Write-Host "  Drive $($_.Name): $freeGB GB free / $totalGB GB total$marker"
}

# --- Install WSL2 ---
if ($InstallWSL -or $All) {
    Write-Host ""
    Write-Host "[3/6] Installing WSL2 Ubuntu..." -ForegroundColor Yellow
    if (-not $hasUbuntu) {
        Write-Host "  Running: wsl --install Ubuntu-22.04"
        Write-Host "  This requires a restart. After restart, run this script again." -ForegroundColor Magenta
        wsl --install Ubuntu-22.04
    } else {
        Write-Host "  WSL2 Ubuntu already installed." -ForegroundColor Green
    }
}

# --- Install Docker Desktop ---
if ($InstallDocker -or $All) {
    Write-Host ""
    Write-Host "[4/6] Docker Desktop" -ForegroundColor Yellow
    if ($dockerVer -match "Docker") {
        Write-Host "  Docker already installed." -ForegroundColor Green
    } else {
        Write-Host "  Docker Desktop must be installed manually:"
        Write-Host "    https://docs.docker.com/desktop/install/windows-install/"
        Write-Host "  After install, enable WSL2 integration in Docker Desktop settings."
    }
}

# --- Setup Python venv ---
if ($SetupVenv -or $All) {
    Write-Host ""
    Write-Host "[5/6] Setting up Python virtual environment..." -ForegroundColor Yellow
    $venvPath = Join-Path $UmbrellaRoot ".venv"
    if (-not (Test-Path $venvPath)) {
        python -m venv $venvPath
        Write-Host "  Created venv at: $venvPath"
    }
    
    $activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        Write-Host "  To activate: . $activateScript"
        Write-Host "  Installing dependencies..."
        & (Join-Path $venvPath "Scripts\pip.exe") install -r (Join-Path $UmbrellaRoot "requirements.txt") -q
        Write-Host "  [OK] All Python packages installed."
    }
}

# --- Setup data lake ---
Write-Host ""
Write-Host "[6/6] Data Lake Initialization" -ForegroundColor Yellow
$dataRoot = Join-Path $UmbrellaRoot "data"
if (-not (Test-Path $dataRoot)) {
    Write-Host "  Running: python umbrella.py data init"
    python (Join-Path $UmbrellaRoot "umbrella.py") data init
} else {
    Write-Host "  Data directory exists at: $dataRoot"
}

# --- pnpm install ---
Write-Host ""
Write-Host "  Installing JS dependencies..." -ForegroundColor Yellow
$packagesDir = Join-Path $UmbrellaRoot "packages"
if (-not (Test-Path $packagesDir)) {
    New-Item -ItemType Directory -Path $packagesDir -Force | Out-Null
    Write-Host "  Created packages/ directory (pnpm workspace requirement)"
}

Push-Location $UmbrellaRoot
try {
    pnpm install
    Write-Host "  [OK] JS dependencies installed."
} catch {
    Write-Host "  [WARN] pnpm install failed: $_" -ForegroundColor Yellow
}
Pop-Location

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "    1. Activate venv: .\.venv\Scripts\Activate.ps1"
Write-Host "    2. Run doctor:    python umbrella.py doctor"
Write-Host "    3. Start all:     pnpm run dev:all"
Write-Host ""
