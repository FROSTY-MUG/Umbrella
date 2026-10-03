#!/usr/bin/env bash
# =============================================================================
#  Umbrella OS — Stop Infrastructure
# =============================================================================

set -euo pipefail
INFRA_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Stopping Umbrella OS infrastructure..."
docker compose -f "$INFRA_DIR/docker-compose.yml" down
echo "Infrastructure stopped."
