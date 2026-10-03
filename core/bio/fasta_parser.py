"""
Umbrella OS - Core Bioinformatics Sequence & QC Engine
Deterministic streaming sequence parsing, GC calculation, ambiguous base tracking,
and quality score metrics.
"""

import hashlib
from typing import Generator, Dict, Any, List, Optional
from dataclasses import dataclass
from pathlib import Path

@dataclass
class ContigRecord:
    name: str
    description: str
    length: int
    gc_percent: float
    n_count: int
    sequence_preview: str

@dataclass
class QCResult:
    sample_id: str
    sha256: str
    total_bases: int
    contig_count: int
    gc_fraction: float
    n_fraction: float
    ambiguous_bases: int
    n50: int
    status: str  # PASS, WARN, FAIL
    flags: List[str]
    transform: str

def compute_sha256(filepath: str | Path, chunk_size: int = 8 * 1024 * 1024) -> str:
    """Computes SHA-256 hash of a file efficiently using chunked streaming."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(chunk_size):
            hasher.update(chunk)
    return hasher.hexdigest()

def stream_fasta(filepath: str | Path) -> Generator[Dict[str, Any], None, None]:
    """
    Generator yielding individual FASTA contigs from a file without
    loading the entire file into memory.
    """
    current_header = None
    current_desc = ""
    seq_lines = []

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if line.startswith(">"):
                if current_header is not None:
                    full_seq = "".join(seq_lines).upper()
                    yield {
                        "name": current_header,
                        "description": current_desc,
                        "sequence": full_seq,
                        "length": len(full_seq)
                    }
                    seq_lines = []
                parts = line[1:].split(None, 1)
                current_header = parts[0]
                current_desc = parts[1] if len(parts) > 1 else ""
            else:
                seq_lines.append(line)

        if current_header is not None:
            full_seq = "".join(seq_lines).upper()
            yield {
                "name": current_header,
                "description": current_desc,
                "sequence": full_seq,
                "length": len(full_seq)
            }

def calculate_n50(lengths: List[int]) -> int:
    """Calculates the N50 metric for contig lengths."""
    if not lengths:
        return 0
    sorted_lengths = sorted(lengths, reverse=True)
    half_total = sum(sorted_lengths) / 2.0
    running_sum = 0
    for l in sorted_lengths:
        running_sum += l
        if running_sum >= half_total:
            return l
    return sorted_lengths[-1]

def run_sequence_qc(filepath: str | Path, sample_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes deterministic quality control on a FASTA file.
    Follows Umbrella QC specification:
    - Normalizes uppercase
    - Counts ACGT and non-ACGT / N bases
    - Calculates GC fraction
    - Calculates N50 and contig counts
    - Assigns status: PASS, WARN, or FAIL
    """
    filepath = Path(filepath)
    if not filepath.exists():
        raise FileNotFoundError(f"FASTA file not found: {filepath}")

    file_hash = compute_sha256(filepath)
    assigned_sample_id = sample_id or f"SMP-{file_hash[:8].upper()}"

    total_bases = 0
    gc_count = 0
    atgc_count = 0
    n_count = 0
    contig_lengths = []
    contig_records = []
    flags = []

    for contig in stream_fasta(filepath):
        seq = contig["sequence"]
        length = len(seq)
        contig_lengths.append(length)
        total_bases += length

        g = seq.count("G")
        c = seq.count("C")
        a = seq.count("A")
        t = seq.count("T")
        n = seq.count("N")

        gc_count += (g + c)
        atgc_count += (g + c + a + t)
        n_count += (length - (g + c + a + t))  # all non-canonical symbols

        contig_records.append({
            "name": contig["name"],
            "length": length,
            "gc_percent": round((g + c) / length * 100, 2) if length > 0 else 0.0,
            "n_count": n,
            "preview": seq[:60] + ("..." if length > 60 else "")
        })

    gc_fraction = (gc_count / atgc_count) if atgc_count > 0 else 0.0
    n_fraction = (n_count / total_bases) if total_bases > 0 else 0.0
    n50 = calculate_n50(contig_lengths)
    contig_count = len(contig_lengths)

    # QC Thresholds (as specified in Master Specification)
    if total_bases < 500_000:
        flags.append("UNUSUALLY_SHORT_GENOME")
    elif total_bases > 15_000_000:
        flags.append("UNUSUALLY_LARGE_GENOME")

    if n_fraction > 0.05:
        flags.append("HIGH_AMBIGUOUS_N_CONTENT")
    elif n_fraction > 0.01:
        flags.append("MODERATE_AMBIGUOUS_N_CONTENT")

    if contig_count > 500:
        flags.append("HIGH_FRAGMENTATION")

    if gc_fraction < 0.25 or gc_fraction > 0.75:
        flags.append("ABNORMAL_GC_CONTENT")

    # Overall Status determination
    if any(f in flags for f in ["UNUSUALLY_SHORT_GENOME", "HIGH_AMBIGUOUS_N_CONTENT"]):
        status = "FAIL"
    elif flags:
        status = "WARN"
    else:
        status = "PASS"

    return {
        "sample_id": assigned_sample_id,
        "sha256": file_hash,
        "filepath": str(filepath.resolve()),
        "total_bases": total_bases,
        "contig_count": contig_count,
        "gc_fraction": round(gc_fraction, 4),
        "gc_percent": round(gc_fraction * 100, 2),
        "n_fraction": round(n_fraction, 6),
        "ambiguous_bases": n_count,
        "n50": n50,
        "status": status,
        "flags": flags,
        "transform": "uppercase + whitespace removal + non-ACGT mapped to ambiguous",
        "contigs_preview": contig_records[:10]
    }
