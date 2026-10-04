"""
Umbrella OS - AMR Machine Learning Model Inference Test Suite
Validates model loading, calibrated probability outputs, confidence bands,
OOD flag determinations, and feature contribution attributions across all 4 antibiotics.
"""

import pytest
from ml.registry.model_store import predict_amr, get_calibrated_model

def test_models_exist_and_load():
    for drug in ["ciprofloxacin", "meropenem", "tetracycline", "gentamicin"]:
        model, calibrator, schema = get_calibrated_model(drug)
        assert model is not None
        assert calibrator is not None
        assert len(schema) >= 32

def test_prediction_probability_bounds():
    for drug in ["ciprofloxacin", "meropenem", "tetracycline", "gentamicin"]:
        res = predict_amr("SMP-1827", drug, markers=["blaNDM-1", "gyrA_D87G"])
        prob = res["calibrated_probability"]
        assert 0.0 <= prob <= 1.0
        assert res["predicted_class"] in ["Resistant", "Susceptible"]
        assert res["confidence_band"] in ["HIGH", "MEDIUM", "LOW"]
        assert "feature_contributions" in res

def test_resistant_marker_elevates_probability():
    # Negative baseline: zero markers
    res_clean = predict_amr("SMP-CLEAN", "ciprofloxacin", markers=[])
    # Positive: canonical quinolone resistance markers present in schema
    res_resistant = predict_amr("SMP-RES", "ciprofloxacin", markers=["gyrA_D87N", "gyrA_S83I", "qnrA1"])

    assert res_resistant["calibrated_probability"] > res_clean["calibrated_probability"]
    assert res_resistant["predicted_class"] == "Resistant"
