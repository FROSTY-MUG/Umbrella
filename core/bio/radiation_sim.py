"""
Umbrella OS - Radiation & Science Lab Simulation Engine
Simulates computational biological responses and modeled DNA damage patterns
across radiation and environmental stress categories.
All outputs are explicitly labeled as MODELED / SIMULATED under physical assumptions.
"""

from typing import Dict, Any, List
import random

RADIATION_PROFILES = {
    "X-RAY": {
        "let_category": "LOW_LET",
        "mean_let_kev_um": 1.5,
        "ssb_ratio": 0.85,
        "dsb_ratio": 0.04,
        "base_damage_ratio": 0.70,
        "clustered_ratio": 0.15,
        "direct_vs_indirect": "20% Direct / 80% Indirect (Radiolysis ROS)"
    },
    "GAMMA": {
        "let_category": "LOW_LET",
        "mean_let_kev_um": 0.3,
        "ssb_ratio": 0.88,
        "dsb_ratio": 0.03,
        "base_damage_ratio": 0.75,
        "clustered_ratio": 0.10,
        "direct_vs_indirect": "15% Direct / 85% Indirect (Radiolysis ROS)"
    },
    "BETA": {
        "let_category": "LOW_LET",
        "mean_let_kev_um": 0.8,
        "ssb_ratio": 0.82,
        "dsb_ratio": 0.05,
        "base_damage_ratio": 0.65,
        "clustered_ratio": 0.18,
        "direct_vs_indirect": "25% Direct / 75% Indirect"
    },
    "PROTON": {
        "let_category": "INTERMEDIATE_LET",
        "mean_let_kev_um": 10.0,
        "ssb_ratio": 0.65,
        "dsb_ratio": 0.15,
        "base_damage_ratio": 0.50,
        "clustered_ratio": 0.45,
        "direct_vs_indirect": "50% Direct / 50% Indirect"
    },
    "NEUTRON": {
        "let_category": "HIGH_LET",
        "mean_let_kev_um": 30.0,
        "ssb_ratio": 0.45,
        "dsb_ratio": 0.28,
        "base_damage_ratio": 0.40,
        "clustered_ratio": 0.70,
        "direct_vs_indirect": "70% Direct / 30% Indirect"
    },
    "ALPHA": {
        "let_category": "HIGH_LET",
        "mean_let_kev_um": 100.0,
        "ssb_ratio": 0.35,
        "dsb_ratio": 0.40,
        "base_damage_ratio": 0.30,
        "clustered_ratio": 0.85,
        "direct_vs_indirect": "85% Direct / 15% Indirect (Dense Track Core)"
    }
}

def simulate_radiation_damage(
    radiation_type: str,
    dose_gy: float = 2.0,
    target_bases: int = 4_600_000,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Computes modeled DNA damage yield based on radiation biophysics literature:
    ~1000 SSBs and ~40 DSBs per Gy per human cell equivalent, scaled to bacterial genome.
    High-LET particles induce high fraction of clustered, repair-resistant lesions.
    """
    rad_key = radiation_type.strip().upper()
    profile = RADIATION_PROFILES.get(rad_key, RADIATION_PROFILES["X-RAY"])

    rng = random.Random(seed)

    # Yield per Gy per Megabase (approximate physical constants)
    base_ssb_rate = 15.0 * dose_gy * profile["ssb_ratio"]
    base_dsb_rate = 0.8 * dose_gy * profile["dsb_ratio"] * (profile["mean_let_kev_um"] ** 0.35)
    base_mod_rate = 25.0 * dose_gy * profile["base_damage_ratio"]

    genome_mb = target_bases / 1_000_000.0

    # Stochastic variance
    ssb_count = int(base_ssb_rate * genome_mb * rng.uniform(0.92, 1.08))
    dsb_count = int(base_dsb_rate * genome_mb * rng.uniform(0.88, 1.12))
    base_mods = int(base_mod_rate * genome_mb * rng.uniform(0.90, 1.10))
    clustered_sites = int((dsb_count * 0.8 + ssb_count * 0.2) * profile["clustered_ratio"])

    # DNA Integrity Score (0 - 100%)
    damage_penalty = (ssb_count * 0.005 + dsb_count * 0.15 + clustered_sites * 0.25)
    dna_integrity = max(5.0, round(100.0 - damage_penalty, 1))

    # Repair difficulty index
    repair_load = min(100.0, round((dsb_count * 2.5 + clustered_sites * 4.0) / (genome_mb + 1), 1))

    return {
        "simulation_id": f"RAD-SIM-{abs(hash((rad_key, dose_gy, seed))) % 1000000:06d}",
        "radiation_type": rad_key,
        "dose_gy": dose_gy,
        "let_category": profile["let_category"],
        "mean_let_kev_um": profile["mean_let_kev_um"],
        "mechanism": profile["direct_vs_indirect"],
        "modeled_outputs": {
            "single_strand_breaks": ssb_count,
            "double_strand_breaks": dsb_count,
            "oxidative_base_lesions": base_mods,
            "complex_clustered_damage_sites": clustered_sites,
            "dna_integrity_percent": dna_integrity,
            "cellular_repair_load_percent": repair_load
        },
        "model_metadata": {
            "model_version": "Umbrella-BioRad-v1.0",
            "nature_of_output": "MODELED / SIMULATED",
            "disclaimer": "Outputs are computational estimates under biophysical assumptions, NOT experimental measurements.",
            "literature_sources": [
                "Goodhead DT. Initial events in the cellular effects of ionising radiations: clustered damage in DNA. Int J Radiat Biol. 1994.",
                "Ward JF. The yield of DNA double-strand breaks produced by ionizing radiation. Radiat Res. 1988."
            ]
        }
    }
