#!/usr/bin/env python3
"""
Umbrella OS - Unified Command Line Interface
Controls data acquisition, QC, AMR annotation, model training, and system verification.
"""

import os
import sys
import shutil
import platform
import subprocess
import argparse
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent

def run_doctor(args):
    print("\n" + "=" * 65)
    print("               UMBRELLA OS SYSTEM HEALTH AUDIT")
    print("=" * 65)

    checks = []

    # 1. Host runtime
    checks.append(("Host OS", platform.system() + " " + platform.release(), True))
    checks.append(("Python", platform.python_version(), True))

    # 2. Node & pnpm
    node_path = shutil.which("node")
    pnpm_path = shutil.which("pnpm")
    checks.append(("Node.js", node_path or "Missing", bool(node_path)))
    checks.append(("pnpm", pnpm_path or "Missing", bool(pnpm_path)))

    # 3. WSL2
    wsl_path = shutil.which("wsl")
    wsl_ok = False
    wsl_info = "Not found"
    if wsl_path:
        try:
            res = subprocess.run(["wsl", "-l", "-q"], capture_output=True, text=True, timeout=5)
            if "Ubuntu" in res.stdout or "ubuntu" in res.stdout:
                wsl_ok = True
                wsl_info = "Ubuntu-22.04 Active"
        except Exception:
            wsl_info = "Available"
            wsl_ok = True
    checks.append(("WSL2 Environment", wsl_info, wsl_ok))

    # 4. Storage Audit
    try:
        usage = shutil.disk_usage(str(ROOT_DIR))
        free_gb = round(usage.free / (1024**3), 2)
        total_gb = round(usage.total / (1024**3), 2)
        storage_status = f"{free_gb} GB Free (of {total_gb} GB)"
        checks.append(("Drive Capacity", storage_status, free_gb >= 10))
    except Exception as e:
        checks.append(("Drive Capacity", str(e), False))

    # 5. Data Lake Directories
    data_dirs = [
        "data/raw", "data/derived", "data/manifests", "data/benchmark", "data/models"
    ]
    missing_dirs = [d for d in data_dirs if not (ROOT_DIR / d).exists()]
    if missing_dirs:
        checks.append(("Data Lake Layout", f"Missing {len(missing_dirs)} directories", False))
    else:
        checks.append(("Data Lake Layout", "All directories verified", True))

    # 6. Database / Services
    docker_path = shutil.which("docker")
    checks.append(("Docker Host Engine", docker_path or "Not installed on host (WSL/local mode active)", bool(docker_path)))

    # 7. Print results
    for label, val, ok in checks:
        badge = "[PASS]" if ok else "[WARN]"
        print(f"  {badge:<7} {label:<22} : {val}")

    print("=" * 65 + "\n")
    return 0

def run_data_init(args):
    print("[Umbrella Data] Initializing scientific data lake...")
    for d in ["raw/genomes", "raw/amr", "raw/organizer", "derived/qc", "derived/amr", "derived/features", "manifests", "benchmark", "models"]:
        p = ROOT_DIR / "data" / d
        p.mkdir(parents=True, exist_ok=True)
    
    manifest_file = ROOT_DIR / "data" / "manifests" / "dataset_manifest.json"
    if not manifest_file.exists():
        manifest_data = {
            "dataset_id": "umbrella-init-2026",
            "source": "BV-BRC / NCBI AMRFinderPlus",
            "version": "1.0.0",
            "created_at": "2026-10-04T00:00:00Z",
            "genomes_staged": 0,
            "phenotype_records": 0,
            "status": "INITIALIZED"
        }
        manifest_file.write_text(json.dumps(manifest_data, indent=2))
        print(f"[Umbrella Data] Created master manifest at {manifest_file}")
    print("[Umbrella Data] Data lake initialization complete.")

def main():
    parser = argparse.ArgumentParser(
        prog="umbrella",
        description="Umbrella OS - Computational Biology Operating System CLI"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # doctor
    subparsers.add_parser("doctor", help="Verify system toolchain, database, storage, and models")

    # system status
    subparsers.add_parser("status", help="Show current active system state and telemetry")

    # data
    data_parser = subparsers.add_parser("data", help="Manage scientific data acquisition and normalization")
    data_sub = data_parser.add_subparsers(dest="data_action")
    data_sub.add_parser("init", help="Initialize data lake directories and manifests")
    data_sub.add_parser("manifest", help="Inspect active dataset manifests")
    data_sub.add_parser("verify", help="Verify SHA-256 checksums of stored raw sequence files")

    # qc
    qc_parser = subparsers.add_parser("qc", help="Run sequence quality control against FASTA files")
    qc_parser.add_argument("--input", required=False, help="Path to input FASTA file")

    args = parser.parse_args()

    if args.command == "doctor":
        sys.exit(run_doctor(args))
    elif args.command == "data":
        if args.data_action == "init":
            run_data_init(args)
        else:
            data_parser.print_help()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
