# UMBRELLA OS
## MASTER ANTIGRAVITY BUILD PROMPT
### Full Product Build — AI-Native Computational Biology Operating System

You are the lead architect and implementation agent responsible for building **Umbrella OS** from scratch.

This is a **full-product build**.

Do NOT interpret this as an MVP exercise.

Do NOT build a collection of mock screens.

Do NOT stop after one working demo.

Do NOT reduce the architecture to a frontend prototype.

The objective is to build the complete Umbrella OS platform described below, with a functioning operating-system-style desktop, scientific applications, backend services, database, data lake, computational biology engines, ML pipelines, model registry, scientific provenance, Vella AI orchestration, Umbrella Forge application generation, job execution, observability and a proper development/deployment structure.

Where a feature is computationally expensive, implement the complete architecture and a working implementation using the available local resources, with scalable workers and configuration for larger hardware.

Where a full external dataset is too large for local storage, implement resumable, manifest-driven acquisition and use available storage intelligently. Never fake completion.

Where an advanced ML model cannot reasonably run on the current hardware, implement the complete model interface and the strongest locally runnable implementation. Do not pretend that an unavailable model has been trained.

---

# 0. FINAL ANSWERS TO ALL ENVIRONMENT QUESTIONS

Do NOT ask me these questions again.

Use the following decisions as the project defaults.

## 0.1 Vella AI Provider

Primary:

**Google Gemini API**

Environment variable:

```env
GEMINI_API_KEY=
```

Secondary/fallback:

**OpenRouter**

Environment variable:

```env
OPENROUTER_API_KEY=
```

Implement a provider abstraction:

```text
Vella
  ↓
AI Provider Interface
  ├── GeminiProvider
  ├── OpenRouterProvider
  └── LocalFallbackProvider
```

Priority:

```text
Gemini
↓
OpenRouter
↓
Local deterministic fallback
```

Never hard-code provider-specific calls throughout the application.

---

# 0.2 Hardware

Current GPU:

**NVIDIA GeForce RTX 3050 Laptop GPU, 4 GB VRAM**

Primary ML strategy:

**CPU-first.**

Do not attempt to train a genomic foundation model from scratch.

Do not pretend 4 GB VRAM can support full long-context genomic foundation-model training.

Implement:

- regularized logistic regression
- gradient-boosted trees where useful
- calibrated classifiers
- k-mer models
- sparse genomic feature models
- small neural models where feasible
- frozen pretrained embedding inference as an optional branch

Advanced pretrained DNA models such as HyenaDNA or DNABERT-2 may be supported through an optional inference/embedding interface.

Do not make them required for the product to function.

---

# 0.3 Operating Environment

Host:

Windows

WSL2:

Ubuntu 22.04

Use WSL for Linux-native bioinformatics tools.

The system must support:

```text
Windows frontend development
+
WSL scientific backend/tools
```

Provide scripts for both PowerShell and Bash where practical.

---

# 0.4 Database

This is a full product.

Use:

**PostgreSQL**

as the canonical relational database.

Use:

**Redis**

for:

- job queues
- background work
- transient state
- caching

Use:

**MinIO**

for S3-compatible scientific artifact/object storage.

Use:

**pgvector**

where vector storage is genuinely required.

Do not use SQLite as the primary production architecture.

Do not reduce the database architecture merely because Docker is absent.

If Docker is unavailable, install/run PostgreSQL, Redis and MinIO through WSL-native services/binaries.

If Docker becomes available, support Docker Compose as an optional infrastructure mode.

---

# 0.5 Storage / 120 GB Data Lake

The current C: drive has approximately:

**68.79 GB free**

Therefore:

Do not blindly download 120+ GB onto C:.

Before large-scale acquisition:

1. Enumerate mounted drives.
2. Determine free space.
3. Identify the largest appropriate storage location.
4. Prefer a secondary/internal drive or explicitly configured data volume.
5. Store the data lake outside the operating system partition when possible.
6. Use MinIO/object storage where appropriate.
7. Never fill the system drive to the point of threatening Windows stability.

The logical Umbrella data lake target is:

**120 GB or greater**

but it is a storage architecture requirement, not permission to destroy local disk capacity.

If no suitable storage volume has enough capacity, pause ONLY the full-corpus acquisition and report:

```text
UMBRA DATA STORAGE CHECK

Required capacity:
...

Available capacity:
...

Recommended target:
...

Shortfall:
...
```

Continue building the complete software platform.

Do not fake a 120 GB installation.

---

# 0.6 Organizer Benchmark

First check:

```text
data/raw/organizer/
```

If the organizer-provided challenge dataset exists:

**use it as the authoritative benchmark.**

Do not modify it.

Do not replace it with external predictions.

Do not use external datasets to recreate official test labels.

If the organizer dataset is not currently available:

build the full external data ingestion system using BV-BRC and other authorized public sources for development.

When the organizer benchmark becomes available, it must be importable through the same data contract without redesigning the platform.

---

# 0.7 Model Inference

Run inference through the Python scientific backend.

Frontend never performs scientific model inference directly.

Architecture:

```text
Next.js
  ↓
FastAPI
  ↓
Model Service
  ↓
Model Registry
  ↓
Versioned Artifact
```

---

# 0.8 Full Product Requirement

There is NO MVP scope in this instruction.

All planned native applications must exist in the App Registry.

All major applications must have:

- UI
- backend
- database contract
- service layer
- data source or algorithm
- API endpoints
- loading/error states
- job handling where required
- provenance
- tests
- meaningful functionality

Do not create empty placeholder windows labelled as completed applications.

If an application is computationally expensive, make its real backend functional on a smaller test corpus and architect it for scale.

---

# 1. FIRST ACTION: READ EVERYTHING

Before writing substantial application code:

1. Inspect the entire workspace.
2. Find all uploaded/project files.
3. Read all Umbrella OS specifications.
4. Read the data guide.
5. Read the backend/ML guide.
6. Read the UI/UX guide.
7. Read the master build specification.
8. Read the Genome Firewall material.
9. Inspect uploaded diagrams/images.
10. Inspect the current Antigravity initialization report.
11. Reconcile all requirements.

Expected documents include:

```text
Umbrella OS — Antigravity Master Build Prompt
Umbrella OS — Master Build Specification
Umbrella OS — Backend and ML Build Guide
Umbrella OS — UI/UX and Frontend Build Guide
Umbrella OS — Data Sourcing and Benchmark Guide
Genome Firewall documentation
Architecture diagrams
App map
App Forge diagram
Scientific workflow diagram
```

Produce:

```text
UMBRELLA OS INITIALIZATION REPORT

Documents discovered:
...

Requirements extracted:
...

Architecture:
...

Environment:
...

Data plan:
...

Model plan:
...

Build order:
...

Potential contradictions:
...
```

Do not ask questions already answered by this prompt.

---

# 2. PRODUCT IDENTITY

Product:

# UMBRELLA OS

Subtitle:

### AI-NATIVE COMPUTATIONAL BIOLOGY OPERATING SYSTEM

Concept:

A complete scientific desktop environment where computational biology applications are first-class operating-system applications.

Umbrella OS combines:

```text
Scientific Data
+
Bioinformatics Engines
+
Machine Learning
+
Scientific Simulation
+
AI Orchestration
+
Application Generation
```

into one environment.

The design language should evoke a high-end early-2000s biotechnology/corporate research workstation while remaining original and professionally designed.

Do NOT copy copyrighted Resident Evil assets.

Do NOT copy Umbrella Corporation logos.

Do NOT use movie screenshots.

Use only the tonal inspiration:

- black/graphite
- institutional
- clinical
- classified-research feeling
- emerald/green scientific accents
- restrained amber/red warning states
- compact data density
- professional typography
- early-2000s software influence
- modern usability

Avoid:

- cyberpunk
- gamer UI
- excessive neon
- cartoon science
- fake futuristic HUDs
- oversized decorative typography

---

# 3. CORE SYSTEM ARCHITECTURE

```text
                         UMBRELLA OS
                              │
                   ┌──────────┴──────────┐
                   │        VELLA        │
                   │ AI CONTROL LAYER    │
                   └──────────┬──────────┘
                              │
                  ┌───────────┴───────────┐
                  │     UMBRELLA CORE     │
                  └───────────┬───────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
 DATA PLANE              COMPUTE PLANE          MODEL PLANE
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                       SCIENTIFIC RUNTIME
                              │
                       APPLICATION LAYER
                              │
 ┌────────┬────────┬──────────┼──────────┬────────┬─────────┐
 │        │        │          │          │        │         │
Genome  Mutation   AMR       QC       Samples   Atlas   Radiation
Analyzer Lab      Sentinel             Vault             Lab
 │        │        │          │          │        │         │
 └────────┴────────┴──────────┴──────────┴────────┴─────────┘
                              │
                       RESEARCH WORKSPACE
                              │
                       UMBRELLA FORGE
                              │
                   GENERATED SCIENTIFIC APPS
```

---

# 4. REPOSITORY ARCHITECTURE

Build a real monorepo.

```text
umbrella-os/
│
├── apps/
│   └── desktop/
│
├── services/
│   ├── api/
│   ├── workers/
│   ├── model-server/
│   └── vella/
│
├── packages/
│   ├── app-sdk/
│   ├── ui/
│   ├── shared-types/
│   ├── runtime/
│   └── permissions/
│
├── core/
│   ├── bio/
│   ├── sequence/
│   ├── amr/
│   ├── mutation/
│   ├── qc/
│   ├── simulation/
│   └── indexing/
│
├── ml/
│   ├── datasets/
│   ├── features/
│   ├── training/
│   ├── evaluation/
│   ├── calibration/
│   └── registry/
│
├── data/
│   ├── raw/
│   ├── derived/
│   ├── indexes/
│   ├── benchmark/
│   ├── manifests/
│   └── models/
│
├── infra/
│   ├── postgres/
│   ├── redis/
│   ├── minio/
│   ├── wsl/
│   └── scripts/
│
├── docs/
│
└── tests/
```

---

# 5. FRONTEND

Use:

```text
Next.js 15+
React 19
TypeScript
Tailwind CSS
Zustand
TanStack Query
Zod
Framer Motion
Lucide
```

Use component-driven architecture.

Do not duplicate window logic between applications.

---

# 6. DESKTOP

The desktop is permanent.

Applications do not become browser pages.

Each application exists inside a desktop window.

Features:

- double-click launch
- single-click selection
- drag
- resize
- 8-direction resizing
- maximize
- minimize
- restore
- close
- focus
- z-index
- taskbar entries
- window snapping
- keyboard shortcuts
- independent scroll
- tooltips
- accessible focus

Window object:

```typescript
type WindowState = {
  id: string
  appId: string
  title: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  zIndex: number
  minimized: boolean
  maximized: boolean
  focused: boolean
}
```

---

# 7. WINDOW CONTENT RULES

Every window:

```text
Window
├── Title Bar
├── Toolbar
├── Content
└── Status Bar
```

Content:

```css
overflow: auto;
min-height: 0;
```

Tables:

- sticky headings
- horizontal scrolling
- vertical scrolling
- virtualization for large datasets

Terminal:

- scrollback
- monospace output
- independent scrollbar

Genome views:

- horizontal sequence scrolling

Reports:

- independent vertical scrolling

Do not allow content to resize the window beyond the viewport.

---

# 8. TOOLTIP SYSTEM

Every unfamiliar icon must have hover text.

Examples:

```text
Close window
Minimize
Maximize
Restore
Open Genome Analyzer
Run Analysis
Show Evidence
Download Result
Open Dataset
Open Sample
```

Tooltips:

- delayed appearance
- viewport-safe
- keyboard-focus compatible
- consistent style
- never cover important content

---

# 9. BACKEND

Use:

**FastAPI**

Python 3.x.

Use:

- Pydantic v2
- SQLAlchemy 2
- Alembic
- async database access where appropriate

Services:

```text
Genome Service
Mutation Service
AMR Service
QC Service
Sample Service
Atlas Service
Simulation Service
Model Service
Dataset Service
Evidence Service
Report Service
Forge Service
Vella Service
Job Service
```

---

# 10. DATABASE

PostgreSQL is mandatory for the full product.

Tables include:

```text
users
sessions
projects

apps
app_versions
app_permissions

datasets
dataset_versions
dataset_files
dataset_manifests

genomes
genome_metadata
sequences

samples
sample_runs

phenotypes
annotations
amr_annotations
mutations

qc_runs
qc_metrics
qc_flags

models
model_versions
training_runs
model_metrics
calibration_runs
predictions

experiments
simulation_runs

evidence
provenance

jobs
job_events

reports

embeddings

audit_logs
```

Use proper indexes.

Use foreign keys.

Use migrations.

Use constraints.

Do not use JSON blobs for everything.

---

# 11. OBJECT STORAGE

Use MinIO for:

```text
FASTA
FASTQ
large datasets
AMRFinder outputs
ResFinder outputs
Parquet
model artifacts
logs
reports
generated applications
```

Object keys should be versioned.

Example:

```text
datasets/
  bvbrc/
    2026-XX/
      raw/

models/
  amr/
    ciprofloxacin/
      v1/
```

---

# 12. REDIS / JOB QUEUE

Use Redis for asynchronous jobs.

Workers handle:

```text
FASTA processing
QC
AMRFinderPlus
ResFinder
alignment
feature generation
ML training
simulation
report generation
dataset downloads
index construction
embedding generation
```

Flow:

```text
Frontend
 ↓
FastAPI
 ↓
Redis
 ↓
Worker
 ↓
Scientific engine
 ↓
Artifact
 ↓
PostgreSQL metadata
 ↓
Frontend
```

---

# 13. DATA LAKE

Implement:

```text
data/
├── raw/
│   ├── organizer/
│   ├── bvbrc/
│   ├── amrfinder/
│   ├── resfinder/
│   └── external/
│
├── derived/
│   ├── normalized/
│   ├── qc/
│   ├── amr/
│   ├── mutations/
│   ├── features/
│   └── labels/
│
├── indexes/
│   ├── trie/
│   ├── bloom/
│   └── xtree/
│
├── benchmark/
│
├── manifests/
│
└── models/
```

Raw datasets are immutable.

Derived datasets are versioned.

---

# 14. BV-BRC DATA PIPELINE

BV-BRC is the primary bacterial genome/phenotype source.

Use:

- genome metadata
- bacterial genome sequences
- genome_amr
- laboratory antibiotic results
- MIC fields where available
- testing standard
- testing method
- provenance

Do not use general model-generated phenotype fields as ground truth.

Preferred row:

```text
genome
+
antibiotic
+
laboratory measurement
+
testing method
+
testing standard
+
phenotype
```

---

# 15. DATA ACQUISITION CLI

Implement:

```bash
umbrella data init
umbrella data inspect
umbrella data manifest
umbrella data download
umbrella data resume
umbrella data verify
umbrella data normalize
umbrella data annotate
umbrella data features
umbrella data benchmark
```

Download process:

```text
Source
 ↓
manifest
 ↓
download
 ↓
checksum
 ↓
raw immutable storage
 ↓
normalize
 ↓
derived artifacts
```

Use resumable transfers.

Log every failure.

Never silently skip corrupt files.

---

# 16. 120 GB DATA ACQUISITION

Build the system to support at least:

**120 GB of scientific data**

across the data lake.

The 120 GB target may consist of:

```text
raw genomes
+
metadata
+
AMR annotations
+
derived Parquet
+
indexes
+
benchmark data
+
model artifacts
+
scientific references
```

Do not mislabel the entire 120 GB as “AMRFinderPlus database.”

AMRFinderPlus is one tool/reference layer inside the larger corpus.

Before downloading each batch:

```text
dataset manifest
source
version
license
estimated size
destination
hash policy
```

After download:

```text
verified
size
hash
file count
```

---

# 17. AMRFINDERPLUS

Use AMRFinderPlus as the default AMR annotation engine.

Store:

```text
tool
software_version
database_version
gene
mutation
locus
evidence
source_file
input_hash
output_hash
```

Never flatten the entire output into untraceable JSON.

Create normalized annotation records.

---

# 18. RESFINDER

Use ResFinder as an independent cross-check.

Do not blindly merge it into AMRFinderPlus.

Keep:

```text
source_tool
version
gene
mutation
identity
coverage
evidence
```

---

# 19. CAMRAH

Support cAMRah as an optional harmonization/ensemble workflow.

Use it to compare:

```text
AMRFinderPlus
ResFinder
RGI/CARD
Abricate/NCBI
Abricate/ARG-ANNOT
BV-BRC AMR detection
```

when available and appropriate.

Never treat consensus as laboratory truth.

---

# 20. XTREE

Support XTree as an optional scale/index layer.

Do not put the XTree index inside PostgreSQL.

Keep it externally versioned.

Example:

```text
Reference genomes
 ↓
XTree index
 ↓
query sequence
 ↓
coverage / tally / reference matches
```

---

# 21. CORE GENOME ENGINE

Implement high-performance processing in C++.

Use:

- memory mapping / streaming
- zero-copy where practical
- multithreading
- immutable indexes
- efficient sequence representations
- Trie
- Bloom filter
- k-mer processing
- atomic counters where appropriate

The goal is to evolve the computational concepts from Genome Firewall into reusable Umbrella Core services.

---

# 22. GENOME ANALYZER

## Purpose

Primary genome examination workspace.

User can:

- upload FASTA/FNA
- select stored genome
- inspect sequence statistics
- inspect contigs
- run QC
- run annotation
- run AMR
- open mutations
- view model output

API:

```text
POST /api/genomes
POST /api/genomes/{id}/analyze
GET /api/genomes/{id}
GET /api/genomes/{id}/qc
GET /api/genomes/{id}/annotations
GET /api/genomes/{id}/predictions
GET /api/genomes/{id}/evidence
```

Database:

```text
genomes
genome_metadata
sequences
```

No fake charts.

All displayed values must originate from backend data.

---

# 23. MUTATION LAB

## Purpose

Compare biological reference sequences and samples computationally.

Support:

- sequence alignment
- SNP identification
- insertion/deletion detection
- coordinates
- local sequence context
- clustered variant visualization
- reference/sample comparison

Backend:

```text
POST /api/mutations/compare
POST /api/mutations/batch
GET /api/mutations/runs/{id}
GET /api/mutations/runs/{id}/events
```

Database:

```text
mutation_runs
mutation_events
mutation_regions
reference_sequences
```

Primary algorithmic engine:

deterministic alignment/variant detection.

Optional ML:

anomaly scoring for unusual naturally observed patterns.

Do not create harmful biological engineering workflows.

---

# 24. AMR SENTINEL

## Purpose

Flag known AMR-associated genomic evidence and produce calibrated model outputs connected to laboratory observations.

Workflow:

```text
FASTA
 ↓
AMRFinderPlus
 ↓
ResFinder
 ↓
feature construction
 ↓
per-antibiotic models
 ↓
calibration
 ↓
evidence dossier
```

Apps must support multiple antibiotics.

Do not hard-code only one.

Create a model registry per antibiotic.

Example:

```text
Ciprofloxacin
Meropenem
Tetracycline
Gentamicin
Amoxicillin
Erythromycin
Vancomycin
Rifampin
```

where the available labels/data support training.

---

# 25. AMR ML TRAINING

Training data unit:

```text
genome_id
+
antibiotic
+
laboratory phenotype
```

Feature groups:

```text
AMRFinder gene presence
AMRFinder mutation presence
ResFinder evidence
marker counts
selected QC features
selected metadata
sparse k-mer counts
```

Do not use model-generated phenotype as a training label.

---

# 26. AMR BASELINE MODEL

Train one regularized logistic regression per antibiotic.

Use:

```text
scikit-learn
```

with:

- StandardScaler where appropriate
- sparse matrices where appropriate
- L1/L2 regularization
- class weighting where appropriate
- cross-validation only within training data

Persist:

```text
model.joblib
feature_schema.json
training_config.json
metrics.json
calibrator.joblib
```

---

# 27. AMR SECOND MODEL

Implement an independently trained nonlinear comparison model.

Prefer:

```text
LightGBM
or
XGBoost
```

depending on environment.

Inputs:

same engineered features.

Compare:

```text
Logistic Regression
vs
Gradient Boosting
```

Do not select a model based only on accuracy.

Report:

```text
AUROC
AUPRC
precision
recall
sensitivity
specificity
Brier
calibration
confusion matrix
```

---

# 28. RAW DNA MODEL

Implement an optional k-mer model.

Process:

```text
FASTA
 ↓
canonical k-mers
 ↓
hashed sparse features
 ↓
antibiotic model
```

Compare raw-DNA-derived performance to AMRFinder-derived features.

Keep k configurable.

Example:

```text
k = 21
k = 31
```

Benchmark memory/runtime.

Do not create giant dense matrices.

---

# 29. DNA FOUNDATION MODEL BRANCH

Implement optional adapters for:

- HyenaDNA
- DNABERT-2

Do NOT train these models from scratch.

Use:

```text
genome
 ↓
QC
 ↓
chunking / annotated region selection
 ↓
pretrained encoder
 ↓
embeddings
 ↓
pooling
 ↓
antibiotic classifier
```

Store embeddings in an embedding store.

Compare them with the baseline.

The baseline must continue working even if the GPU branch is unavailable.

---

# 30. MODEL CALIBRATION

A model probability is not scientific certainty.

Use:

```text
Platt scaling
or
Isotonic regression
```

when appropriate.

Prediction response:

```json
{
  "prediction": "resistant",
  "probability": 0.91,
  "calibrated": true,
  "confidence_band": "high",
  "model_version": "ciprofloxacin-v3",
  "feature_set": "amr-features-v4",
  "evidence_refs": []
}
```

---

# 31. CONFIDENCE ENGINE

Create a transparent confidence dossier.

Components:

```text
model probability
+
calibration quality
+
evidence coverage
+
QC status
+
OOD distance
+
model version
+
dataset provenance
```

Do not collapse everything into a fake scientific certainty number.

Show users why confidence is high/low.

---

# 32. OUT-OF-DISTRIBUTION DETECTION

Implement a basic OOD layer.

Potential methods:

- feature-space distance
- Mahalanobis distance
- nearest-neighbour distance
- density thresholding

Return:

```text
IN-DISTRIBUTION
or
LOW-COVERAGE
or
OUT-OF-DISTRIBUTION
```

The user must know when the model is being asked to operate outside its training distribution.

---

# 33. SEQUENCE QC

## Purpose

A complete sequence-quality workspace.

Metrics:

```text
sequence count
sequence length
contig count
GC content
N percentage
ambiguous bases
duplicates
fragmentation
outliers
```

Backend:

```text
POST /api/qc/run
GET /api/qc/{run_id}
GET /api/qc/{run_id}/summary
GET /api/qc/{run_id}/outliers
```

Database:

```text
qc_runs
qc_metrics
qc_flags
qc_outliers
```

---

# 34. QC MODEL

Use deterministic rules as the first authority.

Optional ML:

Train a classifier from QC statistics.

Training data can include:

- real high-quality genomes
- documented poor-quality public genomes
- controlled synthetic corruptions

Class:

```text
PASS
WARN
FAIL
```

Do not label synthetic corruption as real biological evidence.

---

# 35. SAMPLE VAULT

## Purpose

Persistent sample management.

Every sample is a reusable object.

```text
Sample
├── genome
├── metadata
├── QC
├── annotations
├── mutations
├── AMR
├── experiments
├── reports
└── provenance
```

All apps use the same SampleRef contract.

Example:

```typescript
type SampleRef = {
  sampleId: string
  genomeId?: string
  datasetVersion: string
}
```

---

# 36. PATHOGEN ATLAS

## Purpose

A research browser across organisms, references and datasets.

Views:

```text
Bacteria
Viruses
Fungi
```

Show:

```text
organism
taxonomy
genome counts
reference sequences
known annotations
available datasets
source
version
```

Backend:

```text
GET /api/atlas/organisms
GET /api/atlas/search
GET /api/atlas/organism/{id}
GET /api/atlas/taxonomy/{id}
```

Data sources:

- BV-BRC
- NCBI reference resources
- documented public taxonomy resources

---

# 37. PATHOGEN TAXONOMY MODEL

Optional model:

```text
reference genome
 ↓
k-mer representation
 ↓
taxonomy classifier
 ↓
holdout validation
```

Support hierarchical prediction.

Do not claim species-level performance without measured validation.

---

# 38. VARIANT EXPLORER

## Purpose

Explore mutation and variant relationships across samples.

Views:

```text
variant
 ↓
gene
 ↓
samples
 ↓
organisms
 ↓
timeline
```

Use:

- clustering
- dimensionality reduction
- graph visualization

Possible stack:

```text
scikit-learn
HDBSCAN
UMAP
networkx
```

where justified.

---

# 39. RESEARCH DESK

## Purpose

Persistent scientific research workspace.

Store:

```text
question
hypothesis
sample
experiment
observation
reference
note
result
```

Use PostgreSQL plus vector search for scientific documents.

RAG:

```text
document
 ↓
chunk
 ↓
embedding
 ↓
pgvector
 ↓
retrieval
 ↓
Vella
```

Every retrieved factual claim should preserve source references.

---

# 40. ANALYSIS STUDIO

## Purpose

Scientific data-analysis environment.

Features:

```text
CSV/Parquet import
filter
group
aggregate
statistics
plots
correlation
distribution
comparison
export
```

Allow Vella to create analysis pipelines through typed tools.

Do not allow LLM-generated arbitrary SQL to execute directly against production without validation.

---

# 41. BIO TERMINAL

Provide a real scientific terminal interface.

Supported environments:

```text
Bash
Python
C
C++
Rust
Java
C#
JavaScript
TypeScript
Ruby
Fortran
COBOL
```

where the local environment actually supports them.

The terminal should interact with:

```text
WSL
scientific CLI tools
umbrella CLI
project files
datasets
```

---

# 42. CONTROLLED EXECUTION

Never execute untrusted generated commands directly.

Create:

```text
CommandRunner
```

with:

```text
command
args[]
cwd
timeout
memory_limit
cpu_limit
permissions
network_policy
```

Generated applications and Vella must use this capability layer.

---

# 43. RADIATION LAB

This is a computational simulation/reference application.

Not a laboratory protocol generator.

Purpose:

Explore modeled DNA damage patterns under different high-level radiation categories.

Support conceptual categories such as:

```text
X-ray
gamma
beta
alpha
neutron
proton
```

Show:

```text
SSB
DSB
base damage
clustered damage
repair stress
```

Clearly label:

```text
SIMULATED
MODELED
REFERENCE-BASED
```

Never represent the output as experimentally measured.

Store:

```text
simulation_type
parameters
model_version
sources
run_id
output
```

---

# 44. SCIENCE LAB

General computational biological simulation workspace.

Allow:

```text
sample selection
stress scenario
simulation
timeline
visualization
```

Generate conceptual animated representations.

Examples:

```text
cell state
DNA integrity
stress response
repair activity
population-level modeled response
```

Do not implement actionable wet-lab pathogen engineering.

---

# 45. ASCII / TERMINAL BIOLOGICAL SIMULATION

Build an optional visual mode.

Example:

```text
STRESS CONDITION: ACTIVE

      ┌─────────────────────┐
      │       CELL          │
      │                     │
      │    ╭──────────╮     │
      │    │    DNA    │     │
      │    │   ╲╱╲╱    │     │
      │    ╰──────────╯     │
      │  • • • ROS • • •   │
      └─────────────────────┘
```

Animate frames.

The underlying engine supplies numerical state.

The ASCII display is only a visualization.

---

# 46. REPORT STUDIO

Generate:

```text
scientific report
analysis report
sample report
AMR evidence report
QC report
mutation report
experiment report
```

Formats:

```text
PDF
Markdown
JSON
CSV
```

Every report includes:

```text
source
version
model
tool
dataset
assumptions
timestamp
evidence
```

---

# 47. VELLA

Vella is the system-wide AI control plane.

It is not merely chat.

It has typed tools.

Tool registry:

```text
open_app
close_app
open_sample
search_samples
run_qc
run_amr
compare_sequences
inspect_variant
query_atlas
run_simulation
query_research
generate_report
inspect_model
create_app
update_app
```

User:

> “Analyze sample 1827.”

Vella should orchestrate:

```text
Sample Vault
 ↓
Genome Analyzer
 ↓
Sequence QC
 ↓
AMR Sentinel
 ↓
Mutation Lab
 ↓
Evidence
 ↓
Report Studio
```

Vella must never invent a tool result.

If a tool fails:

```text
TOOL EXECUTION FAILED
```

must be reported honestly.

---

# 48. VELLA MEMORY

Maintain scoped memory:

```text
OS memory
User preferences
Research project memory
Sample/project context
App context
```

Do not mix unrelated scientific projects.

---

# 49. UMBRELLA FORGE

This is one of the defining features.

User:

> “Build me an app that compares two bacterial genomes and visualizes the differences.”

Forge:

```text
Intent
 ↓
Requirements
 ↓
App Specification
 ↓
Component Mapping
 ↓
Permission Analysis
 ↓
Code/Schema Generation
 ↓
Validation
 ↓
Sandbox
 ↓
Install
```

Then the app appears in the desktop.

---

# 50. APP SDK

Generated applications use a controlled SDK.

Components:

```text
Window
Panel
Table
Chart
MetricCard
Button
Input
Timeline
GenomeViewer
SequenceViewer
Heatmap
Tree
Graph
Markdown
Terminal
```

Capabilities:

```text
read_genome
read_sample
run_qc
run_alignment
run_amr
read_evidence
write_report
read_dataset
```

---

# 51. APP MANIFEST

Each app:

```json
{
  "id": "genome-comparator",
  "name": "Genome Comparator",
  "version": "1.0.0",
  "permissions": [
    "read_genome"
  ],
  "capabilities": [
    "sequence_compare",
    "visualize"
  ],
  "entrypoint": "runtime",
  "created_by": "umbrella-forge"
}
```

---

# 52. APP EVOLUTION

Forge must support upgrades.

User:

> “Add GC comparison.”

Existing app:

```text
Genome Comparator v1.0
```

becomes:

```text
Genome Comparator v1.1
```

Do not rebuild the entire application from scratch if an incremental modification is possible.

Track:

```text
version
parent_version
change_spec
generated_artifacts
test_results
permissions
```

---

# 53. INTER-APP COMMUNICATION

Applications communicate through controlled OS capabilities.

Never allow arbitrary direct database access between apps.

Example:

```text
AMR Sentinel
 ↓
Evidence Service
 ↓
Report Studio
```

or:

```text
Sample Vault
 ↓
Genome Service
 ↓
Mutation Lab
```

---

# 54. SCIENTIFIC PROVENANCE

This is mandatory.

Each derived artifact records:

```text
source_manifest_id
source_file_hash
tool_name
tool_version
database_version
model_version
created_at
config_hash
upstream_artifact_hash
```

Each prediction must expose:

```text
Genome
Phenotype
Annotation
Feature
Model
Version
Evidence
Assumptions
```

Every significant UI result has:

# WHY?

or:

# EVIDENCE

---

# 55. MODEL REGISTRY

Model registry fields:

```text
model_id
model_version
task
antibiotic
algorithm
dataset_manifest_id
feature_set_id
training_run_id
metrics
calibration
artifact_uri
created_at
```

No model may be loaded without a matching manifest.

---

# 56. TRAINING DATASET VERSIONING

Every training run has:

```text
dataset_version
train_split
validation_split
test_split
feature_schema
preprocessing_version
tool_versions
database_versions
random_seed
```

The model must be reproducible from metadata.

---

# 57. TRAINING RUN PIPELINE

Implement:

```bash
umbrella ml build-features
umbrella ml split
umbrella ml train
umbrella ml evaluate
umbrella ml calibrate
umbrella ml register
umbrella ml promote
```

Example:

```bash
umbrella ml train \
  --task amr \
  --antibiotic ciprofloxacin \
  --features amr-features-v4
```

Output:

```text
models/
  ciprofloxacin/
    v1/
      model.joblib
      calibrator.joblib
      feature_schema.json
      metrics.json
      training_manifest.json
```

---

# 58. NO DATA LEAKAGE

Mandatory:

- preserve organizer split
- deduplicate
- detect near-duplicate genomes
- prevent related isolates leaking across evaluation where inappropriate
- never use official test labels for training
- never use predicted phenotype as ground truth
- preserve MIC censoring
- preserve breakpoint/version metadata

---

# 59. SCIENTIFIC DATA TYPES

Internally distinguish:

```text
OBSERVED
ANNOTATED
DERIVED
PREDICTED
SIMULATED
REFERENCE
SYNTHETIC
```

Never represent:

```text
SIMULATED
```

as:

```text
OBSERVED
```

Never represent:

```text
PREDICTED
```

as:

```text
LABORATORY RESULT
```

---

# 60. SECURITY

Umbrella OS must have a capability/permission model.

Permissions:

```text
read_sample
read_genome
read_dataset
run_analysis
run_model
run_simulation
write_report
create_app
execute_code
network_access
filesystem_access
```

Dangerous capabilities require explicit approval.

Generated applications should start with minimal privileges.

---

# 61. AUTHENTICATION

Use proper application authentication.

Support:

```text
user
admin
researcher
viewer
developer
```

Use sessions/tokens appropriately.

Never store secrets inside source code.

---

# 62. OBSERVABILITY

Create System Monitor.

Track:

```text
CPU
RAM
GPU
worker count
queue length
job duration
API latency
model latency
AMRFinder runtime
database latency
storage usage
errors
```

Expose backend telemetry.

---

# 63. AUDIT LOG

Record:

```text
who
did what
when
to which resource
with which model/tool version
from which dataset
result
```

Especially:

- model runs
- data imports
- generated applications
- permission changes
- scientific analyses

---

# 64. TESTING

Do not postpone testing.

Frontend:

```text
desktop
windows
drag
resize
scroll
tooltips
keyboard
app launch
app close
```

Backend:

```text
API
database
jobs
provenance
permissions
```

Scientific:

```text
FASTA parser
QC
alignment
mutation caller
AMRFinder integration
feature generation
```

ML:

```text
splits
features
training
serialization
calibration
evaluation
```

Forge:

```text
spec generation
manifest validation
permissions
runtime
installation
upgrade
rollback
```

---

# 65. DEPLOYMENT

Provide:

### Development

Windows + WSL.

### Production-ready path

```text
Frontend
Vercel or equivalent
        ↓
FastAPI
        ↓
PostgreSQL
Redis
MinIO
Workers
Model Service
```

Scientific compute should remain separate from the UI process.

---

# 66. CONFIGURATION

Provide:

```text
.env.example
.env.local.example
config.yaml
```

Include:

```text
GEMINI_API_KEY
OPENROUTER_API_KEY

POSTGRES_URL
REDIS_URL
MINIO_ENDPOINT
MINIO_ACCESS_KEY
MINIO_SECRET_KEY

DATA_ROOT
MODEL_ROOT
WSL_ROOT

AMRFINDER_PATH
RESFINDER_PATH
XTREE_PATH
```

Never commit real secrets.

---

# 67. CLI

Create a top-level CLI:

```bash
umbrella
```

Commands:

```text
umbrella doctor
umbrella system status
umbrella data ...
umbrella genome ...
umbrella qc ...
umbrella amr ...
umbrella mutation ...
umbrella model ...
umbrella train ...
umbrella report ...
umbrella app ...
umbrella forge ...
```

`umbrella doctor` should verify:

```text
Node
pnpm
Python
WSL
PostgreSQL
Redis
MinIO
C++
AMRFinderPlus
dataset paths
model paths
GPU availability
```

---

# 68. PHASED FULL-PRODUCT BUILD

## PHASE 1 — Environment

- inspect all documents
- validate tools
- configure WSL
- configure PostgreSQL
- configure Redis
- configure MinIO
- configure environment

---

## PHASE 2 — OS

Build:

- desktop
- launcher
- taskbar
- window manager
- resize
- drag
- minimize
- maximize
- restore
- focus
- z-index
- scroll
- tooltips

---

## PHASE 3 — Core Backend

Implement:

- authentication
- database
- object storage
- job queue
- provenance
- audit
- dataset service

---

## PHASE 4 — Bio Core

Implement:

- FASTA parser
- sequence statistics
- GC calculation
- ambiguous base detection
- contig metrics
- k-mer engine
- Trie
- Bloom filter
- alignment
- mutation engine

---

## PHASE 5 — DATA SYSTEM

Implement:

- BV-BRC adapter
- FTPS downloader
- manifest system
- checksum system
- metadata normalization
- phenotype normalization
- AMRFinderPlus integration
- ResFinder integration
- optional cAMRah
- XTree integration

---

## PHASE 6 — AMR ML

Implement:

- feature store
- per-antibiotic logistic regression
- boosting comparison
- k-mer model
- calibration
- OOD
- model registry
- inference API

---

## PHASE 7 — NATIVE APPS

Implement all applications:

```text
Genome Analyzer
Mutation Lab
AMR Sentinel
Sequence QC
Sample Vault
Pathogen Atlas
Variant Explorer
Radiation Lab
Science Lab
Research Desk
Analysis Studio
Bio Terminal
Report Studio
```

Every app must connect to real backend data/services.

---

## PHASE 8 — VELLA

Implement:

- AI provider abstraction
- intent parsing
- tool registry
- tool routing
- context
- evidence grounding
- multi-app orchestration
- permissions
- error propagation

---

## PHASE 9 — FORGE

Implement:

- requirement extraction
- App Spec
- UI generation
- SDK mapping
- permissions
- validation
- sandbox
- registry
- install
- update
- rollback

---

## PHASE 10 — ADVANCED MODELS

Implement optional:

- HyenaDNA embedding adapter
- DNABERT-2 adapter
- embedding cache
- embedding registry
- hybrid AMR model
- performance comparison

Do not block the platform if GPU resources are unavailable.

---

## PHASE 11 — SYSTEM POLISH

Implement:

- telemetry
- audit
- error handling
- loading states
- skeletons
- notifications
- keyboard shortcuts
- responsive behavior
- window persistence
- app versioning
- system monitor

---

# 69. NO FAKE COMPLETION

At every stage maintain:

```text
IMPLEMENTED
PARTIALLY IMPLEMENTED
BLOCKED
NOT IMPLEMENTED
```

Do not write:

```text
✓ completed
```

unless the actual feature exists and has been tested.

---

# 70. FULL PRODUCT DEFINITION OF DONE

Umbrella OS is complete only when:

### Desktop

The desktop behaves like an actual operating system.

### Window Manager

Applications open as independent draggable/resizable windows.

### Scientific Backend

Scientific analysis is executed through real backend engines.

### Data System

Datasets are acquired, verified, versioned and traceable.

### AMR System

AMRFinderPlus runs successfully.

### ML

Models are trained from real laboratory-linked observations.

### Model Registry

Models are versioned and reproducible.

### Apps

All native scientific applications work with real services.

### Vella

Vella can operate the OS using typed tools.

### Forge

Forge can build and install a new scientific app.

### Provenance

Every meaningful result has evidence.

### Security

Applications have capabilities and permissions.

### Observability

Jobs and system health are visible.

### Testing

Critical paths have automated tests.

### Documentation

The architecture and setup are documented.

---

# 71. FINAL PRODUCT ARCHITECTURE

The final system should feel like:

```text
                         UMBRELLA OS
                              │
                ┌─────────────┴─────────────┐
                │          VELLA            │
                │   AI Scientific Control   │
                └─────────────┬─────────────┘
                              │
                     UMBRELLA CORE
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
     DATA                   COMPUTE                 ML
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                      SCIENTIFIC RUNTIME
                              │
 ┌─────────┬─────────┬───────┼───────┬────────┬────────────┐
 │         │         │       │       │        │            │
Genome   Mutation    AMR     QC    Samples  Atlas      Variant
Analyzer  Lab      Sentinel         Vault                Explorer
 │         │         │       │       │        │            │
 └─────────┴─────────┴───────┴───────┴────────┴────────────┘
                              │
          ┌─────────────┬─────┴──────┬───────────────┐
          │             │            │               │
       Research       Analysis    Radiation       Science
        Desk          Studio       Lab             Lab
          │             │            │               │
          └─────────────┴────────────┴───────────────┘
                              │
                         BIO TERMINAL
                              │
                        REPORT STUDIO
                              │
                        UMBRELLA FORGE
                              │
                    AI-GENERATED APPLICATIONS
```

---

# 72. FINAL PRODUCT PHILOSOPHY

Umbrella OS must not feel like:

> “A website containing several bioinformatics pages.”

It must feel like:

> **A computer built specifically for computational biology.**

The desktop is the environment.

The applications are the instruments.

Umbrella Core is the computational foundation.

Vella is the intelligence layer.

The data lake is the scientific memory.

The models are the inference layer.

Forge is the extensibility mechanism.

The provenance system provides scientific traceability.

The operating system should answer:

> “I have a biological question.”

with:

> **“Open the appropriate instrument, compute the answer, show me the evidence, and let me create a new instrument if none exists.”**

---

# 73. BUILD DISCIPLINE

Do not optimize for:

```text
number of pages
```

Optimize for:

```text
working systems
```

Do not optimize for:

```text
number of AI agents
```

Optimize for:

```text
useful orchestration
```

Do not optimize for:

```text
dataset size claims
```

Optimize for:

```text
verified provenance
```

Do not optimize for:

```text
visual spectacle alone
```

Optimize for:

```text
scientific functionality + visual quality
```

Do not optimize for:

```text
one impressive demo
```

Build the actual product.

---

# 74. SECURITY / BIOLOGICAL SAFETY BOUNDARY

Umbrella OS is a computational scientific platform.

Permitted functionality:

- genome analysis
- sequence comparison
- mutation observation
- AMR annotation
- resistance surveillance
- taxonomy
- sample management
- QC
- scientific visualization
- literature analysis
- model training/evaluation
- computational simulation

Do not implement workflows whose purpose is to provide actionable instructions for:

- increasing pathogen virulence
- increasing antimicrobial resistance
- creating harmful organisms
- optimizing biological agents for harm
- evading biological detection
- executing wet-lab pathogen engineering

Sequence-design functionality should remain focused on comparison, annotation, simulation and safe computational analysis.

---

# 75. FINAL COMMAND

Do not ask me whether you should begin.

Begin.

Start with:

```text
UMBRELLA OS INITIALIZATION REPORT
```

Then:

```text
ENVIRONMENT AUDIT
```

Then:

```text
DATA STORAGE AUDIT
```

Then:

```text
DATABASE INITIALIZATION
```

Then:

```text
MONOREPO INITIALIZATION
```

Then:

```text
DESKTOP + WINDOW MANAGER
```

Then:

```text
UMBRA CORE
```

Then:

```text
DATA PIPELINE
```

Then:

```text
ML PIPELINE
```

Then:

```text
ALL NATIVE APPS
```

Then:

```text
VELLA
```

Then:

```text
UMBRELLA FORGE
```

Then:

```text
OBSERVABILITY + PROVENANCE + SECURITY
```

Then:

```text
FULL SYSTEM TEST
```

Do not stop at an MVP.

Do not leave major features as placeholders.

Do not generate fake scientific values.

Do not fabricate benchmark performance.

Do not claim data was downloaded unless the files exist.

Do not claim models were trained unless artifacts and metrics exist.

Do not claim an application works until it actually communicates with the backend.

Build **Umbrella OS as a complete product**.