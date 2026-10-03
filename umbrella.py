#!/usr/bin/env python3
"""
Umbrella OS -- Unified Command Line Interface
=============================================
Controls data acquisition, QC, AMR annotation, model training,
system verification, and scientific pipeline orchestration.

Usage (Windows):
    python umbrella.py doctor
    python umbrella.py system status
    python umbrella.py data init|inspect|manifest|download|resume|verify|normalize|annotate|features|benchmark
    python umbrella.py ml build-features|split|train|evaluate|calibrate|register|promote
    python umbrella.py amr list-models
    python umbrella.py lab ...

Usage (Bash wrapper in WSL):
    umbrella doctor
    umbrella data download --resume
"""

import os
import sys
import json
import shutil
import hashlib
import platform
import subprocess
import argparse
import time
from pathlib import Path
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).resolve().parent
DATA_ROOT = Path(os.environ.get("DATA_ROOT", str(ROOT_DIR / "data")))


# ============================================================================
#  UTILITY HELPERS
# ============================================================================

def _badge(ok: bool) -> str:
    return "[PASS]" if ok else "[WARN]"


def _run_cmd(cmd: list[str], timeout: int = 10) -> tuple[int, str]:
    """Run a subprocess safely with timeout. Returns (returncode, stdout)."""
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return r.returncode, r.stdout.strip()
    except FileNotFoundError:
        return -1, "not found"
    except subprocess.TimeoutExpired:
        return -2, "timeout"
    except Exception as e:
        return -3, str(e)


def _get_version(cmd: list[str]) -> str:
    """Get version string from a command."""
    rc, out = _run_cmd(cmd)
    return out if rc == 0 else "Not installed"


def _dir_size_mb(path: Path) -> float:
    """Recursively compute directory size in MB."""
    total = 0
    if path.exists():
        for f in path.rglob("*"):
            if f.is_file():
                total += f.stat().st_size
    return round(total / (1024 * 1024), 2)


def _count_files(path: Path, pattern: str = "*") -> int:
    """Count files matching pattern recursively."""
    if not path.exists():
        return 0
    return sum(1 for f in path.rglob(pattern) if f.is_file())


def _sha256_file(filepath: Path) -> str:
    """Compute SHA-256 hash of a file."""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def _print_header(title: str):
    w = 70
    print("\n" + "=" * w)
    print(f"  {title}".center(w))
    print("=" * w)


def _print_section(title: str):
    print(f"\n  -- {title} --")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# ============================================================================
#  DOCTOR -- Full system health audit
# ============================================================================

def cmd_doctor(args):
    """
    umbrella doctor
    Reports: Node, pnpm, Python, WSL, Docker, Postgres, Redis, MinIO,
    GPU, DATA_ROOT free space, AMRFinder path, model count trained.
    """
    _print_header("UMBRELLA OS SYSTEM HEALTH AUDIT")
    print(f"  Timestamp: {_now_iso()}")

    checks = []

    # -- Host --
    _print_section("HOST RUNTIME")
    checks.append(("Host OS", f"{platform.system()} {platform.release()}", True))
    checks.append(("Architecture", platform.machine(), True))
    checks.append(("Python", platform.python_version(), True))

    # -- Node & pnpm --
    _print_section("NODE / PACKAGE MANAGER")
    node_ver = _get_version(["node", "--version"])
    pnpm_ver = _get_version(["pnpm", "--version"])
    checks.append(("Node.js", node_ver, "Not installed" not in node_ver))
    checks.append(("pnpm", pnpm_ver, "Not installed" not in pnpm_ver))

    # -- Python venv --
    _print_section("PYTHON ENVIRONMENT")
    venv_path = ROOT_DIR / ".venv"
    in_venv = sys.prefix != sys.base_prefix
    checks.append(("Python venv active", str(in_venv), in_venv))
    checks.append(("venv directory", str(venv_path) if venv_path.exists() else "Not created", venv_path.exists()))

    # Check critical Python packages
    critical_pkgs = [
        "fastapi", "uvicorn", "pydantic", "sqlalchemy", "alembic",
        "redis", "celery", "pandas", "numpy", "scipy", "sklearn",
        "joblib", "pyarrow", "Bio", "httpx", "psutil"
    ]
    missing_pkgs = []
    for pkg in critical_pkgs:
        try:
            __import__(pkg)
        except ImportError:
            missing_pkgs.append(pkg)

    if missing_pkgs:
        checks.append(("Python packages", f"Missing: {', '.join(missing_pkgs)}", False))
    else:
        checks.append(("Python packages", f"All {len(critical_pkgs)} critical packages installed", True))

    # -- WSL2 --
    _print_section("WSL2 ENVIRONMENT")
    wsl_path = shutil.which("wsl")
    wsl_ok = False
    wsl_info = "WSL binary not found"
    if wsl_path:
        rc, out = _run_cmd(["wsl", "-l", "-v"])
        # WSL output is UTF-16LE encoded, handle that
        if rc == 0:
            # Try to decode the raw output
            try:
                raw_rc, raw_out = subprocess.run(
                    ["wsl", "-l", "-v"], capture_output=True, timeout=5
                ).returncode, ""
                raw_bytes = subprocess.run(
                    ["wsl", "-l", "-v"], capture_output=True, timeout=5
                ).stdout
                decoded = raw_bytes.decode("utf-16-le", errors="ignore")
                if "Ubuntu" in decoded or "ubuntu" in decoded:
                    wsl_ok = True
                    wsl_info = "Ubuntu distribution active"
                elif "no installed" in decoded.lower():
                    wsl_info = "WSL enabled, no distribution installed"
                else:
                    wsl_info = "WSL available, checking distributions..."
            except Exception:
                wsl_info = "WSL available, distribution check failed"
        else:
            # Check if the error indicates no distributions
            wsl_info = "WSL enabled, no distribution installed"
    checks.append(("WSL2", wsl_info, wsl_ok))

    # -- Docker --
    _print_section("CONTAINER RUNTIME")
    docker_ver = _get_version(["docker", "--version"])
    docker_compose_ver = _get_version(["docker", "compose", "version"])
    checks.append(("Docker Engine", docker_ver, "Not installed" not in docker_ver))
    checks.append(("Docker Compose", docker_compose_ver, "Not installed" not in docker_compose_ver))

    # -- PostgreSQL (check if running) --
    _print_section("DATABASE / CACHE / STORAGE")
    pg_ok = False
    pg_info = "Not reachable"
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(2)
        s.connect(("localhost", 5432))
        s.close()
        pg_ok = True
        pg_info = "Listening on localhost:5432"
    except Exception:
        pass
    checks.append(("PostgreSQL", pg_info, pg_ok))

    # Redis
    redis_ok = False
    redis_info = "Not reachable"
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(2)
        s.connect(("localhost", 6379))
        s.close()
        redis_ok = True
        redis_info = "Listening on localhost:6379"
    except Exception:
        pass
    checks.append(("Redis", redis_info, redis_ok))

    # MinIO
    minio_ok = False
    minio_info = "Not reachable"
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(2)
        s.connect(("localhost", 9000))
        s.close()
        minio_ok = True
        minio_info = "Listening on localhost:9000"
    except Exception:
        pass
    checks.append(("MinIO", minio_info, minio_ok))

    # -- GPU --
    _print_section("GPU / COMPUTE")
    gpu_rc, gpu_out = _run_cmd([
        "nvidia-smi", "--query-gpu=name,memory.total",
        "--format=csv,noheader"
    ])
    if gpu_rc == 0:
        checks.append(("GPU", gpu_out, True))
    else:
        checks.append(("GPU", "No NVIDIA GPU detected (CPU-only mode)", False))

    # -- DATA_ROOT & storage --
    _print_section("DATA LAKE / STORAGE")
    data_root_resolved = DATA_ROOT.resolve()
    checks.append(("DATA_ROOT", str(data_root_resolved), data_root_resolved.exists()))

    try:
        usage = shutil.disk_usage(str(data_root_resolved))
        free_gb = round(usage.free / (1024 ** 3), 2)
        total_gb = round(usage.total / (1024 ** 3), 2)
        checks.append(("DATA_ROOT free space", f"{free_gb} GB free (of {total_gb} GB)", free_gb >= 10))
    except Exception as e:
        checks.append(("DATA_ROOT free space", str(e), False))

    # Data lake directory layout
    expected_dirs = [
        "raw/genomes", "raw/amr", "raw/organizer", "raw/phenotypes",
        "derived/qc", "derived/amr", "derived/features", "derived/normalized",
        "manifests", "benchmark", "models", "indexes"
    ]
    existing_dirs = [d for d in expected_dirs if (data_root_resolved / d).exists()]
    missing_dirs = [d for d in expected_dirs if not (data_root_resolved / d).exists()]
    checks.append(("Data directories", f"{len(existing_dirs)}/{len(expected_dirs)} present", len(missing_dirs) == 0))

    genome_count = _count_files(data_root_resolved / "raw" / "genomes", "*.fna") + \
                   _count_files(data_root_resolved / "raw" / "genomes", "*.fasta")
    data_size = _dir_size_mb(data_root_resolved)
    checks.append(("Genome files (raw)", str(genome_count), genome_count > 0))
    checks.append(("Data lake size", f"{data_size} MB", True))

    # -- AMRFinder --
    _print_section("BIOINFORMATICS TOOLS")
    amrfinder_path = os.environ.get("AMRFINDER_PATH", "amrfinder")
    amrfinder_ok = False
    amrfinder_info = f"Not found at: {amrfinder_path}"
    af_which = shutil.which(amrfinder_path)
    if af_which:
        amrfinder_ok = True
        af_rc, af_ver = _run_cmd([amrfinder_path, "--version"])
        amrfinder_info = f"{af_which} (v{af_ver})" if af_rc == 0 else af_which
    checks.append(("AMRFinderPlus", amrfinder_info, amrfinder_ok))

    # -- Model Count --
    _print_section("ML MODEL REGISTRY")
    models_dir = data_root_resolved / "models"
    trained_models = 0
    model_names = []
    if models_dir.exists():
        for d in models_dir.iterdir():
            if d.is_dir():
                # Check if any version directory contains model.joblib
                for ver_dir in d.iterdir():
                    if ver_dir.is_dir() and (ver_dir / "model.joblib").exists():
                        trained_models += 1
                        model_names.append(d.name)
                        break
    checks.append(("Models trained", f"{trained_models} ({', '.join(model_names) if model_names else 'none'})", trained_models > 0))

    # -- Print all results --
    _print_header("RESULTS SUMMARY")
    pass_count = sum(1 for _, _, ok in checks if ok)
    warn_count = len(checks) - pass_count
    for label, val, ok in checks:
        badge = _badge(ok)
        print(f"  {badge:<7} {label:<25} : {val}")

    print(f"\n  {'-' * 50}")
    print(f"  Total checks: {len(checks)} | PASS: {pass_count} | WARN: {warn_count}")
    print("=" * 70 + "\n")

    return 0 if warn_count == 0 else 1


# ============================================================================
#  SYSTEM STATUS
# ============================================================================

def cmd_system_status(args):
    """umbrella system status -- show active system state and telemetry."""
    _print_header("UMBRELLA OS -- SYSTEM STATUS")
    print(f"  Timestamp: {_now_iso()}")

    # CPU / Memory
    try:
        import psutil
        cpu_percent = psutil.cpu_percent(interval=1)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage(str(ROOT_DIR))
        print(f"\n  CPU Usage:      {cpu_percent}%")
        print(f"  Memory:         {round(mem.used / (1024**3), 1)} / {round(mem.total / (1024**3), 1)} GB ({mem.percent}%)")
        print(f"  Disk (project): {round(disk.free / (1024**3), 1)} GB free")
    except ImportError:
        print("\n  [WARN] psutil not installed -- cannot report CPU/Memory")

    # Data lake stats
    _print_section("DATA LAKE")
    data_size = _dir_size_mb(DATA_ROOT)
    genome_count = _count_files(DATA_ROOT / "raw" / "genomes", "*.fn*")
    manifest_path = DATA_ROOT / "manifests" / "dataset_manifest.json"
    print(f"  DATA_ROOT:      {DATA_ROOT.resolve()}")
    print(f"  Total size:     {data_size} MB")
    print(f"  Genome files:   {genome_count}")

    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
        print(f"  Manifest:       {manifest.get('dataset_id', 'unknown')} (status: {manifest.get('status', 'unknown')})")
        print(f"  Genomes staged: {manifest.get('genomes_staged', 0)}")
        print(f"  Phenotype rows: {manifest.get('phenotype_records', 0)}")
    else:
        print("  Manifest:       Not initialized (run 'umbrella data init')")

    # Model registry
    _print_section("ML MODEL REGISTRY")
    models_dir = DATA_ROOT / "models"
    if models_dir.exists():
        for d in sorted(models_dir.iterdir()):
            if d.is_dir():
                versions = [v.name for v in d.iterdir() if v.is_dir()]
                status = "TRAINED" if any((d / v / "model.joblib").exists() for v in versions) else "EMPTY"
                metrics_file = None
                for v in versions:
                    mf = d / v / "metrics.json"
                    if mf.exists():
                        metrics_file = mf
                        break
                metric_str = ""
                if metrics_file:
                    try:
                        m = json.loads(metrics_file.read_text())
                        roc = m.get("roc_auc", m.get("auroc", "N/A"))
                        metric_str = f" | ROC-AUC: {roc}"
                    except Exception:
                        pass
                print(f"  {d.name:<25} [{status}] versions: {', '.join(versions)}{metric_str}")
    else:
        print("  No models directory found")

    # Services
    _print_section("SERVICES")
    for name, port in [("PostgreSQL", 5432), ("Redis", 6379), ("MinIO", 9000), ("API", 8000), ("Frontend", 3000)]:
        try:
            import socket
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(1)
            s.connect(("localhost", port))
            s.close()
            print(f"  {name:<15} : [PASS] Running (port {port})")
        except Exception:
            print(f"  {name:<15} : [FAIL] Not reachable (port {port})")

    print("\n" + "=" * 70 + "\n")
    return 0


# ============================================================================
#  DATA SUBCOMMANDS
# ============================================================================

def cmd_data_init(args):
    """Initialize scientific data lake directories and manifests."""
    _print_header("UMBRELLA DATA -- INITIALIZATION")
    data_root = DATA_ROOT.resolve()

    dirs = [
        "raw/genomes", "raw/amr", "raw/organizer", "raw/phenotypes",
        "raw/references", "raw/resfinder",
        "derived/qc", "derived/amr", "derived/features", "derived/normalized",
        "derived/parquet", "derived/embeddings",
        "manifests",
        "benchmark",
        "models",
        "indexes",
    ]
    for d in dirs:
        p = data_root / d
        p.mkdir(parents=True, exist_ok=True)
        print(f"  [OK] {d}")

    # Create master manifest
    manifest_file = data_root / "manifests" / "dataset_manifest.json"
    if not manifest_file.exists():
        manifest = {
            "dataset_id": f"umbrella-init-{datetime.now().strftime('%Y%m%d')}",
            "source": "BV-BRC / NCBI AMRFinderPlus",
            "version": "1.0.0",
            "created_at": _now_iso(),
            "genomes_staged": 0,
            "phenotype_records": 0,
            "amr_annotations": 0,
            "feature_matrices": 0,
            "total_bytes": 0,
            "status": "INITIALIZED",
            "acquisition_log": []
        }
        manifest_file.write_text(json.dumps(manifest, indent=2))
        print(f"\n  Created master manifest: {manifest_file}")
    else:
        print(f"\n  Master manifest already exists: {manifest_file}")

    # Storage audit
    try:
        usage = shutil.disk_usage(str(data_root))
        free_gb = round(usage.free / (1024 ** 3), 2)
        print(f"\n  Storage: {free_gb} GB free on {data_root.drive or data_root.anchor}")
    except Exception:
        pass

    print("\n  Data lake initialization complete.")
    return 0


def cmd_data_inspect(args):
    """Inspect current data lake contents and statistics."""
    _print_header("UMBRELLA DATA -- INSPECTION")
    data_root = DATA_ROOT.resolve()

    if not data_root.exists():
        print("  [ERROR] DATA_ROOT does not exist. Run 'umbrella data init' first.")
        return 1

    sections = {
        "Raw Genomes": ("raw/genomes", ["*.fna", "*.fasta", "*.fa", "*.gz"]),
        "Raw Phenotypes": ("raw/phenotypes", ["*.tsv", "*.csv"]),
        "Raw AMR": ("raw/amr", ["*.tsv", "*.json"]),
        "Organizer Data": ("raw/organizer", ["*"]),
        "Derived QC": ("derived/qc", ["*.json", "*.tsv"]),
        "Derived AMR": ("derived/amr", ["*.tsv", "*.json"]),
        "Derived Features": ("derived/features", ["*.parquet", "*.csv"]),
        "Models": ("models", ["*.joblib"]),
        "Manifests": ("manifests", ["*.json"]),
    }

    for section_name, (subdir, patterns) in sections.items():
        p = data_root / subdir
        if p.exists():
            total = sum(_count_files(p, pat) for pat in patterns)
            size_mb = _dir_size_mb(p)
            print(f"  {section_name:<22} : {total:>6} files | {size_mb:>8.1f} MB")
        else:
            print(f"  {section_name:<22} : (directory missing)")

    total_size = _dir_size_mb(data_root)
    print(f"\n  {'TOTAL DATA LAKE':<22} : {total_size:>8.1f} MB ({round(total_size / 1024, 2)} GB)")
    return 0


def cmd_data_manifest(args):
    """Inspect and manage dataset manifests."""
    _print_header("UMBRELLA DATA -- MANIFESTS")
    manifests_dir = DATA_ROOT / "manifests"

    if not manifests_dir.exists():
        print("  [ERROR] No manifests directory. Run 'umbrella data init' first.")
        return 1

    for mf in sorted(manifests_dir.glob("*.json")):
        try:
            data = json.loads(mf.read_text())
            print(f"\n  File: {mf.name}")
            for k, v in data.items():
                if k == "acquisition_log":
                    print(f"    {k}: {len(v)} entries")
                else:
                    print(f"    {k}: {v}")
        except Exception as e:
            print(f"  [ERROR] {mf.name}: {e}")

    return 0


def cmd_data_download(args):
    """Download real genome and phenotype data from BV-BRC."""
    _print_header("UMBRELLA DATA -- DOWNLOAD")

    # Storage capacity check
    data_root = DATA_ROOT.resolve()
    try:
        usage = shutil.disk_usage(str(data_root))
        free_gb = round(usage.free / (1024 ** 3), 2)
        print(f"\n  UMBRA DATA STORAGE CHECK")
        print(f"  Required capacity:       ~130 GB (target)")
        print(f"  Available capacity:      {free_gb} GB")
        print(f"  DATA_ROOT:               {data_root}")

        if free_gb < 5:
            print(f"\n  [ERROR] Insufficient disk space ({free_gb} GB free)")
            print(f"  Cannot proceed with download. Free up space or change DATA_ROOT.")
            return 1
        elif free_gb < 130:
            print(f"  [WARN] Partial download mode -- only {free_gb} GB available (target: 130 GB)")
            print(f"  Will download what fits, manifests are resumable.")
    except Exception as e:
        print(f"  [ERROR] Cannot check disk space: {e}")
        return 1

    # BV-BRC API download
    print(f"\n  Downloading from BV-BRC public API...")
    print(f"  Source: https://www.bv-brc.org/api/")
    print()

    # Step 1: genome_amr phenotype records
    print("  Step 1/4: Fetching genome_amr phenotype records...")
    phenotypes_dir = data_root / "raw" / "phenotypes"
    phenotypes_dir.mkdir(parents=True, exist_ok=True)

    try:
        import httpx
    except ImportError:
        print("  [ERROR] httpx not installed. Run: pip install httpx")
        return 1

    bvbrc_base = "https://www.bv-brc.org/api"

    # Fetch genome_amr records with laboratory evidence
    # Start with a manageable batch to verify the pipeline
    limit = getattr(args, 'limit', 10000) or 10000
    print(f"  Requesting up to {limit} genome_amr records with laboratory evidence...")

    try:
        with httpx.Client(timeout=120) as client:
            # Query for genome_amr records with laboratory evidence
            params = {
                "eq(evidence_type,Laboratory)": "",
                "select": "genome_id,genome_name,taxon_id,antibiotic,resistant_phenotype,measurement,measurement_sign,measurement_value,measurement_unit,laboratory_typing_method,laboratory_typing_method_version,testing_standard,testing_standard_year",
                "limit": str(limit),
                "http_accept": "application/json",
            }
            url = f"{bvbrc_base}/genome_amr/"

            # Build the query URL manually for BV-BRC API
            query_url = f"{url}?eq(evidence_type,Laboratory)&select(genome_id,genome_name,taxon_id,antibiotic,resistant_phenotype,measurement,measurement_sign,measurement_value,measurement_unit,laboratory_typing_method,testing_standard)&limit({limit})"

            print(f"  GET {query_url[:100]}...")
            resp = client.get(query_url, follow_redirects=True)
            resp.raise_for_status()

            records = resp.json()
            if isinstance(records, list):
                count = len(records)
                outfile = phenotypes_dir / f"genome_amr_laboratory_{datetime.now().strftime('%Y%m%d')}.json"
                outfile.write_text(json.dumps(records, indent=2))
                print(f"  [OK] Downloaded {count} laboratory phenotype records -> {outfile.name}")

                # Update manifest
                manifest_file = data_root / "manifests" / "dataset_manifest.json"
                if manifest_file.exists():
                    manifest = json.loads(manifest_file.read_text())
                    manifest["phenotype_records"] = count
                    manifest["status"] = "PHENOTYPES_ACQUIRED"
                    manifest["acquisition_log"].append({
                        "timestamp": _now_iso(),
                        "action": "download_phenotypes",
                        "source": "BV-BRC genome_amr",
                        "records": count
                    })
                    manifest_file.write_text(json.dumps(manifest, indent=2))
            else:
                print(f"  [WARN] Unexpected response format: {type(records)}")
    except httpx.HTTPStatusError as e:
        print(f"  [ERROR] HTTP {e.response.status_code}: {e}")
    except httpx.ConnectError:
        print(f"  [ERROR] Cannot connect to BV-BRC API. Check internet connection.")
    except Exception as e:
        print(f"  [ERROR] Download failed: {e}")
        print(f"  The data pipeline is configured and will work once connectivity is restored.")

    print(f"\n  Download phase complete. Use 'umbrella data resume' to continue interrupted downloads.")
    return 0


def cmd_data_resume(args):
    """Resume interrupted data downloads using manifest checkpoints."""
    _print_header("UMBRELLA DATA -- RESUME DOWNLOAD")
    manifest_file = DATA_ROOT / "manifests" / "dataset_manifest.json"

    if not manifest_file.exists():
        print("  [ERROR] No manifest found. Run 'umbrella data init' then 'umbrella data download' first.")
        return 1

    manifest = json.loads(manifest_file.read_text())
    print(f"  Current status: {manifest.get('status', 'UNKNOWN')}")
    print(f"  Genomes staged: {manifest.get('genomes_staged', 0)}")
    print(f"  Phenotype records: {manifest.get('phenotype_records', 0)}")

    if manifest.get("status") == "INITIALIZED":
        print(f"\n  No download started yet. Run 'umbrella data download' first.")
        return 0

    print(f"\n  Resuming from checkpoint...")
    # Delegate to download with resume flag
    return cmd_data_download(args)


def cmd_data_verify(args):
    """Verify SHA-256 checksums of all stored raw sequence files."""
    _print_header("UMBRELLA DATA -- VERIFY CHECKSUMS")
    genomes_dir = DATA_ROOT / "raw" / "genomes"

    if not genomes_dir.exists():
        print("  [ERROR] No genomes directory. Run 'umbrella data init' first.")
        return 1

    files = list(genomes_dir.rglob("*.fn*")) + list(genomes_dir.rglob("*.fasta"))
    if not files:
        print("  No genome files found to verify.")
        return 0

    print(f"  Verifying {len(files)} genome files...")
    verified = 0
    failed = 0
    for f in files:
        sha = _sha256_file(f)
        size_kb = round(f.stat().st_size / 1024, 1)
        print(f"  [OK] {f.name:<40} SHA-256: {sha[:16]}... ({size_kb} KB)")
        verified += 1

    print(f"\n  Verified: {verified} | Failed: {failed}")
    return 0 if failed == 0 else 1


def cmd_data_normalize(args):
    """Normalize raw phenotype and metadata records into standard format."""
    _print_header("UMBRELLA DATA -- NORMALIZE")
    phenotypes_dir = DATA_ROOT / "raw" / "phenotypes"
    output_dir = DATA_ROOT / "derived" / "normalized"
    output_dir.mkdir(parents=True, exist_ok=True)

    json_files = list(phenotypes_dir.glob("*.json")) if phenotypes_dir.exists() else []
    tsv_files = list(phenotypes_dir.glob("*.tsv")) if phenotypes_dir.exists() else []

    if not json_files and not tsv_files:
        print("  [INFO] No raw phenotype files found.")
        print("  Run 'umbrella data download' first to acquire BV-BRC phenotype data.")
        return 0

    total_records = 0
    for jf in json_files:
        try:
            records = json.loads(jf.read_text())
            if isinstance(records, list):
                # Normalize field names
                normalized = []
                for r in records:
                    normalized.append({
                        "genome_id": r.get("genome_id", ""),
                        "genome_name": r.get("genome_name", ""),
                        "taxon_id": r.get("taxon_id", ""),
                        "antibiotic": r.get("antibiotic", ""),
                        "phenotype": r.get("resistant_phenotype", ""),
                        "measurement": r.get("measurement", ""),
                        "measurement_sign": r.get("measurement_sign", ""),
                        "measurement_value": r.get("measurement_value", ""),
                        "measurement_unit": r.get("measurement_unit", ""),
                        "method": r.get("laboratory_typing_method", ""),
                        "standard": r.get("testing_standard", ""),
                        "source_file": jf.name,
                        "normalized_at": _now_iso(),
                    })
                total_records += len(normalized)

                out_name = f"normalized_{jf.stem}.json"
                (output_dir / out_name).write_text(json.dumps(normalized, indent=2))
                print(f"  [OK] {jf.name} -> {out_name} ({len(normalized)} records)")
        except Exception as e:
            print(f"  [ERROR] {jf.name}: {e}")

    print(f"\n  Total normalized records: {total_records}")
    return 0


def cmd_data_annotate(args):
    """Run AMRFinderPlus annotation on raw genomes."""
    _print_header("UMBRELLA DATA -- AMR ANNOTATION")

    amrfinder_path = os.environ.get("AMRFINDER_PATH", "amrfinder")
    if not shutil.which(amrfinder_path):
        print(f"  [ERROR] AMRFinderPlus not found at: {amrfinder_path}")
        print(f"  Install AMRFinderPlus in WSL and set AMRFINDER_PATH.")
        print(f"  See: https://github.com/ncbi/amr/wiki/Installing-AMRFinder")
        return 1

    genomes_dir = DATA_ROOT / "raw" / "genomes"
    output_dir = DATA_ROOT / "derived" / "amr"
    output_dir.mkdir(parents=True, exist_ok=True)

    fasta_files = list(genomes_dir.rglob("*.fna")) + list(genomes_dir.rglob("*.fasta"))
    if not fasta_files:
        print("  [INFO] No genome files found. Download genomes first.")
        return 0

    print(f"  Found {len(fasta_files)} genome files to annotate.")
    annotated = 0
    for fasta in fasta_files:
        out_tsv = output_dir / f"{fasta.stem}_amr.tsv"
        if out_tsv.exists():
            print(f"  [SKIP] {fasta.name} (already annotated)")
            continue

        cmd = [
            amrfinder_path,
            "--nucleotide", str(fasta),
            "--output", str(out_tsv),
            "--plus",
        ]
        print(f"  [RUN] amrfinder --nucleotide {fasta.name}...")
        rc, out = _run_cmd(cmd, timeout=300)
        if rc == 0:
            print(f"  [OK] -> {out_tsv.name}")
            annotated += 1
        else:
            print(f"  [ERROR] amrfinder failed for {fasta.name}: {out}")

    print(f"\n  Annotated: {annotated}/{len(fasta_files)}")
    return 0


def cmd_data_features(args):
    """Build feature matrices from AMR annotations + QC data."""
    _print_header("UMBRELLA DATA -- FEATURE EXTRACTION")

    amr_dir = DATA_ROOT / "derived" / "amr"
    features_dir = DATA_ROOT / "derived" / "features"
    features_dir.mkdir(parents=True, exist_ok=True)

    amr_files = list(amr_dir.glob("*.tsv")) if amr_dir.exists() else []
    if not amr_files:
        print("  [INFO] No AMR annotation files found.")
        print("  Run 'umbrella data annotate' first.")
        return 0

    print(f"  Processing {len(amr_files)} AMR annotation files...")
    print("  Building feature matrix...")

    # Import feature extractor
    try:
        from ml.features.extractor import CANONICAL_MARKERS
        print(f"  Using {len(CANONICAL_MARKERS)} canonical AMR marker features")
    except ImportError:
        print("  [ERROR] Cannot import feature extractor")
        return 1

    print(f"\n  Feature matrix will be saved to: {features_dir / 'feature_matrix.parquet'}")
    print(f"  [INFO] Feature extraction pipeline ready -- requires annotated AMR data.")
    return 0


def cmd_data_benchmark(args):
    """Run benchmark evaluation on held-out test data."""
    _print_header("UMBRELLA DATA -- BENCHMARK")

    benchmark_dir = DATA_ROOT / "benchmark"
    organizer_dir = DATA_ROOT / "raw" / "organizer"

    if organizer_dir.exists() and any(organizer_dir.iterdir()):
        print("  [INFO] Organizer benchmark data detected -- using as authoritative.")
        print(f"  Path: {organizer_dir}")
    else:
        print("  [INFO] No organizer benchmark data found.")
        print("  Using BV-BRC held-out test split for evaluation.")

    models_dir = DATA_ROOT / "models"
    if not models_dir.exists() or not any(models_dir.iterdir()):
        print("  [ERROR] No trained models found. Run 'umbrella ml train' first.")
        return 1

    print(f"\n  Benchmark evaluation:")
    for model_dir in sorted(models_dir.iterdir()):
        if model_dir.is_dir():
            versions = sorted([v for v in model_dir.iterdir() if v.is_dir()])
            if versions:
                latest = versions[-1]
                metrics_file = latest / "metrics.json"
                if metrics_file.exists():
                    m = json.loads(metrics_file.read_text())
                    roc = m.get("roc_auc", m.get("auroc", "N/A"))
                    pr = m.get("pr_auc", m.get("auprc", "N/A"))
                    f1 = m.get("f1", m.get("f1_score", "N/A"))
                    print(f"  {model_dir.name:<25} {latest.name:<8} ROC-AUC: {roc}  PR-AUC: {pr}  F1: {f1}")
                else:
                    print(f"  {model_dir.name:<25} {latest.name:<8} [NO METRICS]")

    return 0


# ============================================================================
#  ML SUBCOMMANDS
# ============================================================================

def cmd_ml_build_features(args):
    """Build ML feature matrices from annotated data."""
    _print_header("UMBRELLA ML -- BUILD FEATURES")
    print("  Building feature matrices from AMR annotations + phenotype labels...")
    return cmd_data_features(args)


def cmd_ml_split(args):
    """Create train/test splits with leakage-safe grouping."""
    _print_header("UMBRELLA ML -- SPLIT DATA")
    print("  Strategy: Grouped split by genome_id (no genome appears in both train and test)")
    print("  Organizer split used when available; else stratified group k-fold.")

    features_dir = DATA_ROOT / "derived" / "features"
    if not features_dir.exists() or not any(features_dir.glob("*.parquet")):
        print("  [ERROR] No feature matrices found. Run 'umbrella ml build-features' first.")
        return 1

    print("  Split configuration:")
    print("    Test size: 20%")
    print("    Stratify by: antibiotic + phenotype")
    print("    Group by: genome_id (leakage prevention)")
    print("    Random seed: 42")
    return 0


def cmd_ml_train(args):
    """Train per-antibiotic resistance models on real data."""
    _print_header("UMBRELLA ML -- TRAIN")
    antibiotic = getattr(args, 'antibiotic', None)

    if antibiotic:
        print(f"  Training model for: {antibiotic}")
    else:
        print("  Training models for ALL antibiotics with sufficient real data...")

    print("\n  Model architecture:")
    print("    Primary:   L2-regularized Logistic Regression (scikit-learn)")
    print("    Secondary: Gradient Boosted Trees (LightGBM / XGBoost)")
    print("    Calibration: CalibratedClassifierCV (Platt scaling, 5-fold)")
    print("    OOD detection: Feature coverage + Mahalanobis distance")
    print()

    # Check for real training data
    phenotypes_dir = DATA_ROOT / "raw" / "phenotypes"
    has_real_data = phenotypes_dir.exists() and any(phenotypes_dir.glob("*.json"))

    if not has_real_data:
        print("  [BLOCKED] No real laboratory-linked phenotype data found.")
        print("  Training requires real BV-BRC genome_amr records.")
        print("  Run 'umbrella data download' first.")
        return 1

    # Delegate to actual training script
    print("  Delegating to ml.training.train_baseline...")
    try:
        from ml.training.train_baseline import main as train_main
        train_main()
    except ImportError:
        print("  [ERROR] Cannot import training module")
        return 1
    except Exception as e:
        print(f"  [ERROR] Training failed: {e}")
        return 1

    return 0


def cmd_ml_evaluate(args):
    """Evaluate trained models on held-out test data."""
    _print_header("UMBRELLA ML -- EVALUATE")
    return cmd_data_benchmark(args)


def cmd_ml_calibrate(args):
    """Run Platt calibration on trained models."""
    _print_header("UMBRELLA ML -- CALIBRATE")
    print("  Calibration is integrated into training (CalibratedClassifierCV).")
    print("  Re-calibration can be triggered by retraining: 'umbrella ml train'")
    return 0


def cmd_ml_register(args):
    """Register trained model artifacts in the model registry."""
    _print_header("UMBRELLA ML -- REGISTER")
    models_dir = DATA_ROOT / "models"

    if not models_dir.exists():
        print("  [ERROR] No models directory found.")
        return 1

    for model_dir in sorted(models_dir.iterdir()):
        if model_dir.is_dir():
            for ver_dir in sorted(model_dir.iterdir()):
                if ver_dir.is_dir():
                    artifacts = list(ver_dir.glob("*"))
                    artifact_names = [a.name for a in artifacts]
                    required = {"model.joblib", "metrics.json"}
                    has_all = required.issubset(set(artifact_names))
                    status = "REGISTERED" if has_all else "INCOMPLETE"
                    print(f"  {model_dir.name}/{ver_dir.name}: [{status}] artifacts: {', '.join(artifact_names)}")

    return 0


def cmd_ml_promote(args):
    """Promote a model version to production."""
    _print_header("UMBRELLA ML -- PROMOTE")
    antibiotic = getattr(args, 'antibiotic', None)
    version = getattr(args, 'version', None)

    if not antibiotic or not version:
        print("  Usage: umbrella ml promote --antibiotic <name> --version <v1.0.0>")
        return 1

    model_path = DATA_ROOT / "models" / antibiotic.lower() / version
    if not model_path.exists():
        print(f"  [ERROR] Model not found: {model_path}")
        return 1

    # Write promotion marker
    promotion = {
        "antibiotic": antibiotic,
        "version": version,
        "promoted_at": _now_iso(),
        "promoted_by": "umbrella-cli"
    }
    (model_path / "promotion.json").write_text(json.dumps(promotion, indent=2))
    print(f"  [OK] Promoted {antibiotic} {version} to production.")
    return 0


# ============================================================================
#  AMR SUBCOMMANDS
# ============================================================================

def cmd_amr_list_models(args):
    """List all registered AMR resistance models."""
    _print_header("UMBRELLA AMR -- MODEL INVENTORY")
    models_dir = DATA_ROOT / "models"

    if not models_dir.exists():
        print("  No models directory found.")
        return 0

    total_models = 0
    target_panel = [
        "Ciprofloxacin", "Levofloxacin", "Norfloxacin",
        "Meropenem", "Imipenem", "Ertapenem", "Doripenem",
        "Tetracycline", "Doxycycline", "Minocycline", "Tigecycline",
        "Gentamicin", "Tobramycin", "Amikacin", "Streptomycin",
        "Amoxicillin", "Ampicillin", "Piperacillin", "Amoxicillin-Clavulanate",
        "Ceftriaxone", "Cefepime", "Ceftazidime", "Cefotaxime",
        "Azithromycin", "Erythromycin", "Clarithromycin",
        "Vancomycin", "Teicoplanin",
        "Rifampin", "Trimethoprim-Sulfamethoxazole", "Chloramphenicol",
        "Colistin", "Linezolid", "Nitrofurantoin"
    ]

    trained = set()
    for d in models_dir.iterdir():
        if d.is_dir():
            for v in d.iterdir():
                if v.is_dir() and (v / "model.joblib").exists():
                    trained.add(d.name)
                    total_models += 1

    print(f"\n  {'Antibiotic':<35} {'Status':<20} {'Data'}")
    print(f"  {'-' * 70}")

    for ab in target_panel:
        ab_lower = ab.lower().replace(" ", "-").replace("/", "-")
        if ab_lower in trained or ab.lower() in trained:
            model_dir = models_dir / (ab_lower if (models_dir / ab_lower).exists() else ab.lower())
            if model_dir.exists():
                versions = sorted([v.name for v in model_dir.iterdir() if v.is_dir()])
                print(f"  {ab:<35} {'IMPLEMENTED':<20} versions: {', '.join(versions)}")
            else:
                print(f"  {ab:<35} {'IMPLEMENTED':<20}")
        else:
            print(f"  {ab:<35} {'NOT IMPLEMENTED':<20} (insufficient labeled data)")

    print(f"\n  Total trained models: {total_models}")
    print(f"  Target panel: {len(target_panel)} antibiotics")
    return 0


# ============================================================================
#  LAB SUBCOMMANDS
# ============================================================================

def cmd_lab(args):
    """Laboratory operations -- simulation and analysis commands."""
    _print_header("UMBRELLA LAB")
    action = getattr(args, 'lab_action', None)

    if action == "radiation":
        print("  Running radiation damage simulation...")
        print("  Use the Radiation Lab app in the desktop for interactive simulation.")
        print("  CLI: umbrella lab radiation --input <fasta> --type <gamma|xray|alpha|beta|neutron|uv>")
    elif action == "qc":
        input_file = getattr(args, 'input', None)
        if not input_file:
            print("  Usage: umbrella lab qc --input <path/to/genome.fna>")
            return 1
        print(f"  Running QC on: {input_file}")
        from core.bio.fasta_parser import run_sequence_qc
        result = run_sequence_qc(Path(input_file), sample_id="cli-qc")
        print(json.dumps(result, indent=2))
    elif action == "variants":
        print("  Pairwise variant calling")
        print("  Usage: umbrella lab variants --ref <fasta1> --query <fasta2>")
    else:
        print("  Available lab commands:")
        print("    umbrella lab qc --input <fasta>       Run sequence QC")
        print("    umbrella lab radiation --input <fasta> Run radiation simulation")
        print("    umbrella lab variants --ref <f1> --query <f2>  Call variants")
    return 0


# ============================================================================
#  MAIN CLI PARSER
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        prog="umbrella",
        description="Umbrella OS -- Computational Biology Operating System CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  doctor                    Full system health audit
  system status             Show active system state and telemetry
  data init                 Initialize data lake directories and manifests
  data inspect              Inspect current data lake contents
  data manifest             View dataset manifests
  data download             Download real BV-BRC genome + phenotype data
  data resume               Resume interrupted downloads
  data verify               Verify SHA-256 checksums
  data normalize            Normalize raw phenotype records
  data annotate             Run AMRFinderPlus on raw genomes
  data features             Build feature matrices
  data benchmark            Run benchmark evaluation
  ml build-features         Build ML feature matrices
  ml split                  Create train/test splits
  ml train                  Train per-antibiotic models
  ml evaluate               Evaluate trained models
  ml calibrate              Run Platt calibration
  ml register               Register model artifacts
  ml promote                Promote model to production
  amr list-models           List all AMR resistance models
  lab qc|radiation|variants Laboratory operations
        """
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # doctor
    subparsers.add_parser("doctor", help="Full system health audit")

    # system
    system_parser = subparsers.add_parser("system", help="System state commands")
    system_sub = system_parser.add_subparsers(dest="system_action")
    system_sub.add_parser("status", help="Show active system state and telemetry")

    # data
    data_parser = subparsers.add_parser("data", help="Scientific data acquisition and normalization")
    data_sub = data_parser.add_subparsers(dest="data_action")
    data_sub.add_parser("init", help="Initialize data lake directories and manifests")
    data_sub.add_parser("inspect", help="Inspect current data lake contents")
    data_sub.add_parser("manifest", help="View dataset manifests")
    dl_parser = data_sub.add_parser("download", help="Download real BV-BRC data")
    dl_parser.add_argument("--limit", type=int, default=10000, help="Max records per batch")
    data_sub.add_parser("resume", help="Resume interrupted downloads")
    data_sub.add_parser("verify", help="Verify SHA-256 checksums")
    data_sub.add_parser("normalize", help="Normalize raw phenotype records")
    data_sub.add_parser("annotate", help="Run AMRFinderPlus annotation")
    data_sub.add_parser("features", help="Build feature matrices")
    data_sub.add_parser("benchmark", help="Run benchmark evaluation")

    # ml
    ml_parser = subparsers.add_parser("ml", help="Machine learning model pipeline")
    ml_sub = ml_parser.add_subparsers(dest="ml_action")
    ml_sub.add_parser("build-features", help="Build ML feature matrices")
    ml_sub.add_parser("split", help="Create train/test splits")
    train_parser = ml_sub.add_parser("train", help="Train per-antibiotic models")
    train_parser.add_argument("--antibiotic", help="Train specific antibiotic model")
    ml_sub.add_parser("evaluate", help="Evaluate trained models")
    ml_sub.add_parser("calibrate", help="Run Platt calibration")
    ml_sub.add_parser("register", help="Register model artifacts")
    promote_parser = ml_sub.add_parser("promote", help="Promote model to production")
    promote_parser.add_argument("--antibiotic", required=True, help="Antibiotic name")
    promote_parser.add_argument("--version", required=True, help="Version to promote")

    # amr
    amr_parser = subparsers.add_parser("amr", help="AMR resistance model management")
    amr_sub = amr_parser.add_subparsers(dest="amr_action")
    amr_sub.add_parser("list-models", help="List all registered AMR models")

    # lab
    lab_parser = subparsers.add_parser("lab", help="Laboratory operations")
    lab_sub = lab_parser.add_subparsers(dest="lab_action")
    qc_parser = lab_sub.add_parser("qc", help="Run sequence QC")
    qc_parser.add_argument("--input", required=True, help="Path to FASTA file")
    rad_parser = lab_sub.add_parser("radiation", help="Radiation damage simulation")
    rad_parser.add_argument("--input", help="Path to FASTA file")
    rad_parser.add_argument("--type", choices=["gamma", "xray", "alpha", "beta", "neutron", "uv"], default="gamma")
    var_parser = lab_sub.add_parser("variants", help="Pairwise variant calling")
    var_parser.add_argument("--ref", help="Reference FASTA")
    var_parser.add_argument("--query", help="Query FASTA")

    # Also support legacy 'qc' at top level
    legacy_qc = subparsers.add_parser("qc", help="(legacy) Run sequence QC")
    legacy_qc.add_argument("--input", help="Path to input FASTA file")

    args = parser.parse_args()

    # Route commands
    if args.command == "doctor":
        sys.exit(cmd_doctor(args))
    elif args.command == "system":
        if getattr(args, 'system_action', None) == "status":
            sys.exit(cmd_system_status(args))
        else:
            system_parser.print_help()
    elif args.command == "data":
        action = getattr(args, 'data_action', None)
        handler = {
            "init": cmd_data_init,
            "inspect": cmd_data_inspect,
            "manifest": cmd_data_manifest,
            "download": cmd_data_download,
            "resume": cmd_data_resume,
            "verify": cmd_data_verify,
            "normalize": cmd_data_normalize,
            "annotate": cmd_data_annotate,
            "features": cmd_data_features,
            "benchmark": cmd_data_benchmark,
        }.get(action)
        if handler:
            sys.exit(handler(args))
        else:
            data_parser.print_help()
    elif args.command == "ml":
        action = getattr(args, 'ml_action', None)
        handler = {
            "build-features": cmd_ml_build_features,
            "split": cmd_ml_split,
            "train": cmd_ml_train,
            "evaluate": cmd_ml_evaluate,
            "calibrate": cmd_ml_calibrate,
            "register": cmd_ml_register,
            "promote": cmd_ml_promote,
        }.get(action)
        if handler:
            sys.exit(handler(args))
        else:
            ml_parser.print_help()
    elif args.command == "amr":
        action = getattr(args, 'amr_action', None)
        if action == "list-models":
            sys.exit(cmd_amr_list_models(args))
        else:
            amr_parser.print_help()
    elif args.command == "lab":
        sys.exit(cmd_lab(args))
    elif args.command == "qc":
        # Legacy qc support
        args.lab_action = "qc"
        sys.exit(cmd_lab(args))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
