#!/usr/bin/env bash
# =============================================================================
#  Umbrella OS — Full Development Server Start (Bash)
# =============================================================================
# Starts both the FastAPI backend and Next.js frontend concurrently.
#
# Usage:
#   bash infra/scripts/dev-start.sh
# =============================================================================

set -euo pipefail

UMBRELLA_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "============================================================"
echo "  UMBRELLA OS — STARTING DEVELOPMENT SERVERS"
echo "============================================================"
echo ""

# Activate venv if exists
if [ -f "$UMBRELLA_ROOT/.venv/bin/activate" ]; then
    source "$UMBRELLA_ROOT/.venv/bin/activate"
    echo "[OK] Python venv activated"
fi

# Check data lake
if [ ! -d "$UMBRELLA_ROOT/data/raw" ]; then
    echo "[INFO] Initializing data lake..."
    python "$UMBRELLA_ROOT/umbrella.py" data init
fi

# Ensure packages/ exists (pnpm workspace requirement)
mkdir -p "$UMBRELLA_ROOT/packages"

echo ""
echo "Starting services..."
echo "  Backend:  http://localhost:8000  (FastAPI)"
echo "  Frontend: http://localhost:3000  (Next.js)"
echo ""

cd "$UMBRELLA_ROOT"

# Run both concurrently
if command -v pnpm &>/dev/null; then
    pnpm run dev:all
else
    echo "[ERROR] pnpm not found. Install with: npm install -g pnpm"
    exit 1
fi
