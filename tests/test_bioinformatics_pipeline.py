"""
Umbrella OS - Bioinformatics Pipeline & Multi-Engine Test Suite
==============================================================
Validates:
1. AMRFinderPlus Docker/native runner & TSV parser
2. ResFinder Docker/native runner & cross-check engine
3. cAMRah ensemble harmonization workflow (6 tools)
4. AMR feature extractor & schema consistency
"""

import pytest
from pathlib import Path
from core.bio.amrfinder import AMRFinderRunner, parse_amrfinder_tsv
from core.bio.resfinder import ResFinderRunner
from core.bio.camrah import CamrahHarmonizer, canonicalize_gene_symbol, SUPPORTED_CAMRAH_TOOLS
from ml.features.extractor import (
    extract_amr_features_from_findings,
    get_feature_schema,
    CANONICAL_AMR_MARKERS,
    CANONICAL_MARKERS
)


def test_amrfinder_runner_detection():
    runner = AMRFinderRunner()
    mode, desc = runner.detect_execution_mode()
    assert mode in ["docker", "native", "wsl"]
    assert "not found" not in desc.lower() or mode != "none"


def test_amrfinder_version_query():
    runner = AMRFinderRunner()
    ver = runner.get_version_info()
    assert ver["status"] == "ready"
    assert "4." in ver["software_version"]
    assert ver["database_version"] != "unknown"


def test_resfinder_runner_detection():
    runner = ResFinderRunner()
    mode, desc = runner.detect_execution_mode()
    assert mode in ["docker", "native"]


def test_resfinder_version_query():
    runner = ResFinderRunner()
    ver = runner.get_version_info()
    assert ver["status"] == "ready"
    assert "4." in ver["software_version"]


def test_canonicalize_gene_symbol():
    assert canonicalize_gene_symbol("bla_TEM-1") == "blaTEM-1"
    assert canonicalize_gene_symbol("tetA") == "tet(A)"
    assert canonicalize_gene_symbol("ermB") == "erm(B)"
    assert canonicalize_gene_symbol("gyrA D87N") == "gyrA_D87N"
    assert canonicalize_gene_symbol("gyrA:S83L") == "gyrA_S83L"


def test_camrah_harmonizer_consensus():
    harmonizer = CamrahHarmonizer(sample_id="TEST-ISO-01")

    # Add AMRFinderPlus findings
    harmonizer.add_tool_findings("AMRFinderPlus", [
        {"gene": "blaTEM-1", "class_name": "BETA-LACTAM", "identity_percent": 100.0, "coverage_percent": 100.0},
        {"mutation": "gyrA_D87G", "class_name": "QUINOLONE", "identity_percent": 99.8, "coverage_percent": 100.0}
    ])

    # Add ResFinder findings
    harmonizer.add_tool_findings("ResFinder", [
        {"gene": "bla_TEM-1", "class_name": "BETA-LACTAM", "identity_percent": 100.0, "coverage_percent": 100.0},
        {"mutation": "gyrA D87G", "class_name": "QUINOLONE", "identity_percent": 99.8, "coverage_percent": 100.0}
    ])

    # Add CARD/RGI findings
    harmonizer.add_tool_findings("RGI_CARD", [
        {"gene": "blaTEM-1", "class_name": "BETA-LACTAM", "identity_percent": 100.0, "coverage_percent": 100.0}
    ])

    result = harmonizer.harmonize()
    assert result["sample_id"] == "TEST-ISO-01"
    assert result["active_tools_count"] == 3
    assert result["total_detected_markers"] == 2

    # Check blaTEM-1
    tem_item = next(item for item in result["harmonized_findings"] if item["canonical_gene"] == "blaTEM-1")
    assert tem_item["concordance_count"] == "3/3"
    assert tem_item["is_unanimous"] is True
    assert tem_item["is_organizer_default_verified"] is True
    assert tem_item["is_resfinder_crosschecked"] is True

    # Check gyrA_D87G (2 of 3 tools detected)
    gyra_item = next(item for item in result["harmonized_findings"] if item["canonical_gene"] == "gyrA_D87G")
    assert gyra_item["concordance_count"] == "2/3"
    assert gyra_item["is_unanimous"] is False

    # Check methodology disclaimer
    assert "never treated as laboratory truth" in result["methodology_disclaimer"]


def test_parse_real_amrfinder_tsv():
    tsv_path = Path("data/derived/amr/573.14535_amr.tsv")
    if not tsv_path.exists():
        tsv_path = Path("data/derived/amr/573.14535_amrfinder.tsv")

    findings = parse_amrfinder_tsv(tsv_path)
    assert len(findings) >= 5

    genes = [f["gene"] for f in findings if f["gene"]]
    assert any("blaSHV" in g for g in genes)
    assert any("fosA" in g for g in genes)


def test_feature_extractor_from_findings():
    findings = [
        {"gene": "blaTEM-1", "mutation": None, "class_name": "BETA-LACTAM"},
        {"gene": None, "mutation": "gyrA_D87G", "class_name": "QUINOLONE"},
        {"gene": "tet(A)", "mutation": None, "class_name": "TETRACYCLINE"},
    ]
    features = extract_amr_features_from_findings(findings)

    assert features["has_blaTEM"] == 1.0
    assert features["has_gyrA_D87G"] == 1.0
    assert features["has_tet(A)"] == 1.0
    assert features["has_mcr-1"] == 0.0
    assert features["total_amr_marker_count"] >= 3.0

    schema = get_feature_schema()
    for col in schema:
        assert col in features
