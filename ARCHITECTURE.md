# Umbrella OS — Architecture

Umbrella OS is a browser-based desktop operating system for computational biology. This document describes how all layers connect, how data flows through the system, and the design decisions behind each component.

---

## Table of Contents

- [System Overview](#system-overview)
- [Layer Diagram](#layer-diagram)
- [Frontend — Desktop Shell](#frontend--desktop-shell)
- [Window Manager](#window-manager)
- [Backend — Scientific API](#backend--scientific-api)
- [Database Layer](#database-layer)
- [Bio Core](#bio-core)
- [ML Pipeline](#ml-pipeline)
- [Vella — AI Orchestrator](#vella--ai-orchestrator)
- [Umbrella Forge](#umbrella-forge)
- [Infrastructure](#infrastructure)
- [Data Flow: Sample Lifecycle](#data-flow-sample-lifecycle)
- [Data Flow: ML Prediction](#data-flow-ml-prediction)
- [Data Flow: Vella Desktop Action](#data-flow-vella-desktop-action)
- [Planned Components (Not Yet Implemented)](#planned-components-not-yet-implemented)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js 15  Desktop Shell                   │  │
│  │   WindowFrame × N  │  Taskbar  │  Launcher  │  Icons    │  │
│  │                                                          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │  │
│  │  │  Genome  │ │   AMR    │ │  Vella   │ │  Umbrella │  │  │
│  │  │ Analyzer │ │Sentinel  │ │   Chat   │ │   Forge   │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │  │
│  │         … 13 more native applications …                  │  │
│  │                         │                                │  │
│  │              Zustand Window Manager                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │  HTTP  (localhost:8000)
┌───────────────────────────▼─────────────────────────────────────┐
│                    FastAPI Scientific API                       │
│                                                                 │
│  /api/samples      /api/amr        /api/predict                 │
│  /api/mutations    /api/radiation  /api/atlas                   │
│  /api/vella/chat   /api/forge      /api/system/status           │
│                         │                                       │
│   ┌─────────────────────┼─────────────────────────┐            │
│   │                     │                         │            │
│   ▼                     ▼                         ▼            │
│ core/bio/          ml/                    services/vella/       │
│ fasta_parser       features/extractor     orchestrator          │
│ alignment          registry/model_store   (Gemini/OpenRouter/   │
│ radiation_sim      training/trainer        local fallback)      │
│   │                     │                                       │
│   └─────────────────────┼─────────────────────────┘            │
│                         │                                       │
│              SQLAlchemy ORM                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
         ┌──────────────────┼───────────────────┐
         ▼                  ▼                   ▼
   PostgreSQL 16        Redis 7            MinIO
   + pgvector       (async job queue)  (FASTA object
   (primary DB)      [not yet wired]    storage)
                                       [not yet wired]
         │
    SQLite fallback
    (auto, no Docker)
```

---

## Frontend — Desktop Shell

### Entry point: `apps/desktop/app/page.tsx`

The root page component is the entire desktop. It:
- Reads all open windows from the Zustand store
- Renders a `<WindowFrame>` for each open window
- Injects the active app component as the window's content child
- Registers global keyboard shortcuts (Escape, Alt+F4)
- Renders the `<DesktopIconGrid>`, `<Taskbar>`, and `<Launcher>`

### Component tree

```
page.tsx
├── DesktopIconGrid          ← clickable app shortcuts on the desktop surface
├── WindowFrame × N          ← one per open window
│   ├── TitleBar             ← drag handle + window controls (min/max/close)
│   └── {AppComponent}       ← the active app renders inside here
├── Taskbar                  ← bottom bar: clock, open window tabs, shortcuts
└── Launcher                 ← overlay grid of all registered apps
```

### Styling system

CSS custom properties defined in `globals.css` provide the design token layer:

```css
--bg-primary: #0a0a0a          /* graphite desktop surface */
--bg-secondary: #111111        /* window chrome */
--accent-green: #00ff88        /* scientific emerald accent */
--accent-blue: #0088ff         /* interactive elements */
--text-primary: #f0f0f0
--text-muted: #666666
--border: rgba(255,255,255,0.08)
```

Tailwind utility classes are used for all layout and spacing. The `cn()` utility (`clsx` + `tailwind-merge`) is used for conditional class composition throughout.

---

## Window Manager

The window manager is a single Zustand store in `lib/store.ts`. It is the authoritative source of truth for all window state.

### State shape

```typescript
interface DesktopState {
  windows: WindowState[];        // all open windows
  apps: AppManifest[];           // registered app catalogue
  activeWindowId: string | null; // focused window
  isLauncherOpen: boolean;
}

interface WindowState {
  id: string;                    // unique per window instance
  appId: string;                 // which app is inside
  title: string;
  x: number; y: number;          // position (pixels from top-left)
  width: number; height: number; // current size
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;                // focus stack position
  props?: Record<string, unknown>; // passed to the app component
}
```

### Window lifecycle

```
openApp(appId)
  → if already open: focusWindow(existingId)  [single-instance enforcement]
  → else: generate id, cascade position (+32px offset from last window),
           push to windows[], set as activeWindowId

focusWindow(id)
  → set activeWindowId = id
  → increment all other windows' zIndex, set this one to max

minimizeWindow(id)
  → isMinimized = true  [window stays in windows[], visible in taskbar]

maximizeWindow(id)
  → isMaximized = !isMaximized  [toggle]
  → WindowFrame computes size as (100vw × 100vh − taskbar height) when maximized

closeWindow(id)
  → remove from windows[]
  → if was activeWindowId: focus the next highest zIndex window

updateWindowPos(id, x, y)    ← called by WindowFrame drag handler
updateWindowSize(id, w, h)   ← called by WindowFrame resize handler
```

### WindowFrame drag and resize

`WindowFrame.tsx` uses `mousedown` / `mousemove` / `mouseup` on `document` for drag and resize:

- **Drag:** triggered on title bar `mousedown`. Tracks `(startX, startY, startWindowX, startWindowY)` — computes delta on `mousemove`, clamps to viewport bounds.
- **Resize:** 8 directional handles (n, s, e, w, nw, ne, sw, se) positioned as absolutely-placed divs at the window edges. Each has a distinct `cursor` style. On `mousedown`, records initial size + position; `mousemove` applies the appropriate axis delta.
- Both modes clean up their `mousemove`/`mouseup` listeners on `mouseup`.

---

## Backend — Scientific API

### `services/api/main.py` — endpoint catalogue

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/samples/upload` | Upload FASTA, run QC, persist Sample record |
| GET | `/api/samples` | List all samples |
| GET | `/api/samples/{id}` | Get sample details + QC |
| GET | `/api/amr/{sample_id}` | Get AMR findings for a sample |
| POST | `/api/mutations/compare` | Pairwise variant calling between two samples |
| POST | `/api/predict` | ML resistance prediction (sample_id + antibiotic) |
| POST | `/api/radiation/simulate` | Biophysical DNA damage simulation |
| GET | `/api/atlas/organisms` | Taxonomy browser data |
| POST | `/api/vella/chat` | Send message to Vella AI orchestrator |
| POST | `/api/forge/generate` | Compile app spec from natural-language intent |
| POST | `/api/forge/install` | Register compiled app in OS app registry |
| GET | `/api/system/status` | System telemetry (CPU, memory, model registry) |
| GET | `/api/models` | List registered ML models |

### Startup sequence

On `@app.on_event("startup")`:
1. `init_db()` — runs SQLAlchemy `create_all()` against the active engine (Postgres or SQLite)
2. `seed_benchmark_data()` — if `Sample` table is empty, creates 3 reference isolates with synthetic FASTA sequences and corresponding `AmrFinding` records

---

## Database Layer

### `services/api/database.py` — auto-fallback engine

```python
# Tries PostgreSQL first
engine = create_engine(settings.DATABASE_URL)
engine.connect()   # test connection
# If this raises: falls back to SQLite
engine = create_engine(f"sqlite:///{settings.SQLITE_FALLBACK_PATH}")
```

### ORM models (`services/api/models.py`)

| Model | Purpose |
|-------|---------|
| `Sample` | Core genome record — sample_id, organism, assembly, QC data, sha256 |
| `AmrLab` | AMRFinderPlus run metadata — tool version, db version, run timestamp |
| `AmrFinding` | Individual AMR gene/mutation found in a sample |
| `AnalysisJob` | Async job tracker — status, type, input/output refs |
| `ModelRegistryEntry` | ML model metadata — antibiotic, version, artifact paths, metrics |
| `PredictionRecord` | Prediction result — sample, antibiotic, probability, OOD flag, evidence |
| `AppManifestRecord` | Forge-generated app records — spec DSL, install status |
| `AuditLogEntry` | Immutable audit trail for all significant operations |

### `infra/postgres/init.sql`

Defines all tables, indexes, and the `pgvector` extension for embedding storage. Run automatically by Docker Compose on first container start.

---

## Bio Core

### `core/bio/fasta_parser.py`

Streaming FASTA parser with full QC engine.

```python
run_sequence_qc(fasta_path, sample_id) → dict
```

Returns:
- `sha256` — file checksum
- `total_length` — total base pairs
- `contig_count`
- `gc_fraction`
- `n50` — N50 contig length
- `ambiguous_base_fraction`
- `qc_status` — `"PASS"` | `"WARN"` | `"FAIL"` based on thresholds
- `qc_flags` — list of specific flag strings

### `core/bio/alignment.py`

Pairwise variant calling between two FASTA sequences. Returns SNP list with position, reference allele, alternate allele, and annotation.

### `core/bio/radiation_sim.py`

Biophysical simulation of DNA damage from 6 radiation types:

| Type | Model |
|------|-------|
| Alpha | High-LET clustered damage |
| Beta | Low-LET sparse SSB |
| Gamma | Compton scatter, mixed SSB/DSB |
| X-ray | Similar to gamma, energy-dependent |
| Neutron | High-LET, recoil proton secondary |
| UV | Pyrimidine dimer induction |

All outputs are labeled `SIMULATED` / `MODELED` in API responses.

---

## ML Pipeline

### Feature extraction (`ml/features/extractor.py`)

Converts a list of `AmrFinding` ORM objects + QC data into a fixed-dimension feature vector.

35 canonical binary marker features (presence/absence of specific resistance genes and mutations):

```
has_blaNDM, has_blaKPC, has_blaOXA, has_blaVIM, has_blaIMP,
has_blaCTX-M, has_blaTEM, has_blaSHV,
has_mcr-1, has_mcr-2,
has_vanA, has_vanB,
has_mecA,
has_gyrA_S83L, has_gyrA_D87G, has_parC_S80I, has_parC_E84V,
has_qnrS, has_qnrB, has_qnrA,
has_aac(6'), has_aac(3),
has_ant(2''), has_aph(3'),
has_erm(A), has_erm(B), has_erm(C),
has_tet(A), has_tet(B), has_tet(M),
has_sul1, has_sul2,
has_dfrA1, has_dfrA12,
total_amr_marker_count    ← continuous feature
gc_fraction               ← QC covariate
contig_count              ← QC covariate
```

### Model training (`ml/training/train_baseline.py`)

For each antibiotic with sufficient labeled data:

1. Build feature matrix from `AmrFinding` records
2. Train L2-regularized Logistic Regression (`sklearn.linear_model.LogisticRegression`)
3. Wrap in `CalibratedClassifierCV` (Platt scaling, 5-fold CV) for calibrated probabilities
4. Evaluate on 20% held-out test set
5. Save versioned artifacts to `data/models/<antibiotic>/v<version>/`:
   - `model.joblib` — trained pipeline
   - `calibrator.joblib` — Platt calibration wrapper
   - `metrics.json` — ROC-AUC, PR-AUC, Brier score, F1, confusion matrix, top features
   - `schema.json` — feature names and types
   - `manifest.json` — antibiotic, version, training date, data source

**Planned second model:** LightGBM and XGBoost comparisons per antibiotic. Select the higher ROC-AUC model per antibiotic for production use.

### Model inference (`ml/registry/model_store.py`)

```python
predict_resistance(antibiotic, amr_findings, qc_data) → PredictionResponse
```

- Loads `calibrator.joblib` from disk on first call, caches in memory
- Runs `CalibratedClassifierCV.predict_proba()` → `[P(susceptible), P(resistant)]`
- Computes `confidence_band`: `HIGH` (>0.85), `MED` (0.65–0.85), `LOW` (<0.65)
- Computes `ood_flag`:
  - `IN_DOMAIN` — known markers present, good QC
  - `LOW_COVERAGE` — few markers detected
  - `OUT_OF_DISTRIBUTION` — unusual feature combination
- Assembles `evidence_refs` — top contributing features with signed weights

### Target antibiotic panel (full product)

The full panel targets 30+ antibiotics when real labeled data is available:

| Class | Antibiotics |
|-------|------------|
| Fluoroquinolones | Ciprofloxacin, Levofloxacin, Norfloxacin |
| Carbapenems | Meropenem, Imipenem, Ertapenem, Doripenem |
| Tetracyclines | Tetracycline, Doxycycline, Minocycline, Tigecycline |
| Aminoglycosides | Gentamicin, Tobramycin, Amikacin, Streptomycin |
| Penicillins | Amoxicillin, Ampicillin, Piperacillin, Amoxicillin-Clavulanate |
| Cephalosporins | Ceftriaxone, Cefepime, Ceftazidime, Cefotaxime |
| Macrolides | Azithromycin, Erythromycin, Clarithromycin |
| Glycopeptides | Vancomycin, Teicoplanin |
| Other | Rifampin, TMP-SMX, Chloramphenicol, Colistin, Linezolid, Nitrofurantoin |

Any antibiotic without sufficient real laboratory-linked rows is marked `NOT IMPLEMENTED` — no synthetic labels are used.

---

## Vella — AI Orchestrator

### `services/vella/orchestrator.py`

Multi-provider abstraction with three tiers:

```
Request
  ↓
Intent classifier (local, always runs first — never sends raw user input to AI)
  ↓
Intent dispatch
  ├── "open_app"        → desktop action spec (no AI call needed)
  ├── "analyze_sample"  → route to backend endpoint first, then summarise
  ├── "query_science"   → send to AI provider
  └── "forge_compile"   → route to Forge service
          ↓
  Provider selection (in order):
  1. Google Gemini (GEMINI_API_KEY set)
  2. OpenRouter (OPENROUTER_API_KEY set)
  3. Deterministic local fallback (always available, no key)
```

### Desktop action dispatch

Vella responses can include structured `desktop_actions` that the `VellaApp.tsx` frontend processes:

```json
{
  "text": "Opening Genome Analyzer for sample SMP-1827...",
  "desktop_actions": [
    { "action": "open_app", "app_id": "genome-analyzer", "props": { "sampleId": "SMP-1827" } }
  ]
}
```

The frontend `VellaApp.tsx` iterates these and calls `store.openApp(appId, props)` for each.

---

## Umbrella Forge

### `services/api/forge_service.py`

Converts natural-language intent into an Application Spec DSL and registers it in the OS.

**Pipeline:**

```
User intent (string)
  ↓
Intent classification → archetype match
  ↓
App Spec DSL generation (JSON):
  {
    "id": "forge-<uuid>",
    "name": "...",
    "description": "...",
    "archetype": "data_viewer | chart | comparator | calculator | pipeline",
    "layout": { ... },
    "data_sources": [ ... ],
    "ui_components": [ ... ]
  }
  ↓
Validation
  ↓
AppManifestRecord persisted to DB
  ↓
POST /api/forge/install → returns manifest
  ↓
Frontend: registerForgeApp(manifest) → Zustand store
  ↓
App appears in launcher + can be opened as a window
```

---

## Infrastructure

### Docker Compose (`infra/docker-compose.yml`)

```yaml
services:
  postgres:    # pgvector/pgvector:pg16 — port 5432
  redis:       # redis:7-alpine        — port 6379
  minio:       # minio/minio:latest    — ports 9000, 9001
```

All services have health checks. Data volumes are named (`postgres_data`, `redis_data`, `minio_data`) so they persist across `docker-compose down`.

### SQLite fallback

`services/api/database.py` auto-falls back to `data/umbrella_local.db` when Postgres is unreachable. The schema is identical — SQLAlchemy creates all tables on startup via `create_all()`. This mode works for all current functionality except pgvector similarity search (used by ResearchDesk RAG pipeline — not yet implemented).

---

## Data Flow: Sample Lifecycle

```
1. User drags FASTA file into Sample Vault or Genome Analyzer
   ↓
2. POST /api/samples/upload
   ├── compute_sha256(file_bytes)           ← integrity hash
   ├── write FASTA to data/raw/genomes/
   ├── run_sequence_qc(fasta_path)          ← N50, GC%, contigs, PASS/WARN/FAIL
   └── persist Sample(sample_id, organism, qc, sha256) to DB
   ↓
3. [FUTURE: Celery job] AMRFinderPlus binary called on FASTA
   ├── amrfinder --nucleotide <fasta> --output <tsv>
   └── AmrFinding records parsed from TSV and persisted
   (Currently: AmrFinding records come from seed data only)
   ↓
4. User opens AMR Sentinel, selects antibiotic
   ↓
5. POST /api/predict { sample_id, antibiotic }
   ├── load AmrFinding records for sample
   ├── extract_amr_features_from_findings()
   ├── predict_resistance(antibiotic, features)
   │   └── calibrator.predict_proba() → probability
   └── persist PredictionRecord, return PredictionResponse
   ↓
6. AMR Sentinel renders:
   ├── predicted_class (RESISTANT / SUSCEPTIBLE)
   ├── calibrated_probability (e.g. 0.87)
   ├── confidence_band (HIGH / MED / LOW)
   ├── ood_flag (IN_DOMAIN / LOW_COVERAGE / OUT_OF_DISTRIBUTION)
   └── evidence_refs (gene-level feature drivers)
```

---

## Data Flow: ML Prediction

```
AmrFinding records (DB) + QC dict
  ↓
extract_amr_features_from_findings()
  → { "has_blaNDM": 0, "has_gyrA_S83L": 1, ..., "total_amr_marker_count": 3, ... }
  ↓
model_store.predict_resistance(antibiotic, feature_dict)
  ├── load data/models/<antibiotic>/v1.0.0/calibrator.joblib  (cached after first load)
  ├── calibrator.predict_proba([feature_vector])
  │   → [[P(susceptible), P(resistant)]]
  ├── compute confidence_band from max probability
  ├── compute ood_flag from feature coverage + QC
  └── assemble evidence_refs from LogisticRegression coefficients
  ↓
PredictionResponse {
  antibiotic, predicted_class, calibrated_probability,
  confidence_band, ood_flag, evidence_refs, model_version
}
```

---

## Data Flow: Vella Desktop Action

```
User types: "Open the genome analyzer for sample SMP-1827"
  ↓
POST /api/vella/chat { message, session_id, context }
  ↓
orchestrator.process(message)
  ├── classify_intent(message) → { intent: "open_app", app_id: "genome-analyzer", ... }
  ├── intent.confidence >= 0.75 → route to deterministic handler (no AI call)
  └── return VellaResponse {
        text: "Opening Genome Analyzer for SMP-1827...",
        desktop_actions: [{ action: "open_app", app_id: "genome-analyzer",
                            props: { sampleId: "SMP-1827" } }]
      }
  ↓
VellaApp.tsx receives response
  ├── display response text in chat
  └── for each desktop_action:
        store.openApp(action.app_id, action.props)
          → WindowFrame appears with GenomeAnalyzerApp pre-loaded for SMP-1827
```

---

## Planned Components (Not Yet Implemented)

### Celery Worker (`services/workers/`)

Async job processor for long-running tasks:
- AMRFinderPlus binary execution
- Large FASTA QC jobs
- ML training jobs
- BV-BRC data download and normalisation

Connects to Redis queue. `AnalysisJob` records in DB track status (QUEUED → RUNNING → COMPLETE / FAILED).

### ResearchDesk RAG Pipeline

- Literature chunks embedded via Gemini embedding API
- Vectors stored in PostgreSQL pgvector (`embedding vector(768)` column)
- At query time: embed question → cosine similarity search → retrieve top-k chunks → Vella assembles grounded answer

### AnalysisStudio DuckDB Analytics

- User uploads Parquet files via drag-and-drop
- DuckDB in-process query engine runs SQL analytics
- Results render as interactive tables + charts in the Analysis Studio window

### BioTerminal WSL Execution

- User types bioinformatics commands in the terminal UI
- `services/api/main.py` relays to WSL2 subprocess via `subprocess.run(["wsl", "-e", ...])`
- Stdout/stderr streamed back via WebSocket or SSE

### Report Studio Export

- Collects analysis results from DB (QC, AMR findings, predictions)
- Renders structured PDF via a Python PDF library (reportlab or weasyprint)
- Returns downloadable file link
