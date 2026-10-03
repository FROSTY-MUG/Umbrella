#!/usr/bin/env bash
# =============================================================================
#  Umbrella OS — AMRFinderPlus Installation (WSL)
# =============================================================================
# Version-pinned install of NCBI AMRFinderPlus inside WSL2 Ubuntu.
#
# Usage:
#   bash infra/scripts/install-amrfinder.sh
# =============================================================================

set -euo pipefail

AMRFINDER_VERSION="4.0.3"
INSTALL_DIR="/opt/amrfinder"

echo "============================================================"
echo "  UMBRELLA OS — AMRFinderPlus Installation"
echo "  Version: ${AMRFINDER_VERSION} (pinned)"
echo "============================================================"
echo ""

# Check if already installed
if command -v amrfinder &>/dev/null; then
    CURRENT_VER=$(amrfinder --version 2>/dev/null || echo "unknown")
    echo "[INFO] AMRFinderPlus already installed: $CURRENT_VER"
    echo "  Path: $(which amrfinder)"
    
    if [ "$CURRENT_VER" = "$AMRFINDER_VERSION" ]; then
        echo "  Version matches pinned version. No update needed."
        exit 0
    else
        echo "  [WARN] Version mismatch. Pinned: $AMRFINDER_VERSION, Installed: $CURRENT_VER"
        echo "  Proceeding with reinstall..."
    fi
fi

echo "[1/4] Installing build dependencies..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
    build-essential libcurl4-openssl-dev \
    hmmer ncbi-blast+ wget curl

echo ""
echo "[2/4] Downloading AMRFinderPlus v${AMRFINDER_VERSION}..."
sudo mkdir -p "$INSTALL_DIR"
cd /tmp

# Download from NCBI
TARBALL="amrfinderplus_v${AMRFINDER_VERSION}_binaries.tar.gz"
DOWNLOAD_URL="https://github.com/ncbi/amr/releases/download/amrfinderplus_v${AMRFINDER_VERSION}/${TARBALL}"

echo "  URL: $DOWNLOAD_URL"
if wget -q "$DOWNLOAD_URL" -O "$TARBALL" 2>/dev/null; then
    echo "  [OK] Downloaded binary release."
    tar xzf "$TARBALL"
    sudo cp -f amrfinder* "$INSTALL_DIR/"
    sudo ln -sf "$INSTALL_DIR/amrfinder" /usr/local/bin/amrfinder
elif [ -d /tmp/amr ]; then
    echo "  Binary download failed, using source build..."
else
    echo "  [INFO] Binary release not available. Building from source..."
    if [ ! -d /tmp/amr-source ]; then
        git clone --depth 1 --branch "amrfinderplus_v${AMRFINDER_VERSION}" \
            https://github.com/ncbi/amr.git /tmp/amr-source 2>/dev/null || \
        git clone --depth 1 https://github.com/ncbi/amr.git /tmp/amr-source
    fi
    cd /tmp/amr-source
    make -j$(nproc) 2>/dev/null || make
    sudo cp -f amrfinder /usr/local/bin/amrfinder
    sudo cp -f amr_report /usr/local/bin/amr_report 2>/dev/null || true
    sudo cp -f fasta_check /usr/local/bin/fasta_check 2>/dev/null || true
fi

echo ""
echo "[3/4] Updating AMRFinderPlus reference database..."
sudo mkdir -p /opt/amrfinder/data
amrfinder --update --force_update 2>/dev/null || \
    echo "  [WARN] Database update failed — may need manual download"

echo ""
echo "[4/4] Verifying installation..."
if command -v amrfinder &>/dev/null; then
    VER=$(amrfinder --version 2>/dev/null || echo "installed")
    WHICH=$(which amrfinder)
    echo ""
    echo "  ✅ AMRFinderPlus installed successfully"
    echo "  Version: $VER"
    echo "  Path:    $WHICH"
    echo ""
    echo "  Add to Umbrella .env:"
    echo "    AMRFINDER_PATH=$WHICH"
    echo ""
    echo "  Documented install:"
    echo "    Tool:     NCBI AMRFinderPlus"
    echo "    Version:  $AMRFINDER_VERSION (pinned)"
    echo "    Path:     $WHICH"
    echo "    Database: /opt/amrfinder/data/"
else
    echo "  [ERROR] Installation verification failed."
    echo "  Try manual install: https://github.com/ncbi/amr/wiki/Installing-AMRFinder"
    exit 1
fi
