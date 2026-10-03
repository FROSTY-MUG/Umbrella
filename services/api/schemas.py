"""
Umbrella OS - Scientific API Request and Response Schemas
Typed Pydantic contracts for all native apps, models, Vella, and Forge.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# --- SAMPLES & QC ---
class SampleCreate(BaseModel):
    genome_id: Optional[str] = None
    organism: str = "Escherichia coli"
    taxon_id: Optional[int] = 562
    sequence_content: Optional[str] = None
    assembly_accession: Optional[str] = None

class SampleResponse(BaseModel):
    sample_id: str
    genome_id: Optional[str] = None
    organism: str
    taxon_id: Optional[int] = None
    assembly_accession: Optional[str] = None
    sequence_uri: str
    sequence_sha256: str
    qc: Dict[str, Any] = Field(default_factory=dict)
    created_at: str

class QCResponse(BaseModel):
    sample_id: str
    sha256: str
    total_bases: int
    contig_count: int
    gc_fraction: float
    gc_percent: float
    n_fraction: float
    ambiguous_bases: int
    n50: int
    status: str
    flags: List[str]
    transform: str

# --- AMR & PHENOTYPE ---
class AMRFindingItem(BaseModel):
    gene: Optional[str] = None
    mutation: Optional[str] = None
    class_name: Optional[str] = None
    method: str = "AMRFinderPlus"
    software_version: str = "4.2.7"
    database_version: str = "2024-05-02.1"
    evidence: Dict[str, Any] = Field(default_factory=dict)

class AMRResponse(BaseModel):
    sample_id: str
    findings: List[AMRFindingItem]
    detected_marker_count: int
    resistance_summary: Dict[str, str]  # drug_class -> status (HIGH, MED, LOW)

# --- MUTATIONS ---
class MutationCompareRequest(BaseModel):
    reference_sample_id: Optional[str] = None
    query_sample_id: Optional[str] = None
    reference_seq: Optional[str] = None
    query_seq: Optional[str] = None

class VariantItem(BaseModel):
    position: int
    contig: str
    type: str
    ref: str
    alt: str
    evidence: str
    context: str

class MutationCompareResponse(BaseModel):
    reference_length: int
    query_length: int
    summary: Dict[str, int]
    variants: List[VariantItem]
    provenance: Dict[str, Any]

# --- ML PREDICTIONS ---
class PredictionRequest(BaseModel):
    sample_id: str
    antibiotic: str = "Ciprofloxacin"
    model_version: str = "v1.0.0"

class PredictionResponse(BaseModel):
    prediction_id: str
    sample_id: str
    antibiotic: str
    predicted_class: str  # Resistant, Susceptible
    calibrated_probability: float
    confidence_band: str  # HIGH, MEDIUM, LOW
    evidence_coverage: float
    ood_flag: str
    model_id: str
    model_version: str
    feature_summary: Dict[str, Any]
    evidence_refs: List[Dict[str, Any]]
    research_use_only: bool = True

# --- SIMULATION ---
class RadiationSimRequest(BaseModel):
    radiation_type: str = "X-RAY"
    dose_gy: float = 2.0
    target_bases: int = 4_600_000
    seed: int = 42

class RadiationSimResponse(BaseModel):
    simulation_id: str
    radiation_type: str
    dose_gy: float
    let_category: str
    mean_let_kev_um: float
    mechanism: str
    modeled_outputs: Dict[str, Any]
    model_metadata: Dict[str, Any]

# --- VELLA AI ORCHESTRATOR ---
class VellaChatRequest(BaseModel):
    prompt: str
    active_sample_id: Optional[str] = None
    active_app_id: Optional[str] = None

class VellaActionItem(BaseModel):
    action: str  # open_app, focus_window, run_tool, show_notification
    target: str
    params: Dict[str, Any] = Field(default_factory=dict)

class VellaChatResponse(BaseModel):
    response_text: str
    intent: str
    tools_called: List[str]
    actions: List[VellaActionItem]
    grounded_evidence: List[Dict[str, Any]]
    provider_used: str

# --- FORGE ---
class ForgeGenerateRequest(BaseModel):
    intent_prompt: str

class ForgeInstallRequest(BaseModel):
    app_id: str
    spec_dsl: Dict[str, Any]

class AppResponse(BaseModel):
    app_id: str
    name: str
    version: str
    entrypoint: str
    permissions: List[str]
    capabilities: List[str]
    manifest: Dict[str, Any]
    spec_dsl: Dict[str, Any]
    created_by: str
    created_at: str

# --- SYSTEM & TELEMETRY ---
class SystemStatusResponse(BaseModel):
    system: str
    version: str
    active_jobs: int
    total_samples: int
    registered_apps: int
    models_available: List[str]
    host_resources: Dict[str, Any]
