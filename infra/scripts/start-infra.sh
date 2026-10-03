#!/usr/bin/env bash
# =============================================================================
#  Umbrella OS — Infrastructure Start (Docker Compose)
# =============================================================================
# Starts PostgreSQL (pgvector), Redis, and MinIO via Docker Compose.
#
# Usage:
#   bash infra/scripts/start-infra.sh
#   bash infra/scripts/start-infra.sh --detach
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$INFRA_DIR/docker-compose.yml"

echo "============================================================"
echo "  UMBRELLA OS — STARTING INFRASTRUCTURE"
echo "============================================================"
echo ""

if ! command -v docker &>/dev/null; then
    echo "[ERROR] Docker is not installed."
    echo "Install Docker Engine or Docker Desktop first."
    exit 1
fi

if ! docker info &>/dev/null 2>&1; then
    echo "[ERROR] Docker daemon is not running."
    echo "Start Docker Desktop or run: sudo service docker start"
    exit 1
fi

echo "[1/3] Starting services..."
docker compose -f "$COMPOSE_FILE" up -d

echo ""
echo "[2/3] Waiting for health checks..."
sleep 5

echo ""
echo "[3/3] Service status:"
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "============================================================"
echo "  INFRASTRUCTURE RUNNING"
echo "============================================================"
echo ""
echo "  PostgreSQL: localhost:5432  (user: umbrella, db: umbrella_os)"
echo "  Redis:      localhost:6379"
echo "  MinIO:      localhost:9000  (console: localhost:9001)"
echo ""
