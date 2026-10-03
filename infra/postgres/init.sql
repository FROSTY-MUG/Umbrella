-- Umbrella OS Database Initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Sample registry
CREATE TABLE IF NOT EXISTS samples (
    sample_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    genome_id TEXT UNIQUE,
    organism TEXT NOT NULL,
    taxon_id INT,
    assembly_accession TEXT,
    sequence_uri TEXT NOT NULL,
    sequence_sha256 TEXT NOT NULL,
    qc JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Laboratory AMR observations (ground truth labels)
CREATE TABLE IF NOT EXISTS amr_lab (
    record_id TEXT PRIMARY KEY,
    genome_id TEXT NOT NULL,
    antibiotic TEXT NOT NULL,
    evidence TEXT NOT NULL,
    measurement TEXT,
    measurement_sign TEXT,
    measurement_value DOUBLE PRECISION,
    measurement_unit TEXT,
    resistant_phenotype TEXT,
    testing_standard TEXT,
    testing_standard_year INT,
    laboratory_typing_method TEXT,
    source TEXT,
    raw_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Computational AMR findings (AMRFinderPlus / ResFinder outputs)
CREATE TABLE IF NOT EXISTS amr_findings (
    id BIGSERIAL PRIMARY KEY,
    sample_id UUID REFERENCES samples(sample_id) ON DELETE CASCADE,
    genome_id TEXT,
    gene TEXT,
    mutation TEXT,
    class_name TEXT,
    method TEXT NOT NULL,
    software_version TEXT NOT NULL,
    database_version TEXT NOT NULL,
    identity_percent DOUBLE PRECISION,
    coverage_percent DOUBLE PRECISION,
    raw_artifact_uri TEXT,
    evidence JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Asynchronous analysis jobs
CREATE TABLE IF NOT EXISTS analysis_jobs (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sample_id UUID,
    workflow TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'QUEUED',
    progress REAL DEFAULT 0.0,
    artifact_uri TEXT,
    error TEXT,
    job_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Model registry & versioned training runs
CREATE TABLE IF NOT EXISTS model_registry (
    model_id TEXT PRIMARY KEY,
    target TEXT NOT NULL,
    model_type TEXT NOT NULL,
    feature_schema TEXT NOT NULL,
    artifact_uri TEXT NOT NULL,
    training_manifest JSONB NOT NULL,
    metrics JSONB NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Model prediction records with full evidence dossier
CREATE TABLE IF NOT EXISTS predictions (
    prediction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sample_id UUID REFERENCES samples(sample_id) ON DELETE CASCADE,
    genome_id TEXT,
    antibiotic TEXT NOT NULL,
    predicted_class TEXT NOT NULL,
    calibrated_probability DOUBLE PRECISION NOT NULL,
    confidence_band TEXT NOT NULL,
    evidence_coverage DOUBLE PRECISION,
    ood_flag TEXT DEFAULT 'IN_DOMAIN',
    model_id TEXT,
    model_version TEXT NOT NULL,
    feature_summary JSONB DEFAULT '{}'::jsonb,
    evidence_refs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. App registry for Umbrella Forge generated applications
CREATE TABLE IF NOT EXISTS apps (
    app_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    entrypoint TEXT NOT NULL DEFAULT 'native',
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    manifest JSONB NOT NULL,
    spec_dsl JSONB NOT NULL,
    created_by TEXT DEFAULT 'umbrella-forge',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create essential performance indexes
CREATE INDEX IF NOT EXISTS idx_samples_genome_id ON samples(genome_id);
CREATE INDEX IF NOT EXISTS idx_amr_lab_genome_id ON amr_lab(genome_id);
CREATE INDEX IF NOT EXISTS idx_amr_lab_antibiotic ON amr_lab(antibiotic);
CREATE INDEX IF NOT EXISTS idx_amr_findings_sample_id ON amr_findings(sample_id);
CREATE INDEX IF NOT EXISTS idx_amr_findings_gene ON amr_findings(gene);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_state ON analysis_jobs(state);
CREATE INDEX IF NOT EXISTS idx_predictions_sample_id ON predictions(sample_id);
CREATE INDEX IF NOT EXISTS idx_predictions_antibiotic ON predictions(antibiotic);
