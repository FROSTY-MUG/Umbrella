"""
Umbrella OS - AMR Feature Extraction Engine
Converts normalized AMRFinderPlus annotations, point mutations, and sequence metrics
into sparse/dense feature vectors for per-antibiotic ML models.
"""

from typing import List, Dict, Any, Optional
from pathlib import Path
import pandas as pd
import numpy as np

# Canonical AMR resistance genes and mutations tracked across major bacterial pathogens
# Extended to cover actual variants detected in our BV-BRC benchmark genomes
CANONICAL_AMR_MARKERS = [
    # Beta-lactams / Carbapenems (acquired genes)
    "blaTEM", "blaSHV", "blaCTX-M", "blaOXA", "blaKPC", "blaNDM", "blaVIM", "blaIMP",
    # Beta-lactam PBP mutations (Streptococcus)
    "pbp1a", "pbp2x",
    # Fluoroquinolones — mutations (cover common variants at key residues)
    "gyrA_D87G", "gyrA_D87N", "gyrA_S83L", "gyrA_S83I",
    "parC_S80I",
    # Fluoroquinolones — plasmid-mediated (qnr gene families)
    "qnrA", "qnrA1", "qnrB", "qnrS", "qnrS1",
    # Aminoglycosides (acetyltransferases, adenylyltransferases, phosphotransferases)
    "aac(3)", "aac(3)-IId", "aac(6')", "aadA",
    "aph(3')", "aph(3')-IIa", "aph(6)-Ic",
    "armA", "rmtB",
    # Tetracyclines
    "tet(A)", "tet(B)", "tet(M)", "tet(X)",
    # Macrolides / Lincosamides
    "erm(A)", "erm(B)", "erm(C)", "mph(A)",
    # Sulfonamides & Trimethoprim
    "sul1", "sul2", "dfrA1", "dfrA12", "dfrA14",
    # Colistin (polymyxin)
    "mcr-1", "mcr-2",
    # Rifamycins (rpoB mutations)
    "rpoB_S531L", "rpoB_H526Y",
    # Efflux pumps (cross-resistance markers)
    "pmrA", "emrD",
    # Fosfomycin
    "fosA",
    # Nitrofurantoin
    "nfsB",
]

def extract_amr_features_from_findings(
    findings: List[Dict[str, Any]],
    qc_stats: Optional[Dict[str, Any]] = None
) -> Dict[str, float]:
    """
    Constructs a fixed feature dictionary from a list of AMR findings and sequence QC metrics.
    """
    features: Dict[str, float] = {f"has_{marker}": 0.0 for marker in CANONICAL_AMR_MARKERS}

    for finding in findings:
        gene = finding.get("gene", "") or ""
        mutation = finding.get("mutation", "") or ""

        # Match gene presence
        for marker in CANONICAL_AMR_MARKERS:
            if marker in gene or marker in mutation:
                features[f"has_{marker}"] = 1.0

        # Direct mutation match
        if mutation:
            mut_key = f"has_{mutation}"
            if mut_key in features:
                features[mut_key] = 1.0

    # Covariate QC features
    if qc_stats:
        features["gc_fraction"] = float(qc_stats.get("gc_fraction", 0.50))
        features["contigs_log"] = float(np.log1p(qc_stats.get("contig_count", 1)))
        features["length_mb"] = float(qc_stats.get("total_bases", 5_000_000) / 1_000_000.0)
    else:
        features["gc_fraction"] = 0.50
        features["contigs_log"] = 1.0
        features["length_mb"] = 5.0

    # Summary feature: total resistance marker burden
    features["total_amr_marker_count"] = sum(v for k, v in features.items() if k.startswith("has_"))

    return features

# Alias for backward compatibility
CANONICAL_MARKERS = CANONICAL_AMR_MARKERS

def get_feature_schema() -> List[str]:
    """Returns the ordered list of feature column names."""
    cols = [f"has_{m}" for m in CANONICAL_AMR_MARKERS]
    cols.extend(["gc_fraction", "contigs_log", "length_mb", "total_amr_marker_count"])
    return cols

def build_feature_matrix_from_amr_dir(
    amr_dir: Path,
    output_parquet: Optional[Path] = None
) -> pd.DataFrame:
    """
    Parses all AMRFinderPlus TSV files in amr_dir and builds a standardized
    feature DataFrame, saving to parquet if requested.
    """
    from core.bio.amrfinder import parse_amrfinder_tsv

    amr_files = list(Path(amr_dir).glob("*.tsv"))
    rows = []
    index = []

    for f in amr_files:
        sample_id = f.stem.replace("_amrfinder", "").replace("_amr", "")
        findings = parse_amrfinder_tsv(f, sample_id=sample_id)
        feat_dict = extract_amr_features_from_findings(findings)
        rows.append(feat_dict)
        index.append(sample_id)

    if not rows:
        schema = get_feature_schema()
        df = pd.DataFrame(columns=schema)
    else:
        df = pd.DataFrame(rows, index=index)

    if output_parquet:
        out_p = Path(output_parquet)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        try:
            df.to_parquet(out_p)
        except Exception:
            csv_path = out_p.with_suffix(".csv")
            df.to_csv(csv_path)

    return df

