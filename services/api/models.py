"""
Umbrella OS - Scientific Relational Models
Full relational schema matching specifications for samples, phenotypes, AMR annotations,
predictions, jobs, and generated applications.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, BigInteger
)
from sqlalchemy.orm import relationship
from services.api.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Sample(Base):
    __tablename__ = "samples"

    sample_id = Column(String(36), primary_key=True, default=generate_uuid)
    genome_id = Column(String(64), unique=True, index=True, nullable=True)
    organism = Column(String(128), nullable=False)
    taxon_id = Column(Integer, nullable=True)
    assembly_accession = Column(String(64), nullable=True)
    sequence_uri = Column(Text, nullable=False)
    sequence_sha256 = Column(String(64), nullable=False, index=True)
    qc = Column(JSON, default=dict)
    sample_metadata = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    findings = relationship("AmrFinding", back_populates="sample", cascade="all, delete-orphan")
    predictions = relationship("PredictionRecord", back_populates="sample", cascade="all, delete-orphan")

class AmrLab(Base):
    """Laboratory measured antibiotic susceptibility results (Ground Truth)."""
    __tablename__ = "amr_lab"

    record_id = Column(String(64), primary_key=True)
    genome_id = Column(String(64), index=True, nullable=False)
    antibiotic = Column(String(64), index=True, nullable=False)
    evidence = Column(String(32), default="Phenotype")
    measurement = Column(Text, nullable=True)
    measurement_sign = Column(String(8), nullable=True)
    measurement_value = Column(Float, nullable=True)
    measurement_unit = Column(String(16), nullable=True)
    resistant_phenotype = Column(String(32), nullable=True)
    testing_standard = Column(String(32), nullable=True)
    testing_standard_year = Column(Integer, nullable=True)
    laboratory_typing_method = Column(String(64), nullable=True)
    source = Column(String(64), default="BV-BRC")
    raw_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class AmrFinding(Base):
    """AMRFinderPlus / ResFinder detected genes and mutations."""
    __tablename__ = "amr_findings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sample_id = Column(String(36), ForeignKey("samples.sample_id"), nullable=False)
    genome_id = Column(String(64), nullable=True, index=True)
    gene = Column(String(64), nullable=True, index=True)
    mutation = Column(String(64), nullable=True)
    class_name = Column(String(64), nullable=True)
    method = Column(String(32), default="AMRFinderPlus")
    software_version = Column(String(32), default="4.2.7")
    database_version = Column(String(32), default="2024-05-02.1")
    identity_percent = Column(Float, nullable=True)
    coverage_percent = Column(Float, nullable=True)
    raw_artifact_uri = Column(Text, nullable=True)
    evidence = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    sample = relationship("Sample", back_populates="findings")

class AnalysisJob(Base):
    """Asynchronous scientific computation job tracking."""
    __tablename__ = "analysis_jobs"

    job_id = Column(String(36), primary_key=True, default=generate_uuid)
    sample_id = Column(String(36), nullable=True)
    workflow = Column(String(64), nullable=False)
    state = Column(String(32), default="QUEUED", index=True)  # QUEUED, RUNNING, COMPLETED, FAILED
    progress = Column(Float, default=0.0)
    artifact_uri = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    job_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ModelRegistryEntry(Base):
    """Versioned machine learning model registry entries."""
    __tablename__ = "model_registry"

    model_id = Column(String(64), primary_key=True)
    target = Column(String(64), nullable=False)
    model_type = Column(String(64), nullable=False)
    feature_schema = Column(String(64), nullable=False)
    artifact_uri = Column(Text, nullable=False)
    training_manifest = Column(JSON, nullable=False)
    metrics = Column(JSON, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PredictionRecord(Base):
    """Calibrated antibiotic resistance predictions with evidence dossier."""
    __tablename__ = "predictions"

    prediction_id = Column(String(36), primary_key=True, default=generate_uuid)
    sample_id = Column(String(36), ForeignKey("samples.sample_id"), nullable=False)
    genome_id = Column(String(64), nullable=True)
    antibiotic = Column(String(64), nullable=False, index=True)
    predicted_class = Column(String(32), nullable=False)
    calibrated_probability = Column(Float, nullable=False)
    confidence_band = Column(String(16), nullable=False)  # HIGH, MEDIUM, LOW
    evidence_coverage = Column(Float, default=1.0)
    ood_flag = Column(String(32), default="IN_DOMAIN")
    model_id = Column(String(64), nullable=True)
    model_version = Column(String(32), nullable=False)
    feature_summary = Column(JSON, default=dict)
    evidence_refs = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    sample = relationship("Sample", back_populates="predictions")

class AppManifestRecord(Base):
    """App registry for native and Umbrella Forge generated applications."""
    __tablename__ = "apps"

    app_id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    version = Column(String(32), default="1.0.0")
    entrypoint = Column(String(64), default="native")
    permissions = Column(JSON, default=list)
    capabilities = Column(JSON, default=list)
    manifest = Column(JSON, nullable=False)
    spec_dsl = Column(JSON, nullable=False)
    created_by = Column(String(64), default="umbrella-forge")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLogEntry(Base):
    """Immutable audit trail for all user and OS operations."""
    __tablename__ = "audit_logs"

    log_id = Column(BigInteger, primary_key=True, autoincrement=True)
    actor = Column(String(64), default="SYSTEM")
    action = Column(String(64), nullable=False)
    resource_type = Column(String(64), nullable=False)
    resource_id = Column(String(64), nullable=True)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
