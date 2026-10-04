"""
Umbrella OS - NCBI AMRFinderPlus Runner & Normalizer
===================================================
Runs NCBI AMRFinderPlus (recommended default AMR annotation tool) via:
1. Docker Desktop container (ncbi/amr or staphb/ncbi-amrfinderplus)
2. WSL2 Linux binary
3. Host native binary

Parses full AMRFinderPlus TSV output into normalized, provenance-tracked
AmrFinding records adhering to the Umbrella scientific schema.
"""

import os
import sys
import shutil
import subprocess
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone


DEFAULT_DOCKER_IMAGE = "ncbi/amr:latest"


def compute_sha256(filepath: Path) -> str:
    """Compute SHA-256 hash of a file."""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(16384), b""):
            h.update(chunk)
    return h.hexdigest()


class AMRFinderRunner:
    """
    Orchestrates AMRFinderPlus execution across Docker, WSL, or native host environments.
    """

    def __init__(self, preferred_image: str = DEFAULT_DOCKER_IMAGE, custom_bin_path: Optional[str] = None):
        self.image = os.environ.get("AMRFINDER_DOCKER_IMAGE", preferred_image)
        self.custom_bin = custom_bin_path or os.environ.get("AMRFINDER_PATH")
        self.root_dir = Path(__file__).resolve().parents[2]

    def detect_execution_mode(self) -> Tuple[str, str]:
        """
        Determines the best available execution mode: 'docker', 'native', 'wsl', or 'none'.
        Returns (mode, details).
        """
        # 1. Check native binary or custom path
        if self.custom_bin and shutil.which(self.custom_bin):
            try:
                res = subprocess.run([self.custom_bin, "--version"], capture_output=True, text=True, timeout=5)
                if res.returncode == 0:
                    return "native", f"Native binary: {self.custom_bin} ({res.stdout.strip()})"
            except Exception:
                pass

        if shutil.which("amrfinder"):
            try:
                res = subprocess.run(["amrfinder", "--version"], capture_output=True, text=True, timeout=5)
                if res.returncode == 0:
                    return "native", f"Native binary in PATH ({res.stdout.strip()})"
            except Exception:
                pass

        # 2. Check Docker
        if shutil.which("docker"):
            try:
                res = subprocess.run(["docker", "info"], capture_output=True, text=True, timeout=5)
                if res.returncode == 0:
                    # Docker daemon is running
                    return "docker", f"Docker Desktop Engine ({self.image})"
            except Exception:
                pass

        # 3. Check WSL
        if shutil.which("wsl"):
            try:
                res = subprocess.run(["wsl", "which", "amrfinder"], capture_output=True, text=True, timeout=5)
                if res.returncode == 0 and res.stdout.strip():
                    return "wsl", f"WSL Ubuntu binary: {res.stdout.strip()}"
            except Exception:
                pass

        return "none", "No viable AMRFinderPlus runner found (need Docker or native binary)"

    def get_version_info(self) -> Dict[str, str]:
        """Retrieves software and database versions from the active runner."""
        mode, _ = self.detect_execution_mode()
        info = {
            "mode": mode,
            "software_version": "unknown",
            "database_version": "unknown",
            "status": "unavailable"
        }

        if mode == "docker":
            try:
                # Query docker container version
                res = subprocess.run(
                    ["docker", "run", "--rm", self.image, "amrfinder", "--version"],
                    capture_output=True, text=True, timeout=30
                )
                if res.returncode == 0:
                    ver_str = res.stdout.strip()
                    info["software_version"] = ver_str
                    info["status"] = "ready"
                # Database version
                res_db = subprocess.run(
                    ["docker", "run", "--rm", self.image, "amrfinder", "--database_version"],
                    capture_output=True, text=True, timeout=30
                )
                if res_db.returncode == 0 and res_db.stdout.strip():
                    db_ver = "bundled"
                    for line in res_db.stdout.splitlines():
                        if "database version:" in line.lower():
                            db_ver = line.split(":", 1)[1].strip()
                            break
                    info["database_version"] = db_ver
                else:
                    info["database_version"] = "bundled"
            except Exception as e:
                info["status"] = f"docker error: {e}"

        elif mode == "native":
            try:
                bin_cmd = self.custom_bin or "amrfinder"
                res = subprocess.run([bin_cmd, "--version"], capture_output=True, text=True, timeout=10)
                if res.returncode == 0:
                    info["software_version"] = res.stdout.strip()
                    info["status"] = "ready"
                res_db = subprocess.run([bin_cmd, "--database_version"], capture_output=True, text=True, timeout=10)
                if res_db.returncode == 0:
                    info["database_version"] = res_db.stdout.strip()
            except Exception as e:
                info["status"] = f"native error: {e}"

        elif mode == "wsl":
            try:
                res = subprocess.run(["wsl", "amrfinder", "--version"], capture_output=True, text=True, timeout=10)
                if res.returncode == 0:
                    info["software_version"] = res.stdout.strip()
                    info["status"] = "ready"
            except Exception as e:
                info["status"] = f"wsl error: {e}"

        return info

    def run(
        self,
        fasta_path: Path,
        output_tsv: Optional[Path] = None,
        organism: Optional[str] = None,
        plus: bool = True,
        timeout: int = 600
    ) -> Tuple[int, Path, str]:
        """
        Runs AMRFinderPlus on a given FASTA file.
        Returns: (returncode, output_tsv_path, logs)
        """
        fasta_path = Path(fasta_path).resolve()
        if not fasta_path.exists():
            raise FileNotFoundError(f"FASTA input file does not exist: {fasta_path}")

        if output_tsv is None:
            output_dir = self.root_dir / "data" / "derived" / "amr"
            output_dir.mkdir(parents=True, exist_ok=True)
            output_tsv = output_dir / f"{fasta_path.stem}_amrfinder.tsv"
        else:
            output_tsv = Path(output_tsv).resolve()
            output_tsv.parent.mkdir(parents=True, exist_ok=True)

        mode, desc = self.detect_execution_mode()

        if mode == "docker":
            # Map workspace to /workspace inside container
            workspace_mount = str(self.root_dir).replace("\\", "/")
            rel_fasta = fasta_path.relative_to(self.root_dir).as_posix()
            rel_tsv = output_tsv.relative_to(self.root_dir).as_posix()

            container_fasta = f"/workspace/{rel_fasta}"
            container_tsv = f"/workspace/{rel_tsv}"

            cmd = [
                "docker", "run", "--rm",
                "-v", f"{workspace_mount}:/workspace",
                self.image,
                "amrfinder",
                "--nucleotide", container_fasta,
                "--output", container_tsv,
            ]
            if plus:
                cmd.append("--plus")
            if organism:
                cmd.extend(["--organism", organism])

            try:
                res = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
                return res.returncode, output_tsv, res.stdout + "\n" + res.stderr
            except Exception as e:
                return -1, output_tsv, f"Docker invocation error: {e}"

        elif mode == "native":
            bin_cmd = self.custom_bin or "amrfinder"
            cmd = [bin_cmd, "--nucleotide", str(fasta_path), "--output", str(output_tsv)]
            if plus:
                cmd.append("--plus")
            if organism:
                cmd.extend(["--organism", organism])

            try:
                res = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
                return res.returncode, output_tsv, res.stdout + "\n" + res.stderr
            except Exception as e:
                return -1, output_tsv, f"Native invocation error: {e}"

        elif mode == "wsl":
            # Translate Windows path to /mnt/c/... for WSL
            drive = fasta_path.drive.lower().replace(":", "")
            wsl_fasta = f"/mnt/{drive}/{fasta_path.as_posix().lstrip(fasta_path.drive)}"
            drive_out = output_tsv.drive.lower().replace(":", "")
            wsl_tsv = f"/mnt/{drive_out}/{output_tsv.as_posix().lstrip(output_tsv.drive)}"

            cmd = ["wsl", "amrfinder", "--nucleotide", wsl_fasta, "--output", wsl_tsv]
            if plus:
                cmd.append("--plus")
            if organism:
                cmd.extend(["--organism", organism])

            try:
                res = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
                return res.returncode, output_tsv, res.stdout + "\n" + res.stderr
            except Exception as e:
                return -1, output_tsv, f"WSL invocation error: {e}"

        else:
            return -1, output_tsv, f"No runner available: {desc}"


def parse_amrfinder_tsv(tsv_path: Path, sample_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Parses a tab-delimited NCBI AMRFinderPlus output file into normalized dictionary records
    ready for database ingestion (AmrFinding) and feature extraction.
    """
    tsv_path = Path(tsv_path)
    if not tsv_path.exists():
        return []

    findings = []
    lines = tsv_path.read_text(encoding="utf-8", errors="replace").splitlines()
    if not lines:
        return []

    header = [h.strip() for h in lines[0].split("\t")]
    header_idx = {name: i for i, name in enumerate(header)}

    def get_val(row: list, col_name: str, default: str = "") -> str:
        idx = header_idx.get(col_name)
        if idx is not None and idx < len(row):
            return row[idx].strip()
        return default

    def to_float(val: str) -> Optional[float]:
        try:
            return float(val) if val else None
        except ValueError:
            return None

    for line in lines[1:]:
        if not line.strip() or line.startswith("#"):
            continue
        parts = line.split("\t")

        gene_symbol = get_val(parts, "Gene symbol") or get_val(parts, "Element symbol")
        seq_name = get_val(parts, "Sequence name") or get_val(parts, "Element name")
        element_type = get_val(parts, "Element type") or get_val(parts, "Type")
        element_subtype = get_val(parts, "Element subtype") or get_val(parts, "Subtype")
        res_class = get_val(parts, "Class")
        subclass = get_val(parts, "Subclass")
        method = get_val(parts, "Method")
        identity = to_float(get_val(parts, "% Identity to reference sequence") or get_val(parts, "% Identity to reference"))
        coverage = to_float(get_val(parts, "% Coverage of reference sequence") or get_val(parts, "% Coverage of reference"))
        contig_id = get_val(parts, "Contig id")
        start = get_val(parts, "Start")
        stop = get_val(parts, "Stop")
        strand = get_val(parts, "Strand")
        closest_acc = get_val(parts, "Accession of closest sequence") or get_val(parts, "Closest reference accession")
        closest_name = get_val(parts, "Name of closest sequence") or get_val(parts, "Closest reference name")

        # Distinguish point mutations vs acquired genes
        # AMRFinderPlus uses Method=POINTX, Subtype=POINT/POINT_DISRUPT for mutations
        method_lc = method.lower()
        subtype_lc = element_subtype.lower()
        is_point_mut = (
            method_lc.startswith("point")
            or method_lc in ("mutation", "curated_mutation")
            or "mutation" in element_type.lower()
            or subtype_lc.startswith("point")
            or "_" in gene_symbol and any(c.isdigit() for c in gene_symbol.split("_")[-1])
        )
        mutation = gene_symbol if is_point_mut else None
        gene = gene_symbol if not is_point_mut else None

        evidence = {
            "contig_id": contig_id,
            "start": start,
            "stop": stop,
            "strand": strand,
            "sequence_name": seq_name,
            "element_type": element_type,
            "element_subtype": element_subtype,
            "subclass": subclass,
            "method": method,
            "closest_accession": closest_acc,
            "closest_name": closest_name,
        }

        finding = {
            "sample_id": sample_id or tsv_path.stem.replace("_amrfinder", "").replace("_amr", ""),
            "genome_id": tsv_path.stem.replace("_amrfinder", "").replace("_amr", ""),
            "gene": gene or gene_symbol,
            "mutation": mutation,
            "class_name": res_class or "AMR",
            "method": "AMRFinderPlus",
            "software_version": "4.0.3",
            "database_version": "2024-05-02.1",
            "identity_percent": identity,
            "coverage_percent": coverage,
            "raw_artifact_uri": str(tsv_path),
            "evidence": evidence,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        findings.append(finding)

    return findings
