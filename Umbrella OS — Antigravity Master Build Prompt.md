# UMBRELLA OS
## MASTER ANTIGRAVITY BUILD PROMPT
### Greenfield rebuild from scratch — computational biology operating system

You are the lead software architect, ML engineer, bioinformatics engineer, backend engineer, frontend engineer, DevOps engineer and product engineer responsible for building **Umbrella OS** from scratch.

This is not a normal web application.

Do not approach this as “build a dashboard with some AI features.”

The goal is to build a functioning **AI-native computational biology operating system** with a desktop environment, native scientific applications, a shared scientific data layer, computational engines, ML inference, scientific provenance, an AI orchestration layer called **Vella**, and an AI application-generation system called **Umbrella Forge**.

The product should feel like a professional early-2000s corporate/scientific workstation inspired by the visual language of fictional bio-research interfaces, including the Resident Evil-era Umbrella aesthetic, but the implementation, logo, visual identity, terminology and assets must be original and professional. Do not copy copyrighted logos, movie screenshots, artwork or proprietary interfaces.

---

# 0. ABSOLUTE FIRST INSTRUCTION

Before writing substantial application code:

1. Inspect the entire workspace.
2. Locate every Umbrella OS specification, PDF, markdown document, image asset, architecture diagram, UI specification, backend specification, data guide and previous generated specification available in the workspace.
3. Read ALL of them.
4. Do not only read filenames or summaries.
5. Extract the requirements into one internal implementation plan.
6. Identify contradictions between documents rather than silently choosing one.
7. Preserve terminology used by the Umbrella documents unless there is a compelling engineering reason to change it.
8. Do not invent datasets, API responses, benchmark scores or scientific results.
9. Do not claim that a dataset was successfully downloaded until the filesystem actually contains it and a checksum/manifest has been recorded.
10. Do not claim that an ML model was trained until an actual training run has completed and produced a versioned artifact and evaluation report.

The documents that should be treated as primary project specifications include, where available:

- Umbrella OS — Master Build Specification
- Umbrella OS — Backend and ML Build Guide
- Umbrella OS — UI/UX and Frontend Build Guide
- Umbrella OS — Data Sourcing and Benchmark Guide
- Genome Firewall source/research documentation
- any uploaded architecture diagrams
- any uploaded App Forge diagrams
- any uploaded application maps
- any uploaded scientific workflow diagrams

The data guide is particularly important because it defines the benchmark/data philosophy: use the organizer-pinned benchmark as the event benchmark of record, preserve laboratory phenotype as ground truth, treat AMRFinderPlus/ResFinder/cAMRah outputs as annotations/features, and keep dataset/tool/database provenance. Follow those principles throughout the implementation.

---

# 1. CLARIFYING QUESTIONS — BUT DO NOT BLOCK THE BUILD

After reading the project files, provide me with a section called:

## BLOCKING QUESTIONS

Only ask questions that genuinely affect implementation.

Examples:

1. Which AI API should be the primary Vella provider?
   - Gemini
   - OpenRouter
   - both with a provider abstraction

2. What GPU is available?
   - NVIDIA/CUDA
   - CPU only
   - remote/Colab GPU

3. How much disk space is currently available for the biological data lake?

4. Should PostgreSQL run locally through Docker or through Supabase?

5. Has the organizer's fixed benchmark dataset already been supplied?

6. Is the full external corpus authorized for use in the event, or is it only for development/research?

7. What exact WSL distribution is installed?

8. Should model inference run locally or through a Python service?

Ask these questions clearly, but DO NOT stop all implementation waiting for answers.

Unless an answer is required to avoid destructive actions, begin building the portions whose design is already determined.

For non-blocking choices, make a technically sound default and document the assumption.

At the beginning of the session produce:

```text
UMBRELLA OS INITIALIZATION REPORT

Documents discovered:
...

Architecture understood:
...

Blocking questions:
...

Assumptions:
...

Buildable immediately:
...

Potential conflicts:
...
```

---

# 2. CORE PRODUCT THESIS

Umbrella OS is:

> **An AI-native computational biology operating system that turns fragmented genomic analysis tools, datasets, scientific workflows and computational engines into a unified programmable research environment.**

The OS is not just an application collection.

It has:

```text
UMBRELLA OS
│
├── Desktop Environment
├── Window Manager
├── App Registry
├── Scientific Runtime
├── Data Layer
├── Compute Layer
├── Model Layer
├── Provenance Layer
├── Vella
├── Umbrella Forge
└── Native Scientific Applications
```

The critical distinction:

### OS

Provides common services.

### Apps

Provide scientific workflows.

### Core

Provides computational biology engines.

### Vella

Provides natural-language orchestration.

### Forge

Generates new safe scientific applications.

---

# 3. FRONTEND TECHNOLOGY

Use:

- Next.js 15+
- React
- TypeScript
- Tailwind CSS where appropriate
- Framer Motion only where it improves the interaction
- Lucide or another clean icon library
- Zustand for desktop/window state
- TanStack Query for server state
- React Hook Form where forms become substantial
- Zod for contracts/validation

Do not build the UI as a collection of unrelated pages.

The desktop itself must be a persistent application shell.

Recommended structure:

```text
frontend/
├── app/
│   ├── page.tsx
│   ├── desktop/
│   ├── api/
│   └── ...
│
├── components/
│   ├── desktop/
│   ├── windows/
│   ├── taskbar/
│   ├── launcher/
│   ├── tooltips/
│   ├── charts/
│   ├── scientific/
│   └── shared/
│
├── apps/
│   ├── genome-analyzer/
│   ├── mutation-lab/
│   ├── amr-sentinel/
│   ├── sequence-qc/
│   ├── pathogen-atlas/
│   └── radiation-lab/
│
├── lib/
│   ├── api/
│   ├── runtime/
│   ├── permissions/
│   └── state/
│
└── types/
```

---

# 4. DESKTOP ENVIRONMENT

The landing screen must immediately look like an operating system.

Do NOT make it look like a SaaS dashboard.

The user sees:

```text
┌────────────────────────────────────────────────────────────┐
│ UMBRELLA OS                                  SYSTEM 22:41 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   [ GENOME ANALYZER ]   [ MUTATION LAB ]                  │
│                                                            │
│   [ AMR SENTINEL ]      [ SEQUENCE QC ]                   │
│                                                            │
│   [ PATHOGEN ATLAS ]    [ RADIATION LAB ]                 │
│                                                            │
│                                                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  FILES   SEARCH   TERMINAL   VELLA   FORGE       22:41     │
└────────────────────────────────────────────────────────────┘
```

Visual direction:

- graphite/black
- dark green/emerald scientific accents
- subdued metallic gray
- small red/amber alert indicators
- professional typography
- restrained glow
- thin borders
- compact information density
- early-2000s enterprise software influence
- modern spacing and readability

Do NOT make it cyberpunk.

Do NOT make it neon gamer UI.

Do NOT use huge futuristic text.

---

# 5. WINDOW MANAGER — NON-NEGOTIABLE

Every application is a true desktop window.

Double click an application icon:

```text
icon
  ↓
double click
  ↓
new application window
```

Each window must support:

- drag
- resize
- minimize
- maximize
- restore
- close
- focus
- z-index
- active/inactive visual state
- independent scroll
- window snapping where practical
- keyboard accessibility
- content overflow management

Window model:

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

The desktop should behave like a real windowing system rather than routing the browser to `/genome-analyzer`.

---

# 6. EVERY WINDOW MUST HANDLE CONTENT PROPERLY

This is extremely important.

Never allow long scientific tables, logs, JSON, sequence output or reports to push the window outside the viewport.

Each window should have:

```text
Window
├── Title Bar
├── Toolbar / App Header
├── Scrollable Content Region
└── Optional Status Bar
```

The content region should be:

```css
overflow: auto;
min-height: 0;
```

Use nested scrolling intentionally.

Long tables:

- horizontal scrolling if necessary
- sticky headers
- virtualized rows for large result sets

Long reports:

- vertical scrolling

Terminal:

- independent scrollback

Sequence viewer:

- horizontal sequence scrolling

Charts:

- responsive containers

Do not solve overflow by shrinking fonts into unreadable sizes.

---

# 7. HOVER TEXT / TOOLTIP SYSTEM

Every icon-only interaction must have explanatory hover text.

Examples:

```text
×
```

→ “Close window”

```text
□
```

→ “Maximize”

```text
—
```

→ “Minimize”

```text
🧬
```

→ “Open Genome Analyzer”

```text
?
```

→ “Show scientific methodology”
```

Tooltips must:

- appear after a short delay
- remain inside viewport
- support keyboard focus
- never obscure critical controls
- use consistent styling

Do not rely only on tooltips where the action is critical; important controls should also have visible labels.

---

# 8. BACKEND ARCHITECTURE

Use a dedicated Python backend:

### FastAPI

Recommended structure:

```text
backend/
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── genomes.py
│   │   ├── mutations.py
│   │   ├── amr.py
│   │   ├── qc.py
│   │   ├── pathogens.py
│   │   ├── radiation.py
│   │   ├── samples.py
│   │   ├── models.py
│   │   ├── forge.py
│   │   └── vella.py
│   │
│   ├── services/
│   ├── pipelines/
│   ├── models/
│   ├── repositories/
│   ├── schemas/
│   ├── workers/
│   └── security/
│
├── tests/
└── scripts/
```

---

# 9. DATABASE

Use PostgreSQL.

Prefer:

- PostgreSQL
- pgvector where embeddings are genuinely useful
- SQLAlchemy 2
- Alembic migrations

Core database entities:

```text
users
sessions
apps
app_versions
app_permissions
projects

genomes
genome_metadata
phenotypes
annotations
mutations

samples
sample_runs
qc_results

models
model_versions
training_runs
predictions

experiments
reports
evidence
provenance

datasets
dataset_versions
dataset_files
artifacts
```

Every scientific result must be traceable.

---

# 10. SCIENTIFIC DATA LAKE

Do not store 120 GB of FASTA inside PostgreSQL.

PostgreSQL stores metadata.

Large scientific artifacts live in:

```text
data/
├── raw/
├── derived/
├── annotations/
├── features/
├── models/
├── indexes/
├── reports/
└── manifests/
```

Use object storage later if required.

During development, local storage is acceptable.

Create:

```text
dataset_manifest.json
```

for every dataset.

At minimum:

```json
{
  "dataset_id": "",
  "source": "",
  "version": "",
  "downloaded_at": "",
  "file_count": 0,
  "bytes": 0,
  "sha256": "",
  "license": "",
  "schema": "",
  "notes": ""
}
```

Raw data is read-only.

Never modify downloaded FASTA files in place.

---

# 11. THE BACTERIAL / AMR DATA PIPELINE

This is the primary dataset workflow for **Genome Analyzer / AMR Sentinel**.

The Data Sourcing Guide explicitly defines a normalized observation as one genome-antibiotic observation containing genome identity, sequence, antibiotic, laboratory method, raw measurement, testing standard and phenotype. Preserve that structure.

Recommended sources:

### Primary

BV-BRC

Use:

- genome metadata
- genome sequences
- genome_amr laboratory results
- MIC measurements where available

### AMR annotation

NCBI AMRFinderPlus

Use:

- AMR genes
- resistance-associated point mutations
- curated reference database
- HMM evidence

### Cross-check

ResFinder

### Optional harmonization

cAMRah

### Optional scaling/indexing

XTree

### Optional deep learning

HyenaDNA / DNABERT-2

Do not train a foundation model from scratch during the hackathon.

---

# 12. DATA ACQUISITION ENGINE

Build a proper CLI:

```bash
umbrella data init
umbrella data manifest
umbrella data download
umbrella data verify
umbrella data normalize
umbrella data annotate
umbrella data features
umbrella data benchmark
```

Example:

```bash
umbrella data download --source bvbrc --manifest data/manifests/bvbrc.json
```

The downloader must:

- support resume
- retry failures
- record errors
- log transferred bytes
- calculate hashes where possible
- preserve source IDs
- avoid duplicate downloads
- never silently overwrite raw files

The organizer-pinned benchmark must have its own immutable manifest.

Do NOT blindly download every genome available on BV-BRC.

Build the manifest first.

---

# 13. 120 GB DATA REQUIREMENT

Treat “120 GB” as a **data lake target**, not automatically as an AMRFinderPlus database.

The data guide explicitly separates:

```text
raw genomes
annotations
indexes
benchmark tables
model artifacts
```

into different storage classes.

Before downloading:

1. Check free disk space.
2. Calculate projected storage.
3. Check WSL filesystem capacity.
4. Check whether the target corpus is authorized.
5. Verify license/source.
6. Create a manifest.
7. Start with a deterministic benchmark slice.
8. Make the complete corpus download resumable.

If there is not enough disk space:

DO NOT silently start filling the drive.

Instead tell me:

```text
Required:
~X GB

Available:
~Y GB

Shortfall:
~Z GB
```

Then build the data pipeline and download scripts without claiming the complete corpus is installed.

---

# 14. MODEL TRAINING PIPELINE

Do not jump directly into deep learning.

First build the baseline.

Training pipeline:

```text
Genome
 ↓
QC
 ↓
AMRFinderPlus
 ↓
Feature Extraction
 ↓
Phenotype Join
 ↓
Leakage-safe split
 ↓
Per-antibiotic model
 ↓
Calibration
 ↓
Evaluation
 ↓
Model Registry
```

Primary baseline:

## Regularized Logistic Regression

One classifier per antibiotic.

Features can include:

```text
AMR gene presence
known resistance-associated mutation presence
marker counts
antibiotic class indicators
carefully selected metadata
```

Do not train on a phenotype prediction field.

Laboratory phenotype is ground truth.

AMRFinderPlus predictions are features/evidence, not ground truth.

---

# 15. FEATURE STORE

Create sparse feature matrices.

Example:

```text
genome_id
antibiotic
blaTEM
blaNDM
blaKPC
tetM
ermB
gyrA_D87G
parC_S80I
marker_count_beta_lactam
marker_count_total
```

For each feature:

```text
feature_id
feature_name
feature_type
source_tool
source_version
database_version
created_at
```

---

# 16. LABEL HANDLING

Preserve:

```text
measurement_value
measurement_sign
measurement_unit
phenotype
testing_standard
testing_standard_year
laboratory_method
```

Do not convert:

```text
<0.25
```

into:

```text
0.25
```

unless the scientific method explicitly calls for a censor-aware transformation.

If categorical phenotype is supplied directly from laboratory testing, use it as the classification target.

For MIC tasks, support a separate regression branch.

---

# 17. LEAKAGE CONTROL

Before training:

- deduplicate genomes
- detect identical/near-identical genomes
- prevent related isolates leaking across evaluation sets where inappropriate
- use organizer-defined split when provided
- record split policy
- never train on official test labels
- never use external model predictions as replacement ground truth

Evaluation:

```text
AUROC
AUPRC
precision
recall
sensitivity
specificity
Brier score
calibration
confusion matrix
```

For MIC regression:

```text
MAE
RMSE
censor-aware metrics where appropriate
```

Every training run produces:

```text
training_run.json
metrics.json
model.joblib
feature_schema.json
```

---

# 18. MODEL REGISTRY

Create:

```text
models/
├── amr/
│   ├── ciprofloxacin/
│   ├── meropenem/
│   ├── tetracycline/
│   └── ...
│
└── embeddings/
```

Every model:

```text
model_id
model_version
dataset_manifest_id
feature_set_id
training_config
algorithm
created_at
metrics
calibrator
```

The prediction API must return the model version.

---

# 19. TRUST / CONFIDENCE

Do NOT call a model probability “scientific truth.”

A result should expose at least:

```text
Prediction
Model probability
Calibration state
Evidence count
Evidence sources
Model version
Training dataset
Assumptions
```

For example:

```text
MODEL OUTPUT

Likely Resistant

Probability:
0.91

Confidence:
HIGH

Evidence:
3 AMRFinderPlus markers
1 resistance-associated mutation
184 supporting training observations

Model:
ciprofloxacin-v3
```

Every important scientific result needs:

# WHY / EVIDENCE

The Data Sourcing Guide explicitly requires this provenance UX.

---

# 20. APP 1 — GENOME ANALYZER

This is the primary bacterial dataset application.

## Purpose

Load a genome and provide a unified computational summary.

Input:

- FASTA
- FNA
- selected stored genome

Output:

```text
Genome length
GC %
Contig count
Ambiguous bases
Taxonomy
QC status
AMR annotations
Mutation summary
Model predictions
```

Backend:

```text
POST /genomes/upload
POST /genomes/analyze
GET /genomes/{id}
GET /genomes/{id}/annotations
GET /genomes/{id}/predictions
GET /genomes/{id}/evidence
```

Processing:

```text
Upload
 ↓
Checksum
 ↓
FASTA parser
 ↓
QC
 ↓
AMRFinderPlus
 ↓
Feature extraction
 ↓
Prediction service
 ↓
Evidence assembly
```

Database tables:

```text
genomes
genome_metadata
qc_results
annotations
predictions
provenance
```

Dataset:

BV-BRC + organizer benchmark.

Model:

per-antibiotic regularized logistic regression.

Optional:

tree-based comparison.

Optional:

pretrained DNA embeddings.

Primary hackathon model should remain CPU-friendly.

---

# 21. APP 2 — MUTATION LAB

This is not a wet-lab genetic engineering tool.

It is a **sequence comparison and mutation analysis environment**.

## Purpose

Compare:

```text
Reference
vs
Sample
```

and identify:

- substitutions
- insertions
- deletions
- mutation positions
- local sequence context
- mutation counts
- clustered changes

Backend:

```text
POST /mutations/compare
POST /mutations/batch
GET /mutations/{run_id}
GET /mutations/{run_id}/regions
```

Core computation:

- sequence alignment
- reference mapping
- variant extraction
- coordinate normalization

Potential tools:

- minimap2
- samtools/pysam where appropriate
- Biopython
- custom C++ sequence routines for performance-critical paths

Database:

```text
mutation_runs
mutation_events
mutation_regions
reference_sequences
sample_sequences
```

Dataset:

- organizer genomes
- BV-BRC genomes
- public reference genomes
- known public variant callsets where license and provenance are explicit

Model:

Do NOT force an artificial mutation-design model.

For the initial version, mutation detection is deterministic.

Optional ML:

Train an anomaly detector over naturally observed variant distributions to flag unusual sequence-pattern observations.

The system must not generate instructions for creating or optimizing harmful organisms, increasing resistance, or increasing virulence.

The output is descriptive:

```text
Observed mutation
Coordinates
Sequence context
Known annotation if available
Evidence
```

not:

```text
How to modify the organism
```

---

# 22. APP 3 — AMR SENTINEL

This is the application that directly evolves Genome Firewall.

## Purpose

Determine whether genomic evidence contains known antimicrobial-resistance signals and compare those signals with laboratory outcomes.

Pipeline:

```text
FASTA
 ↓
AMRFinderPlus
 ↓
AMR annotations
 ↓
ResFinder cross-check
 ↓
Feature builder
 ↓
Per-antibiotic model
 ↓
Calibrated prediction
 ↓
Evidence report
```

Backend:

```text
POST /amr/analyze
GET /amr/{genome_id}
GET /amr/{genome_id}/markers
GET /amr/{genome_id}/predictions
GET /amr/{genome_id}/evidence
```

Database:

```text
amr_annotations
amr_markers
amr_mutations
amr_predictions
amr_tool_runs
```

Data:

- organizer bacterial benchmark
- BV-BRC
- AMRFinderPlus
- ResFinder

Optional:

cAMRah comparison.

UI:

```text
AMR SENTINEL

Sample #1827

Detected markers
────────────────
blaNDM
tetM
ermB

Predicted phenotype
────────────────
Meropenem: likely resistant
Tetracycline: likely resistant

WHY?

[View gene evidence]
[View laboratory evidence]
[View model]
[View benchmark]
```

Never present model outputs as a medical prescribing recommendation.

This is computational research/decision support.

---

# 23. APP 4 — SEQUENCE QC

## Purpose

A dedicated quality-control workstation.

This prevents the Genome Analyzer from becoming overloaded.

Input:

- FASTA
- FASTQ where supported
- batch directory

Outputs:

```text
Sequence count
Length distribution
GC distribution
N-content
Ambiguous bases
Duplicate sequences
Contig statistics
Outlier detection
QC PASS/WARN/FAIL
```

Backend:

```text
POST /qc/run
GET /qc/{run_id}
GET /qc/{run_id}/summary
GET /qc/{run_id}/outliers
```

Database:

```text
qc_runs
qc_metrics
qc_flags
qc_outliers
```

Dataset:

Use public/reference genomes to establish normal distributions.

Generate controlled synthetic corruption for QA training:

- random Ns
- fragmentation
- truncated sequences
- duplicated sequences
- abnormal length distributions

Do not pretend synthetic corruption is real biology.

Model:

LightGBM/XGBoost or logistic classifier predicting:

```text
PASS
WARN
FAIL
```

based on sequence-quality statistics.

A deterministic threshold engine should remain the primary authority.

ML is only an assistive layer.

---

# 24. APP 5 — PATHOGEN ATLAS

## Purpose

Create a browsable computational atlas of organisms and genomes.

This should allow:

```text
Bacteria
Fungi
Viruses
```

as broad scientific categories.

For the hackathon, keep this primarily as taxonomy/sequence intelligence and not a biological experimentation engine.

Views:

```text
Organism
Taxonomy
Genome count
Sequence statistics
Available annotations
Available AMR information
Available reference material
```

Backend:

```text
GET /atlas/organisms
GET /atlas/taxonomy/{taxon_id}
GET /atlas/organism/{id}
GET /atlas/search
```

Database:

```text
organisms
taxa
genome_taxonomy
reference_sequences
atlas_sources
```

Datasets:

- NCBI RefSeq/reference sequence resources
- BV-BRC
- documented public taxonomy resources

Model:

Optional k-mer taxonomy classifier.

Training:

```text
reference genomes
 ↓
k-mer representation
 ↓
taxonomy labels
 ↓
train classifier
 ↓
holdout genomes
 ↓
evaluate
```

Use this to classify at broad levels:

```text
domain
phylum
class
order
family
genus
```

Do not claim species-level accuracy without validation.

Use the model as a research classification layer.

---

# 25. APP 6 — RADIATION LAB

This app is a computational simulation/education environment.

It should NOT be represented as a precise biological predictor.

## Purpose

Allow users to explore how different radiation classes are associated with different modeled DNA-damage patterns.

Interface:

```text
RADIATION LAB

Radiation:
[ X-ray ]

Model parameters:
Energy
Exposure scenario
LET class
Simulation mode

[RUN SIMULATION]
```

Output:

```text
MODELED RESPONSE

Base modification
████████

SSB signal
██████

DSB signal
███

Clustered damage
████
```

Use terms such as:

```text
MODELED
SIMULATED
ESTIMATED
REFERENCE-BASED
```

not:

```text
experimentally confirmed for this sample
```

Data:

Use curated scientific literature/reference tables for radiation class, LET categories and known qualitative damage patterns.

The supplied research document notes categories including SSBs, DSBs, base modifications and chromosomal aberrations, and describes high-LET radiation as tending toward dense/clustered DNA damage. Use the attached scientific references as the initial evidence base.

Backend:

```text
POST /radiation/simulate
GET /radiation/models
GET /radiation/scenarios
```

Database:

```text
radiation_types
simulation_models
simulation_runs
simulation_parameters
simulation_outputs
scientific_sources
```

Model:

For the hackathon, do NOT force deep ML.

Build a deterministic scientific scenario model.

Optional later:

train a surrogate model to approximate an explicitly defined computational simulation.

Every output must include:

```text
Model assumptions
Source references
Parameter assumptions
Model version
```

---

# 26. SCIENTIFIC SIMULATION ENGINE

Keep simulation separate from the UI.

```text
backend/
└── simulation/
    ├── radiation.py
    ├── sequence_stress.py
    ├── scoring.py
    └── provenance.py
```

The frontend never calculates scientific results itself.

The backend returns:

```json
{
  "simulation_id": "",
  "model_version": "",
  "inputs": {},
  "outputs": {},
  "assumptions": [],
  "sources": []
}
```

---

# 27. VELLA — SCIENTIFIC ORCHESTRATOR

Vella is the system-wide AI layer.

It should not be a chat page pretending to be an OS.

Example:

User:

> “Analyze sample 1827.”

Vella determines that it should:

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
Report Studio
```

Then returns a concise report.

Vella should have tools such as:

```text
open_app
open_sample
analyze_genome
run_qc
run_amr
compare_sequences
get_evidence
run_simulation
generate_report
create_app
```

Never expose every backend function blindly to the LLM.

Use a tool registry.

---

# 28. VELLA SECURITY

Vella must operate under permissions.

Example:

```text
READ_SAMPLE
READ_GENOME
RUN_ANALYSIS
RUN_SIMULATION
CREATE_REPORT
CREATE_APP
EXECUTE_CODE
```

Dangerous capabilities should require explicit approval.

No AI-generated application should automatically gain:

```text
filesystem access
network access
shell access
database write access
```

unless specifically granted.

---

# 29. UMBRELLA FORGE

This is one of the most important features.

User says:

> “Build me an app that compares two genomes and shows GC-content differences.”

Umbrella Forge performs:

```text
Intent extraction
 ↓
Requirements
 ↓
Application specification
 ↓
UI generation
 ↓
Logic generation
 ↓
Permission analysis
 ↓
Validation
 ↓
Sandbox
 ↓
Installation
```

The app then appears in the desktop.

---

# 30. DO NOT LET FORGE GENERATE ARBITRARY UNSANDBOXED CODE

Create a controlled Umbrella App SDK.

Example:

```text
App
├── Manifest
├── Permissions
├── UI schema
├── State schema
├── Actions
├── Data bindings
└── Version
```

Possible native components:

```text
Window
Panel
Table
Chart
SequenceViewer
MetricCard
Button
Input
Timeline
GenomeTrack
Heatmap
Markdown
Terminal
```

Generated apps compose these capabilities.

For advanced applications, generated TypeScript/React may be allowed inside a sandbox.

---

# 31. APPLICATION MANIFEST

Example:

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
  "entrypoint": "runtime"
}
```

Every application gets:

```text
id
name
version
permissions
dependencies
created_by
created_at
updated_at
```

---

# 32. INTER-APP COMMUNICATION

Applications should not directly reach into each other's database tables.

Use controlled capabilities.

Example:

```text
Genome Analyzer
      ↓
Genome Service
      ↓
Mutation Lab
```

or:

```text
AMR Sentinel
      ↓
Evidence Service
      ↓
Report Studio
```

This prevents the OS becoming a tightly coupled mess.

---

# 33. REPORT STUDIO

Create a report-generation system even if Report Studio is initially a secondary app.

A report should include:

```text
Sample
Source
Genome
Sequence statistics
Annotations
Mutations
Predictions
Model version
Evidence
Scientific assumptions
Timestamp
```

Export:

```text
PDF
Markdown
JSON
CSV
```

No generated report should silently omit uncertainty.

---

# 34. COMPUTE ENGINE

Use different languages for different responsibilities rather than forcing everything into TypeScript.

Recommended:

### TypeScript

Frontend + OS runtime + API client.

### Python

FastAPI + ML + orchestration + bioinformatics glue.

### C++

Genome Firewall-style high-performance sequence processing.

Reuse the engineering concepts from your previous Genome Firewall work:

- mmap/streaming
- parallel sequence processing
- Trie-based lookup
- Bloom filtering
- low-lock or lock-free counters
- deterministic processing

Your existing Genome Firewall already demonstrates those systems-level patterns.

### Rust

Optional performance/security tooling.

### WSL

For Linux-native scientific tools.

Do not introduce ten languages merely because they are available.

Every language must have a concrete reason.

---

# 35. COMMAND EXECUTION

Create a controlled runner:

```text
backend/workers/runner.py
```

Jobs look like:

```text
Job
├── job_id
├── command
├── arguments
├── working_directory
├── timeout
├── resource_limits
└── permissions
```

For example:

```text
AMRFinderPlus
Mutation alignment
QC pipeline
ML training
```

Never construct shell commands by direct string concatenation from user input.

Use structured argument lists.

---

# 36. ASYNC JOB SYSTEM

Scientific computation must not block FastAPI requests.

Use:

- Redis
- Celery or RQ

Architecture:

```text
Frontend
 ↓
FastAPI
 ↓
Redis Queue
 ↓
Worker
 ↓
Scientific Tool
 ↓
Artifact
 ↓
Database metadata
 ↓
Frontend
```

API response:

```json
{
  "job_id": "abc123",
  "status": "queued"
}
```

Then:

```text
GET /jobs/abc123
```

returns:

```text
queued
running
completed
failed
cancelled
```

---

# 37. OBSERVABILITY

Build system telemetry.

Track:

```text
Job duration
CPU
Memory
Queue time
Model inference time
AMRFinder runtime
FASTA parsing time
Database latency
API latency
Failures
```

Expose a System Monitor window.

Example:

```text
UMBRA CORE

Jobs
██████████ 12

CPU
██████░░░░ 61%

Memory
█████░░░░░ 52%

Active workers
4

Scientific jobs
3
```

---

# 38. TESTING

Create tests from the beginning.

Frontend:

- window manager tests
- app launch tests
- tooltip tests
- resize tests
- scroll behavior tests

Backend:

- API tests
- schema tests
- database tests
- provenance tests
- model loading tests

Scientific:

- known sequence fixtures
- AMRFinder output fixtures
- mutation alignment fixtures
- QC fixtures

ML:

- deterministic preprocessing
- train/test split tests
- feature schema tests
- model serialization tests
- calibration tests

---

# 39. DATA PROVENANCE

This is non-negotiable.

Every derived object has:

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

For every important prediction show:

# EVIDENCE

with:

```text
Source genome
Phenotype
Annotation
Tool version
Database version
Feature
Model
Assumptions
```

This is what makes Umbrella a scientific operating system instead of a collection of scripts.

---

# 40. DATA DIRECTORY

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
├── manifests/
│
├── derived/
│   ├── fasta_normalized/
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
├── models/
│
└── reports/
```

This structure is directly aligned with the project's data specification.

---

# 41. KIRO / DEVELOPMENT WORKFLOW

If Kiro-compatible `.kiro/` project configuration is being used, create:

```text
.kiro/
├── specs/
│   ├── desktop.md
│   ├── window-manager.md
│   ├── scientific-runtime.md
│   ├── genome-engine.md
│   ├── amr-sentinel.md
│   ├── mutation-lab.md
│   ├── sequence-qc.md
│   ├── pathogen-atlas.md
│   ├── radiation-lab.md
│   ├── vella.md
│   └── forge.md
│
├── steering/
│   ├── architecture.md
│   ├── scientific-integrity.md
│   ├── ui.md
│   ├── security.md
│   └── coding-standards.md
│
└── hooks/
    ├── test-on-change
    ├── lint
    ├── typecheck
    └── scientific-validation
```

Use specifications before implementation for substantial modules.

---

# 42. PHASED BUILD ORDER

## PHASE 0 — RECONNAISSANCE

Read all documents.

Create implementation manifest.

Create assumptions.

Ask blocking questions.

Duration:

~20 minutes.

---

## PHASE 1 — MONOREPO

Create:

```text
apps/
  web/

services/
  api/

packages/
  shared/
  runtime/

data/

infra/

scripts/
```

Set up:

- git
- TypeScript
- Python
- Docker Compose
- PostgreSQL
- Redis

---

## PHASE 2 — DESKTOP

Build:

- desktop
- app icons
- taskbar
- launcher
- windows
- drag
- resize
- minimize
- maximize
- restore
- focus
- scroll
- tooltips

Do NOT start scientific ML before the desktop feels like an OS.

---

## PHASE 3 — BACKEND CORE

Implement:

```text
health
jobs
datasets
genomes
samples
annotations
predictions
provenance
```

---

## PHASE 4 — DATA ENGINE

Implement:

```bash
umbrella data init
umbrella data manifest
umbrella data download
umbrella data verify
umbrella data normalize
```

Immediately make it work on a tiny deterministic dataset.

Then support scaling.

---

# 43. PHASE 5 — AMRFINDER PIPELINE

Install and version-pin AMRFinderPlus.

Run it against a known test FASTA.

Store:

```text
tool version
database version
input hash
output hash
```

Normalize results into PostgreSQL.

Do not manually copy the output into a spreadsheet.

---

# 44. PHASE 6 — FIRST MODEL

Train:

```text
one logistic-regression model
```

for at least one antibiotic.

Then expand.

Training script:

```bash
python -m ml.build_features
python -m ml.train --antibiotic ciprofloxacin
python -m ml.evaluate --model ciprofloxacin-v1
python -m ml.calibrate --model ciprofloxacin-v1
```

Store artifacts.

Expose inference API.

---

# 45. PHASE 7 — GENOME ANALYZER

Connect:

```text
Upload
 ↓
QC
 ↓
AMRFinderPlus
 ↓
Features
 ↓
Prediction
 ↓
Evidence
```

Only after this end-to-end workflow works should you polish the other apps.

---

# 46. PHASE 8 — MUTATION LAB

Build deterministic sequence comparison first.

Do not spend the sprint inventing a mutation-prediction neural network.

The important thing is:

```text
reference
sample
alignment
difference
evidence
```

---

# 47. PHASE 9 — SEQUENCE QC

Build:

- metrics
- plots
- QC status
- batch analysis

Then optional ML classification.

---

# 48. PHASE 10 — PATHOGEN ATLAS

Build:

- taxonomy browser
- search
- organism cards
- genome counts
- links to available annotations

Model comes later.

---

# 49. PHASE 11 — RADIATION LAB

Build:

- scenario selection
- modeled parameters
- simulation engine
- visualization
- assumptions
- references

Do not present estimates as experimental measurements.

---

# 50. PHASE 12 — VELLA

Only after backend tools work.

Create a tool registry.

Vella should be able to:

```text
open app
query data
run analysis
inspect evidence
generate report
create app
```

Example:

> “Open sample 1827 and check it.”

Vella executes:

```text
open Sample Vault
get sample
run QC
run Genome Analyzer
open result
```

---

# 51. PHASE 13 — FORGE

First generated application:

## Genome Comparator

User:

> “Build an app that compares two genomes and displays the differences and GC-content.”

Forge creates it.

This generated application becomes the proof that Umbrella OS is not a fixed application suite.

---

# 52. 18.5-HOUR HACKATHON PRIORITY

Do not try to complete the entire product during the sprint.

The judging MVP should be:

```text
DESKTOP
✓

WINDOW MANAGER
✓

GENOME ANALYZER
✓

AMR SENTINEL
✓

MUTATION LAB
✓

Vella
✓

Forge
✓
```

Sequence QC, Pathogen Atlas and Radiation Lab can initially be shallow but real.

The backend and scientific pipeline matter more than having dozens of empty applications.

---

# 53. DEMO SEQUENCE

Target:

3–5 minutes.

### STEP 1

Open Umbrella OS.

Show desktop.

Double-click:

# Genome Analyzer

A new window opens.

---

### STEP 2

Load a benchmark genome.

Show:

```text
QC
Genome stats
Taxonomy
```

---

### STEP 3

Open:

# AMR Sentinel

Show:

```text
Detected markers
Model prediction
Evidence
```

Click:

# WHY?

Show:

```text
Genome
Laboratory result
AMRFinderPlus evidence
Feature
Model version
```

---

### STEP 4

Open:

# Mutation Lab

Compare reference/sample.

Show:

```text
mutation locations
sequence context
mutation count
```

---

### STEP 5

Ask Vella:

> “Summarize this sample.”

Vella orchestrates the existing apps rather than making up a response from scratch.

---

### STEP 6

Ask:

> “There isn't an application that compares these two genomes side by side. Build one.”

Umbrella Forge executes:

```text
Specify
Build
Validate
Install
```

The application appears.

Double click.

It opens as another desktop window.

---

### STEP 7

Show the operating system itself.

Open System Monitor.

Show:

```text
Apps
Jobs
Models
Data
Workers
```

Final statement:

> “Umbrella doesn't just provide scientific tools. It provides the environment in which those tools can be created.”

---

# 54. SCIENTIFIC INTEGRITY RULES

These are mandatory.

Never fabricate:

- model accuracy
- dataset size
- scientific validation
- experimental results
- clinical claims
- resistance predictions not actually produced
- downloaded files
- benchmark results

Never call:

```text
model probability = scientific certainty
```

Never label a computational simulation as:

```text
experimental evidence
```

Never use generated model output as laboratory ground truth.

Keep:

```text
Observed
Annotated
Modeled
Predicted
Simulated
```

clearly separated.

---

# 55. BIOSECURITY / SAFETY BOUNDARY

Umbrella OS is a computational biology research platform.

Allowed functionality includes:

- sequence analysis
- genome comparison
- QC
- taxonomy
- AMR detection
- resistance surveillance
- mutation observation/annotation
- scientific simulation
- evidence visualization
- model evaluation

Do not implement functionality whose purpose is to provide actionable instructions for:

- increasing pathogen virulence
- increasing antimicrobial resistance
- creating harmful organisms
- optimizing biological agents for harmful effects
- wet-lab pathogen engineering
- evading biological detection or safety systems

For sequence-design functionality, keep the feature at the level of comparison, annotation and computational visualization.

---

# 56. ENGINEERING QUALITY BAR

Do not produce fake architecture.

If a feature isn't implemented:

```text
STATUS: NOT IMPLEMENTED
```

If a model is baseline:

```text
MODEL: LOGISTIC REGRESSION
```

If data is synthetic:

```text
DATA TYPE: SYNTHETIC / DEMONSTRATION
```

If a dataset is external:

```text
SOURCE: BV-BRC
```

If a scientific result is simulated:

```text
MODELED RESULT
```

This project should be auditable.

---

# 57. WHAT SUCCESS LOOKS LIKE

At the end of the build, I should be able to:

1. Launch Umbrella OS.
2. Double-click scientific applications.
3. Drag and resize windows.
4. Scroll independently inside every application.
5. Hover over unfamiliar controls and receive clear tooltips.
6. Load a bacterial genome.
7. Run sequence QC.
8. Run AMRFinderPlus.
9. Inspect AMR evidence.
10. Run the baseline model.
11. View calibrated prediction output.
12. Compare sequences in Mutation Lab.
13. Browse organisms in Pathogen Atlas.
14. Run a scientific radiation simulation.
15. Ask Vella to orchestrate several applications.
16. Tell Umbrella Forge to create an app.
17. Watch the new application install.
18. Open it as a native desktop window.
19. Inspect the data/model provenance.
20. See the system functioning end-to-end without fake screens.

---

# 58. FINAL IMPLEMENTATION PRINCIPLE

When deciding between:

```text
many impressive screens
```

and:

```text
one complete scientific workflow
```

choose:

# ONE COMPLETE SCIENTIFIC WORKFLOW.

A working pipeline:

```text
DATA
 ↓
QC
 ↓
ANNOTATION
 ↓
FEATURES
 ↓
MODEL
 ↓
EVIDENCE
 ↓
RESULT
 ↓
UI
```

is more important than ten disconnected demos.

The ultimate architecture should feel like:

```text
                    UMBRELLA OS
                         │
              ┌──────────┴──────────┐
              │        VELLA        │
              │ Scientific AI Layer │
              └──────────┬──────────┘
                         │
                ┌────────┴────────┐
                │ UMBRELLA CORE   │
                └────────┬────────┘
                         │
      ┌──────────────────┼──────────────────┐
      │                  │                  │
 DATA ENGINE        COMPUTE ENGINE      MODEL ENGINE
      │                  │                  │
      └──────────────────┼──────────────────┘
                         │
                   APP RUNTIME
                         │
     ┌────────┬──────────┼──────────┬──────────┐
     │        │          │          │          │
   GENOME   MUTATION    AMR        QC       ATLAS
   ANALYZER  LAB       SENTINEL             │
                                             │
                                        RADIATION
                                           LAB

                         │
                    UMBRELLA FORGE
                         │
                  GENERATED APPS
```

Do not finish by saying:

> “I built an AI biology dashboard.”

The thing being built is:

# UMBRELLA OS

**A programmable scientific operating environment.**

Start by reading everything.

Ask the blocking questions.

Then create the monorepo and architecture manifest.

Then implement the desktop/window system and backend skeleton.

Then make one complete bacterial workflow work end-to-end.

Then expand the applications.

Then Vella.

Then Forge.

And at every stage, leave behind real code, tests, manifests and artifacts—not placeholders pretending to be finished.