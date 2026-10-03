"""
Umbrella OS - AMR Feature Extraction Engine
Converts normalized AMRFinderPlus annotations, point mutations, and sequence metrics
into sparse/dense feature vectors for per-antibiotic ML models.
"""

from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

# Canonical AMR resistance genes and mutations tracked across major bacterial pathogens
CANONICAL_AMR_MARKERS = [
    # Beta-lactams / Carbapenems
    "blaTEM", "blaSHV", "blaCTX-M", "blaOXA", "blaKPC", "blaNDM", "blaVIM", "blaIMP",
    # Fluoroquinolones (mutations & genes)
    "gyrA_D87G", "gyrA_S83L", "parC_S80I", "qnrA", "qnrB", "qnrS",
    # Aminoglycosides
    "aac(3)", "aac(6')", "aadA", "aph(3')", "armA", "rmtB",
    # Tetracyclines
    "tet(A)", "tet(B)", "tet(M)", "tet(X)",
    # Macrolides
    "erm(A)", "erm(B)", "erm(C)", "mph(A)",
    # Sulfonamides & Trimethoprim
    "sul1", "sul2", "dfrA1", "dfrA12",
    # Colistin
    "mcr-1", "mcr-2",
    # Rifamycins
    "rpoB_S531L", "rpoB_H526Y"
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

def get_feature_schema() -> List[str]:
    """Returns the ordered list of feature column names."""
    cols = [f"has_{m}" for m in CANONICAL_AMR_MARKERS]
    cols.extend(["gc_fraction", "contigs_log", "length_mb", "total_amr_marker_count"])
    return cols
