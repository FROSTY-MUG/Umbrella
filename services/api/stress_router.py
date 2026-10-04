"""
Umbrella OS - Bacterial Cellular Stress Simulator
Simulates and visualizes dynamic bacterial growth curves, stress gene expression heatmaps,
and 2D/3D cellular morphology across multi-axis environmental stress conditions:
Temperature, pH, Antibiotic challenges, Oxidative (H2O2), Osmotic (NaCl), and UV radiation.
"""

import math
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.api.auth_router import get_current_user
from services.api import models

router = APIRouter(prefix="/stress", tags=["Bacterial Stress Simulation Lab"])

class StressSimulationRequest(BaseModel):
    strain_name: str = "Escherichia coli K-12"
    stress_type: str = "oxidative" # oxidative, thermal, antibiotic, osmotic, acid_ph, uv
    intensity: float = 0.65 # 0.0 to 1.0 (or concentration scale)
    duration_hours: float = 8.0 # hours
    temperature_c: float = 37.0
    ph_level: float = 7.0
    antibiotic_ug_ml: float = 0.0

@router.post("/simulate")
def simulate_bacterial_stress(
    req: StressSimulationRequest,
    current_user: models.User = Depends(get_current_user)
):
    """
    Computes mathematical growth kinetics under selected stress challenge:
    Lag time expansion, growth rate reduction (mu_max), maximal carrying capacity (OD600),
    and transcriptional stress response pathway induction.
    """
    intensity = max(0.0, min(1.0, req.intensity))
    hours = max(1.0, min(48.0, req.duration_hours))

    # Base growth kinetics (Modified Gompertz equation)
    # y = A * exp(-exp(mu * e / A * (lag - t) + 1))
    A_uninhibited = 1.85 # Max OD600
    mu_uninhibited = 0.85 # Specific growth rate hr^-1
    lag_uninhibited = 1.0 # hr

    # Inhibition scaling based on stress class and intensity
    mu = mu_uninhibited * max(0.02, 1.0 - (intensity * 0.85))
    lag = lag_uninhibited + (intensity * 4.5)
    A = max(0.15, A_uninhibited * (1.0 - (intensity * 0.7)))

    growth_curve = []
    steps = int(hours * 4) # 15-min intervals
    for step in range(steps + 1):
        t = step * 0.25
        if t < lag:
            od = 0.05 + 0.01 * (t / max(0.1, lag))
        else:
            try:
                # Gompertz curve formula
                exponent = math.exp((mu * math.e / A) * (lag - t) + 1.0)
                od = 0.05 + A * math.exp(-exponent)
            except OverflowError:
                od = A

        # Add viable cell counts (log10 CFU/mL)
        cfu = 5.0 + (od / A_uninhibited) * 4.2 if od > 0.06 else 4.0 - intensity * 2.0
        growth_curve.append({
            "time_hours": round(t, 2),
            "od600": round(od, 4),
            "log10_cfu_ml": round(max(1.0, cfu), 2),
            "viability_percent": round(max(2.0, min(100.0, (od / (0.05 + A)) * 100 * (1.0 - intensity * 0.3))), 1)
        })

    # Stress Gene Expression Profiles (Fold change vs unstressed control)
    stress_genes = {
        "oxidative": [
            {"gene": "katG", "protein": "Catalase-peroxidase", "fold_induction": round(1.0 + intensity * 14.5, 1), "pathway": "OxyR Regulon"},
            {"gene": "sodA", "protein": "Superoxide dismutase [Mn]", "fold_induction": round(1.0 + intensity * 8.2, 1), "pathway": "SoxRS Regulon"},
            {"gene": "ahpC", "protein": "Alkyl hydroperoxide reductase", "fold_induction": round(1.0 + intensity * 6.4, 1), "pathway": "Peroxide clearance"},
            {"gene": "gor", "protein": "Glutathione reductase", "fold_induction": round(1.0 + intensity * 4.1, 1), "pathway": "Redox Homeostasis"}
        ],
        "thermal": [
            {"gene": "groEL", "protein": "60 kDa Chaperonin", "fold_induction": round(1.0 + intensity * 18.0, 1), "pathway": "Heat Shock (Sigma 32)"},
            {"gene": "dnaK", "protein": "Hsp70 Chaperone", "fold_induction": round(1.0 + intensity * 15.4, 1), "pathway": "Heat Shock (Sigma 32)"},
            {"gene": "clpB", "protein": "Disaggregase ATP-dependent", "fold_induction": round(1.0 + intensity * 9.8, 1), "pathway": "Protein refolding"},
            {"gene": "ibpA", "protein": "Small heat shock chaperone", "fold_induction": round(1.0 + intensity * 12.2, 1), "pathway": "Inclusion body prevent"}
        ],
        "antibiotic": [
            {"gene": "marA", "protein": "Multiple antibiotic resistance activator", "fold_induction": round(1.0 + intensity * 11.2, 1), "pathway": "Mar Regulon / Efflux"},
            {"gene": "acrB", "protein": "Multidrug efflux transporter", "fold_induction": round(1.0 + intensity * 8.9, 1), "pathway": "AcrAB-TolC Pump"},
            {"gene": "tolC", "protein": "Outer membrane efflux channel", "fold_induction": round(1.0 + intensity * 5.4, 1), "pathway": "Envelope Stress"},
            {"gene": "recA", "protein": "Recombinase / SOS inducer", "fold_induction": round(1.0 + intensity * 16.0, 1), "pathway": "SOS DNA Damage"}
        ],
        "osmotic": [
            {"gene": "proV", "protein": "Glycine betaine ABC transporter", "fold_induction": round(1.0 + intensity * 13.1, 1), "pathway": "Osmoregulation (ProU)"},
            {"gene": "betA", "protein": "Choline dehydrogenase", "fold_induction": round(1.0 + intensity * 7.5, 1), "pathway": "Osmolyte Synthesis"},
            {"gene": "kdpA", "protein": "Potassium-transporting ATPase", "fold_induction": round(1.0 + intensity * 9.0, 1), "pathway": "Turgor Pressure"},
            {"gene": "envZ", "protein": "Osmolarity sensor kinase", "fold_induction": round(1.0 + intensity * 3.8, 1), "pathway": "Two-component OmpR"}
        ]
    }

    selected_genes = stress_genes.get(req.stress_type, stress_genes["oxidative"])

    # Cellular Morphology Metrics
    morphology = {
        "cellular_elongation_index": round(1.0 + intensity * 2.8, 2), # Filamentation
        "membrane_permeability_ratio": round(1.0 + intensity * 3.4, 2),
        "septum_formation_delay_mins": round(intensity * 45.0, 1),
        "inclusion_body_density": "HIGH" if intensity > 0.75 else "MEDIUM" if intensity > 0.45 else "NEGLIGIBLE",
        "phenotypic_fate": "Cellular Filamentation & Quorum Arrest" if intensity > 0.7 else "Adaptive Homeostasis"
    }

    return {
        "status": "SIMULATION_SUCCESS",
        "strain": req.strain_name,
        "stress_type": req.stress_type,
        "intensity": intensity,
        "duration_hours": hours,
        "growth_kinetics": {
            "max_growth_rate_mu": round(mu, 3),
            "lag_phase_hours": round(lag, 2),
            "carrying_capacity_od600": round(A, 3)
        },
        "growth_curve": growth_curve,
        "induced_stress_genes": selected_genes,
        "cellular_morphology": morphology,
        "disclaimer": "Computational model for microbiological research and teaching. Not for clinical diagnostic use."
    }
