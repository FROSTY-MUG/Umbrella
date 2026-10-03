#!/usr/bin/env bash
# =============================================================================
#  Umbrella OS — Storage Audit
# =============================================================================
# Enumerates all mounted drives/volumes and reports free space.
# Used before large data downloads to choose the safest DATA_ROOT location.
#
# Usage:
#   bash infra/scripts/storage-audit.sh
# =============================================================================

set -euo pipefail

echo ""
echo "============================================================"
echo "  UMBRELLA OS — STORAGE CAPACITY AUDIT"
echo "============================================================"
echo ""
echo "  Timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo ""

# List all mounted filesystems with space info
echo "  MOUNTED VOLUMES:"
echo "  ────────────────────────────────────────────────────────"
df -h --output=source,fstype,size,used,avail,pcent,target 2>/dev/null | head -20 || df -h

echo ""
echo "  RECOMMENDED DATA_ROOT CANDIDATES:"
echo "  ────────────────────────────────────────────────────────"

# Find mount points with most free space
BEST_MOUNT=""
BEST_AVAIL=0

while IFS= read -r line; do
    mount_point=$(echo "$line" | awk '{print $NF}')
    avail_kb=$(echo "$line" | awk '{print $(NF-2)}')
    
    # Convert to GB
    if [[ "$avail_kb" =~ ^[0-9]+$ ]]; then
        avail_gb=$((avail_kb / 1024 / 1024))
        if [ "$avail_gb" -gt "$BEST_AVAIL" ] && [ "$mount_point" != "/" ]; then
            BEST_AVAIL=$avail_gb
            BEST_MOUNT=$mount_point
        fi
        marker=""
        if [ "$avail_gb" -ge 130 ]; then
            marker=" ← SUFFICIENT for full data lake"
        elif [ "$avail_gb" -ge 50 ]; then
            marker=" ← viable for partial data lake"
        fi
        echo "  $mount_point: ${avail_gb} GB free${marker}"
    fi
done < <(df -k 2>/dev/null | tail -n +2)

echo ""
echo "  UMBRA DATA STORAGE CHECK"
echo "  Required capacity:       ~130 GB (target data lake)"
echo "  Best non-root volume:    ${BEST_MOUNT:-/} (${BEST_AVAIL} GB free)"

if [ "$BEST_AVAIL" -ge 130 ]; then
    echo "  Status:                  SUFFICIENT"
    echo "  Recommended DATA_ROOT:   ${BEST_MOUNT}/umbrella-data"
elif [ "$BEST_AVAIL" -ge 50 ]; then
    echo "  Status:                  PARTIAL — will download what fits"
    echo "  Recommended DATA_ROOT:   ${BEST_MOUNT}/umbrella-data"
else
    echo "  Status:                  INSUFFICIENT — partial acquisition only"
    echo "  Shortfall:               ~$((130 - BEST_AVAIL)) GB"
fi
echo ""
