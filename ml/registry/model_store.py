"""
Umbrella OS - Model Store & Inference Service
Loads versioned model artifacts, performs calibrated inference, extracts feature importance,
computes evidence coverage and OOD signals, and formats the scientific evidence dossier.
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import joblib
import numpy as np

from ml.features.extractor import get_feature_schema

ROOT_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT_DIR / "data" / "models"

_MODEL_CACHE: Dict[str, Any] = {}

def get_loaded_model(antibiotic: str, version: str = "v1.0.0") -> Dict[str, Any]:
    """Loads and caches calibrator and metadata for an antibiotic."""
    key = f"{antibiotic.lower()}_{version}"
    if key in _MODEL_CACHE:
        return _MODEL_CACHE[key]

    target_dir = MODELS_DIR / antibiotic.lower() / version
    if not target_dir.exists():
        raise FileNotFoundError(f"Model for {antibiotic} ({version}) not found at {target_dir}")

    calibrator = joblib.load(target_dir / "calibrator.joblib")
    manifest = json.loads((target_dir / "manifest.json").read_text())
    metrics = json.loads((target_dir / "metrics.json").read_text())
    schema = json.loads((target_dir / "schema.json").read_text())

    bundle = {
        "calibrator": calibrator,
        "manifest": manifest,
        "metrics": metrics,
        "schema": schema,
        "target_dir": target_dir
    }
    _MODEL_CACHE[key] = bundle
    return bundle

def list_registered_models() -> List[Dict[str, Any]]:
    """Returns a list of all registered models across the data lake."""
    models = []
    if not MODELS_DIR.exists():
        return models

    for ab_dir in MODELS_DIR.iterdir():
        if ab_dir.is_dir():
            for v_dir in ab_dir.iterdir():
                if v_dir.is_dir() and (v_dir / "manifest.json").exists():
                    manifest = json.loads((v_dir / "manifest.json").read_text())
                    models.append(manifest)
    return models

def predict_resistance(
    antibiotic: str,
    feature_dict: Dict[str, float],
    version: str = "v1.0.0"
) -> Dict[str, Any]:
    """
    Executes calibrated prediction with transparent confidence and evidence dossier.
    """
    bundle = get_loaded_model(antibiotic, version)
    schema = bundle["schema"]
    calibrator = bundle["calibrator"]
    metrics = bundle["metrics"]

    # Construct input vector in exact schema order
    x_vec = np.array([[feature_dict.get(col, 0.0) for col in schema]])

    # Inference & Platt Calibration
    prob = float(calibrator.predict_proba(x_vec)[0, 1])
    predicted_class = "Resistant" if prob >= 0.5 else "Susceptible"

    # Confidence Band calculation
    if prob >= 0.80 or prob <= 0.20:
        confidence_band = "HIGH"
    elif prob >= 0.65 or prob <= 0.35:
        confidence_band = "MEDIUM"
    else:
        confidence_band = "LOW"

    # Evidence coverage: proportion of expected core marker inputs detected/present
    active_markers = [k for k, v in feature_dict.items() if k.startswith("has_") and v > 0]
    evidence_coverage = min(1.0, round(len(active_markers) / 3.0, 2)) if active_markers else 0.50

    # OOD check: GC extreme check or uncharacteristic total marker count
    gc = feature_dict.get("gc_fraction", 0.50)
    if gc < 0.30 or gc > 0.70:
        ood_flag = "OUT_OF_DISTRIBUTION"
    elif evidence_coverage < 0.3:
        ood_flag = "LOW_COVERAGE"
    else:
        ood_flag = "IN_DOMAIN"

    # Extract feature contributions for WHY? panel
    top_features = metrics.get("top_features", [])
    active_evidence = []
    for f in top_features:
        name = f["feature"]
        if feature_dict.get(name, 0.0) > 0.0:
            active_evidence.append({
                "feature": name,
                "importance_weight": f["weight"],
                "observed": True,
                "interpretation": f"Presence of {name.replace('has_', '')} significantly increases resistance odds."
            })

    return {
        "antibiotic": antibiotic,
        "predicted_class": predicted_class,
        "calibrated_probability": round(prob, 4),
        "confidence_band": confidence_band,
        "evidence_coverage": evidence_coverage,
        "ood_flag": ood_flag,
        "model_id": bundle["manifest"]["model_id"],
        "model_version": version,
        "metrics_summary": {
            "roc_auc": metrics.get("roc_auc"),
            "pr_auc": metrics.get("pr_auc"),
            "brier_score": metrics.get("brier_score")
        },
        "feature_summary": {
            "active_marker_count": len(active_markers),
            "active_markers": active_markers,
            "gc_fraction": gc
        },
        "evidence_refs": active_evidence,
        "research_use_only": True
    }
