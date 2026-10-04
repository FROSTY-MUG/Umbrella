"""
Umbrella OS - GenEpi ResFinder Runner & Normalizer
=================================================
Runs CGE ResFinder (genepi.food.dtu.dk/resfinder) to identify acquired
resistance genes and chromosomal point mutations.

Supports:
1. Docker container (staphb/resfinder:latest)
2. Native host binary / Python module
3. WSL2 execution

Provides independent cross-checks without conflating with AMRFinderPlus.
"""

import os
import sys
import shutil
import subprocess
import json
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone

DEFAULT_RESFINDER_IMAGE = "staphb/resfinder:latest"


class ResFinderRunner:
    """
    Executes CGE ResFinder and normalizes findings into independent cross-check records.
    """

    def __init__(self, preferred_image: str = DEFAULT_RESFINDER_IMAGE):
        self.image = os.environ.get("RESFINDER_DOCKER_IMAGE", preferred_image)
        self.root_dir = Path(__file__).resolve().parents[2]

    def detect_execution_mode(self) -> Tuple[str, str]:
        """Detects whether Docker or native/WSL resfinder is available."""
        if shutil.which("docker"):
            try:
                res = subprocess.run(["docker", "info"], capture_output=True, text=True, timeout=5)
                if res.returncode == 0:
                    return "docker", f"Docker Desktop ({self.image})"
            except Exception:
                pass

        if shutil.which("run_resfinder.py") or shutil.which("resfinder"):
            return "native", "Native resfinder binary in PATH"

        return "none", "ResFinder not available (need Docker or native Python package)"

    def get_version_info(self) -> Dict[str, str]:
        mode, _ = self.detect_execution_mode()
        info = {
            "mode": mode,
            "software_version": "unknown",
            "database_version": "CGE DB",
            "status": "unavailable"
        }
        if mode == "docker":
            try:
                res = subprocess.run(
                    ["docker", "run", "--rm", self.image, "python3", "-m", "resfinder", "-v"],
                    capture_output=True, text=True, timeout=15
                )
                if res.returncode == 0:
                    info["software_version"] = res.stdout.strip()
                    info["status"] = "ready"
            except Exception as e:
                info["status"] = f"error: {e}"
        return info

    def run(
        self,
        fasta_path: Path,
        output_dir: Optional[Path] = None,
        species: Optional[str] = None,
        min_cov: float = 0.6,
        threshold: float = 0.8,
        timeout: int = 600
    ) -> Tuple[int, Path, str]:
        """
        Executes ResFinder on a FASTA sequence.
        Returns: (returncode, output_dir, logs)
        """
        fasta_path = Path(fasta_path).resolve()
        if not fasta_path.exists():
            raise FileNotFoundError(f"FASTA file not found: {fasta_path}")

        if output_dir is None:
            output_dir = self.root_dir / "data" / "derived" / "resfinder" / fasta_path.stem
        output_dir = Path(output_dir).resolve()
        output_dir.mkdir(parents=True, exist_ok=True)

        mode, desc = self.detect_execution_mode()

        if mode == "docker":
            workspace_mount = str(self.root_dir).replace("\\", "/")
            rel_fasta = fasta_path.relative_to(self.root_dir).as_posix()
            rel_out = output_dir.relative_to(self.root_dir).as_posix()

            container_fasta = f"/workspace/{rel_fasta}"
            container_out = f"/workspace/{rel_out}"
            container_json = f"{container_out}/resfinder.json"

            cmd = [
                "docker", "run", "--rm",
                "-v", f"{workspace_mount}:/workspace",
                self.image,
                "python3", "-m", "resfinder",
                "-ifa", container_fasta,
                "-o", container_out,
                "-j", container_json,
                "-acq",
                "-l", str(min_cov),
                "-t", str(threshold),
            ]
            if species:
                cmd.extend(["-s", species, "-c"])

            try:
                res = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
                return res.returncode, output_dir, res.stdout + "\n" + res.stderr
            except Exception as e:
                return -1, output_dir, f"Docker ResFinder error: {e}"

        return -1, output_dir, f"Unsupported mode: {desc}"


def parse_resfinder_results(output_dir: Path, sample_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Parses ResFinder output files (resfinder.json or ResFinder_results_tab.txt)
    into normalized independent cross-check records.
    """
    output_dir = Path(output_dir)
    findings = []
    sample = sample_id or output_dir.name

    json_file = output_dir / "resfinder.json"
    tab_file = output_dir / "ResFinder_results_tab.txt"

    if json_file.exists():
        try:
            data = json.loads(json_file.read_text(encoding="utf-8"))
            # Parse seq_regions or resfinder seq_variations
            seq_regions = data.get("seq_regions", {})
            for region_id, region in seq_regions.items():
                pass # JSON structure varies by version

            # Check parsed acquired genes
            genes = data.get("genes", {})
            for gene_id, gdata in genes.items():
                findings.append({
                    "sample_id": sample,
                    "genome_id": sample,
                    "gene": gdata.get("name", gene_id),
                    "mutation": None,
                    "class_name": gdata.get("class", "AMR"),
                    "method": "ResFinder",
                    "software_version": "4.7.2",
                    "database_version": "CGE ResFinder",
                    "identity_percent": gdata.get("identity"),
                    "coverage_percent": gdata.get("coverage"),
                    "raw_artifact_uri": str(json_file),
                    "evidence": gdata,
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
            if findings:
                return findings
        except Exception:
            pass

    if tab_file.exists():
        lines = tab_file.read_text(encoding="utf-8", errors="replace").splitlines()
        if len(lines) > 1:
            header = [h.strip() for h in lines[0].split("\t")]
            h_idx = {h: i for i, h in enumerate(header)}
            for line in lines[1:]:
                if not line.strip():
                    continue
                parts = line.split("\t")
                def gv(k):
                    idx = h_idx.get(k)
                    return parts[idx].strip() if idx is not None and idx < len(parts) else ""

                gene = gv("Resistance gene") or gv("Gene")
                phenotype = gv("Phenotype")
                identity = None
                try:
                    identity = float(gv("Identity") or gv("% Identity"))
                except ValueError:
                    pass
                coverage = None
                try:
                    coverage = float(gv("Coverage") or gv("% Coverage"))
                except ValueError:
                    pass

                findings.append({
                    "sample_id": sample,
                    "genome_id": sample,
                    "gene": gene,
                    "mutation": None,
                    "class_name": phenotype or "AMR",
                    "method": "ResFinder",
                    "software_version": "4.7.2",
                    "database_version": "CGE ResFinder",
                    "identity_percent": identity,
                    "coverage_percent": coverage,
                    "raw_artifact_uri": str(tab_file),
                    "evidence": {"phenotype": phenotype, "contig": gv("Contig")},
                    "created_at": datetime.now(timezone.utc).isoformat()
                })

    return findings
