# =============================================================================
#  Umbrella OS — Storage Audit (PowerShell)
# =============================================================================
# Enumerates all drives and reports free space for DATA_ROOT selection.
#
# Usage:
#   .\infra\scripts\storage-audit.ps1
# =============================================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  UMBRELLA OS — STORAGE CAPACITY AUDIT" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Timestamp: $((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))"
Write-Host ""

Write-Host "  DRIVE INVENTORY:" -ForegroundColor Yellow
Write-Host "  ────────────────────────────────────────────────────────"

$bestDrive = $null
$bestFree = 0

Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -gt 0 } | ForEach-Object {
    $freeGB = [math]::Round($_.Free / 1GB, 2)
    $totalGB = [math]::Round(($_.Used + $_.Free) / 1GB, 2)
    $usedPct = [math]::Round($_.Used / ($_.Used + $_.Free) * 100, 1)
    
    $marker = ""
    if ($freeGB -ge 130) {
        $marker = " <-- SUFFICIENT for full data lake"
    } elseif ($freeGB -ge 50) {
        $marker = " <-- viable for partial data lake"
    }
    
    # Track best non-C drive
    if ($_.Name -ne "C" -and $freeGB -gt $bestFree) {
        $bestDrive = $_.Name
        $bestFree = $freeGB
    }
    
    Write-Host "  Drive $($_.Name): $freeGB GB free / $totalGB GB total ($usedPct% used)$marker"
}

Write-Host ""
Write-Host "  UMBRA DATA STORAGE CHECK" -ForegroundColor Yellow
Write-Host "  ────────────────────────────────────────────────────────"
Write-Host "  Required capacity:       ~130 GB (target data lake)"

if ($bestDrive) {
    Write-Host "  Best non-system drive:   ${bestDrive}: ($bestFree GB free)"
    
    if ($bestFree -ge 130) {
        Write-Host "  Status:                  SUFFICIENT" -ForegroundColor Green
        Write-Host "  Recommended DATA_ROOT:   ${bestDrive}:\UmbrellaData"
    } elseif ($bestFree -ge 50) {
        Write-Host "  Status:                  PARTIAL — will download what fits" -ForegroundColor Yellow
        Write-Host "  Recommended DATA_ROOT:   ${bestDrive}:\UmbrellaData"
    } else {
        Write-Host "  Status:                  INSUFFICIENT" -ForegroundColor Red
        $shortfall = 130 - $bestFree
        Write-Host "  Shortfall:               ~$shortfall GB"
    }
} else {
    Write-Host "  [WARN] Only system drive (C:) detected" -ForegroundColor Yellow
    $cFree = [math]::Round((Get-PSDrive C).Free / 1GB, 2)
    Write-Host "  C: drive free: $cFree GB"
    if ($cFree -ge 130) {
        Write-Host "  Status: C: has enough space but using system drive is not recommended"
    } else {
        Write-Host "  Status: INSUFFICIENT — connect external storage"
    }
}

Write-Host ""
