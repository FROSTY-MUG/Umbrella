#!/usr/bin/env bash
# =============================================================================
#  Umbrella OS — WSL2 Ubuntu Environment Setup
# =============================================================================
# Run this INSIDE WSL2 Ubuntu after installing:
#   wsl --install Ubuntu-22.04
#
# Usage:
#   bash infra/scripts/setup-wsl.sh
# =============================================================================

set -euo pipefail

echo "============================================================"
echo "  UMBRELLA OS — WSL2 ENVIRONMENT SETUP"
echo "============================================================"
echo ""

# --- System packages ---
echo "[1/7] Installing system packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
    git curl wget build-essential cmake \
    python3-venv python3-pip python3-dev \
    jq pigz lftp unzip tar gzip \
    libpq-dev libffi-dev libssl-dev \
    pkg-config zlib1g-dev libbz2-dev liblzma-dev \
    2>/dev/null

echo "[OK] System packages installed."

# --- Node.js via NodeSource ---
echo ""
echo "[2/7] Installing Node.js LTS..."
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y -qq nodejs
fi
echo "  Node: $(node --version 2>/dev/null || echo 'not installed')"

# --- pnpm ---
echo ""
echo "[3/7] Installing pnpm..."
if ! command -v pnpm &>/dev/null; then
    npm install -g pnpm
fi
echo "  pnpm: $(pnpm --version 2>/dev/null || echo 'not installed')"

# --- Python venv ---
echo ""
echo "[4/7] Setting up Python virtual environment..."
VENV_DIR="$(cd "$(dirname "$0")/../.." && pwd)/.venv"
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
fi
source "$VENV_DIR/bin/activate"

echo "[OK] Python venv at: $VENV_DIR"

# --- Python packages ---
echo ""
echo "[5/7] Installing Python packages..."
pip install --upgrade pip setuptools wheel -q
pip install -q \
    fastapi "uvicorn[standard]" python-multipart \
    pydantic pydantic-settings \
    sqlalchemy asyncpg psycopg2-binary alembic \
    redis celery \
    minio \
    biopython \
    pandas numpy scipy pyarrow duckdb \
    scikit-learn joblib lightgbm xgboost \
    requests httpx \
    google-genai \
    pyyaml psutil

echo "[OK] All Python packages installed."

# --- Docker Engine ---
echo ""
echo "[6/7] Checking Docker Engine..."
if command -v docker &>/dev/null; then
    echo "  Docker: $(docker --version)"
    if command -v docker compose &>/dev/null || docker compose version &>/dev/null 2>&1; then
        echo "  Compose: $(docker compose version 2>/dev/null || echo 'plugin installed')"
    fi
else
    echo "  [INFO] Docker Engine not installed in WSL."
    echo "  To install:"
    echo "    sudo apt-get install docker.io docker-compose-plugin"
    echo "    sudo usermod -aG docker \$USER"
    echo "    sudo service docker start"
fi

# --- AMRFinderPlus ---
echo ""
echo "[7/7] Checking AMRFinderPlus..."
AMRFINDER_VERSION="4.0.3"  # Version-pinned per spec
if command -v amrfinder &>/dev/null; then
    echo "  AMRFinderPlus: $(amrfinder --version 2>/dev/null || echo 'installed')"
else
    echo "  [INFO] AMRFinderPlus not installed."
    echo "  To install (conda recommended):"
    echo "    conda create -n amrfinder -c bioconda ncbi-amrfinderplus=${AMRFINDER_VERSION}"
    echo "    conda activate amrfinder"
    echo "    amrfinder --update"
    echo ""
    echo "  Or via source:"
    echo "    cd /opt && sudo git clone https://github.com/ncbi/amr.git"
    echo "    cd amr && sudo make"
    echo "    sudo cp amrfinder /usr/local/bin/"
    echo "    amrfinder --update"
    echo ""
    echo "  Document install path in .env:"
    echo "    AMRFINDER_PATH=/usr/local/bin/amrfinder"
fi

echo ""
echo "============================================================"
echo "  WSL2 SETUP COMPLETE"
echo "============================================================"
echo ""
echo "  Next steps:"
echo "    1. Activate venv: source .venv/bin/activate"
echo "    2. Run doctor:    python umbrella.py doctor"
echo "    3. Init data:     python umbrella.py data init"
echo "    4. Start services: docker compose -f infra/docker-compose.yml up -d"
echo ""
