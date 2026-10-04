"""
Umbrella OS — Model Store & Inference Service

Loads versioned model artifacts (model.joblib, calibrator.joblib,
feature_schema.json, metrics.json, manifest.json) from the data lake.

HARD DATA RULES:
- Models only exist if trained on real laboratory-linked phenotype data
- Predictions only served if a real trained model file exists on disk
- ModelNotTrainedError raised (never fabricated output) if no model present
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional

import joblib
import numpy as np

ROOT_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT_DIR / "data" / "models"

_MODEL_CACHE: Dict[str, Any] = {}


class ModelNotTrainedError(Exception):
    """Raised when a requested antibiotic model has not been trained yet."""
    pass


def get_loaded_model(antibiotic: str, version: str = "v1.0.0") -> Dict[str, Any]:
    """
    Loads and caches calibrator + metadata for a specific antibiotic model version.
    Raises ModelNotTrainedError if the model directory or artifacts do not exist.
    """
    key = f"{antibiotic.lower()}_{version}"
    if key in _MODEL_CACHE:
        return _MODEL_CACHE[key]

    target_dir = MODELS_DIR / antibiotic.lower() / version

    if not target_dir.exists():
        raise ModelNotTrainedError(
            f"No trained model for '{antibiotic}' ({version}). "
            f"Expected directory: {target_dir}. "
            f"Train this model first using real laboratory phenotype data."
        )

    required_files = ["calibrator.joblib", "manifest.json", "metrics.json", "schema.json"]
    missing = [f for f in required_files if not (target_dir / f).exists()]
    if missing:
        raise ModelNotTrainedError(
            f"Model for '{antibiotic}' ({version}) is incomplete. "
            f"Missing artifacts: {missing}. Re-train to produce complete artifacts."
        )

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


def get_calibrated_model(antibiotic: str, version: str = "v1.0.0"):
    """Compatibility alias returning (base_model, calibrator, schema)."""
    bundle = get_loaded_model(antibiotic, version)
    return bundle["calibrator"], bundle["calibrator"], bundle["schema"]


def list_registered_models() -> List[Dict[str, Any]]:
    """
    Returns all trained model versions found in the data lake.
    Returns empty list if no models have been trained yet — never fabricates entries.
    """
    models = []
    if not MODELS_DIR.exists():
        return models

    for ab_dir in sorted(MODELS_DIR.iterdir()):
        if not ab_dir.is_dir():
            continue
        for v_dir in sorted(ab_dir.iterdir()):
            if not v_dir.is_dir():
                continue
            manifest_path = v_dir / "manifest.json"
            if manifest_path.exists():
                try:
                    manifest = json.loads(manifest_path.read_text())
                    models.append(manifest)
                except (json.JSONDecodeError, OSError):
                    pass  # Skip corrupt manifests

    return models


def predict_resistance(
    antibiotic: str,
    feature_dict: Dict[str, float],
    version: str = "v1.0.0"
) -> Dict[str, Any]:
    """
    Runs calibrated prediction using a real trained model.
    Raises ModelNotTrainedError if the model does not exist on disk.
    Never invents probability values.
    """
    bundle = get_loaded_model(antibiotic, version)  # raises if not present
    schema: List[str] = bundle["schema"]
    calibrator = bundle["calibrator"]
    metrics: Dict[str, Any] = bundle["metrics"]
    manifest: Dict[str, Any] = bundle["manifest"]

    # Build feature vector in schema column order
    x_vec = np.array([[feature_dict.get(col, 0.0) for col in schema]])

    # Calibrated probability from real trained calibrator
    raw_proba = calibrator.predict_proba(x_vec)
    prob = float(raw_proba[0, 1])
    predicted_class = "Resistant" if prob >= 0.5 else "Susceptible"

    # Confidence band
    if prob >= 0.80 or prob <= 0.20:
        confidence_band = "HIGH"
    elif prob >= 0.65 or prob <= 0.35:
        confidence_band = "MEDIUM"
    else:
        confidence_band = "LOW"

    # Evidence coverage: fraction of expected marker features that are active
    active_markers = [k for k, v in feature_dict.items() if k.startswith("has_") and v > 0]
    n_expected = max(1, len([col for col in schema if col.startswith("has_")]))
    evidence_coverage = round(min(1.0, len(active_markers) / n_expected), 3)

    # OOD detection: GC extreme or very low evidence coverage
    gc = feature_dict.get("gc_fraction", 0.50)
    if gc < 0.30 or gc > 0.75:
        ood_flag = "OUT_OF_DISTRIBUTION"
    elif evidence_coverage < 0.20:
        ood_flag = "LOW_COVERAGE"
    else:
        ood_flag = "IN_DOMAIN"

    # Extract top feature contributions for WHY panel
    top_features = metrics.get("top_features", [])
    active_evidence = []
    for f in top_features:
        fname = f.get("feature", "")
        if feature_dict.get(fname, 0.0) > 0.0:
            active_evidence.append({
                "feature": fname,
                "importance_weight": f.get("weight", 0.0),
                "observed": True,
                "interpretation": f"Detected {fname.replace('has_', '')} -- associated with {antibiotic} resistance."
            })

    return {
        "antibiotic": antibiotic,
        "predicted_class": predicted_class,
        "calibrated_probability": round(prob, 4),
        "confidence_band": confidence_band,
        "evidence_coverage": evidence_coverage,
        "ood_flag": ood_flag,
        "model_id": manifest.get("model_id"),
        "model_version": version,
        "dataset_manifest_id": manifest.get("dataset_manifest_id"),
        "training_rows": manifest.get("training_rows"),
        "metrics_summary": {
            "roc_auc": metrics.get("roc_auc"),
            "pr_auc": metrics.get("pr_auc"),
            "brier_score": metrics.get("brier_score"),
            "sensitivity": metrics.get("sensitivity"),
            "specificity": metrics.get("specificity"),
        },
        "feature_summary": {
            "active_marker_count": len(active_markers),
            "active_markers": active_markers,
            "gc_fraction": gc
        },
        "evidence_refs": active_evidence,
        "feature_contributions": active_evidence,
        "research_use_only": True,
    }


def predict_amr(
    sample_id: str,
    antibiotic: str,
    markers: Optional[List[str]] = None,
    features: Optional[Dict[str, float]] = None,
    version: str = "v1.0.0"
) -> Dict[str, Any]:
    """Wrapper taking a marker list or feature dict. Raises ModelNotTrainedError if no model."""
    feat_dict = dict(features or {})
    if markers:
        for m in markers:
            feat_dict[f"has_{m}"] = 1.0
            feat_dict[m] = 1.0
    res = predict_resistance(antibiotic, feat_dict, version=version)
    res["sample_id"] = sample_id
    return res

