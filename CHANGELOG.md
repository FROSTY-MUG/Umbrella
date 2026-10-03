# Changelog

All notable changes to Umbrella OS are documented here.

Format: `[version] — date` followed by categorised changes.  
Status labels: `IMPLEMENTED` | `PARTIALLY IMPLEMENTED` | `BLOCKED` | `NOT IMPLEMENTED`

---

## [Unreleased] — active development

Changes in progress but not yet in a tagged release.

### In Progress
- Full AMR model panel — 30+ antibiotics (blocked on real BV-BRC data acquisition)
- WSL2 + AMRFinderPlus binary integration (blocked on WSL2 installation)
- Celery async job worker (`services/workers/`)
- MinIO FASTA object storage integration
- TanStack Query + Zod frontend hardening

---

## [0.1.0] — 2026-10-04

Initial full scaffold with working desktop shell, FastAPI backend, SQLite fallback, and 4 synthetic baseline AMR models.

### Added

**Desktop OS Shell — `IMPLEMENTED`**
- Next.js 15 / React 19 browser desktop operating system
- Full window manager: drag, 8-direction resize, minimize, maximize, cascade positioning, focus z-index stack
- Single-instance window enforcement (re-focuses existing window instead of opening duplicate)
- Viewport boundary clamping during drag and resize
- Taskbar with live clock, window tabs, Vella and Forge quick-launch shortcuts
- App launcher overlay with all registered apps
- Desktop icon grid with app shortcuts
- Keyboard shortcuts: Escape (close launcher), Alt+F4 (close focused window)

**17 Native Application UIs — `IMPLEMENTED` (UI layer)**
- Genome Analyzer — FASTA upload, QC stats, contig browser, cross-app sample passing
- AMR Sentinel — antibiotic tabs, ML prediction card, calibrated probability, evidence dossier, WHY? modal
- Sequence QC — QC report viewer, PASS/WARN/FAIL badges, metric breakdown
- Mutation Lab — pairwise sample diff, SNP list, variant viewer
- Sample Vault — sample registry, CRUD, FASTA management
- Pathogen Atlas — taxonomy browser, organism classification
- Variant Explorer — UI complete; clustering/UMAP backend not yet wired
- Radiation Lab — 6 radiation types, simulation parameter controls, yield display
- Science Lab — general simulation workspace
- Research Desk — UI complete; pgvector RAG pipeline not yet wired
- Analysis Studio — UI complete; DuckDB/Parquet analytics not yet wired
- Bio Terminal — UI complete; WSL2 subprocess execution not yet wired
- Report Studio — UI complete; PDF export engine not yet implemented
- Umbrella Forge — intent input, compilation progress, install + launch flow
- Vella — chat interface, response streaming, desktop action dispatch
- System Monitor — CPU/memory display, model registry status
- Generated Forge App View — dynamic renderer for Forge-compiled apps

**FastAPI Scientific Backend — `IMPLEMENTED`**
- All major endpoints: samples CRUD, AMR findings, ML prediction, mutation compare, radiation simulation, taxonomy atlas, Vella chat, Forge generate/install, system status
- Startup seed data: 3 reference bacterial isolates (E. coli SMP-1827, K. pneumoniae SMP-1828, S. aureus SMP-1829)
- PostgreSQL (pgvector) primary database with auto-SQLite fallback
- CORS middleware (wide-open for development)

**Bio Core — `IMPLEMENTED`**
- Streaming FASTA parser with SHA-256 integrity hashing
- QC engine: N50, GC fraction, contig count, ambiguous base fraction, PASS/WARN/FAIL thresholds
- Pairwise variant calling and SNP detection
- Biophysical DNA damage simulation — 6 radiation types (alpha, beta, gamma, X-ray, neutron, UV)
- All simulation outputs labeled `SIMULATED` / `MODELED`

**ML Pipeline — `PARTIALLY IMPLEMENTED`**
- Feature extractor: 35 canonical AMR binary markers + 3 QC covariates
- L2-regularized Logistic Regression + Platt calibration (CalibratedClassifierCV, 5-fold)
- OOD detection: IN_DOMAIN / LOW_COVERAGE / OUT_OF_DISTRIBUTION
- Evidence dossier: top contributing features with signed weights
- Confidence bands: HIGH (>0.85) / MED (0.65–0.85) / LOW (<0.65)
- 4 trained baseline models:
  - Ciprofloxacin v1.0.0 — ROC-AUC 0.9064 (synthetic data)
  - Meropenem v1.0.0 (synthetic data)
  - Tetracycline v1.0.0 (synthetic data)
  - Gentamicin v1.0.0 (synthetic data)
- **⚠️ All models trained on synthetically generated data — not real laboratory phenotypes**

**Vella AI Orchestrator — `IMPLEMENTED`**
- Multi-provider abstraction: Gemini (primary) → OpenRouter (fallback) → deterministic local (offline)
- Intent classification with 0.75 confidence threshold
- Desktop action dispatch: `open_app`, `analyze_sample`, `query_science`, `forge_compile`
- Works fully offline without any API key

**Umbrella Forge — `IMPLEMENTED`**
- Natural-language intent → Application Spec DSL
- Archetype matching: data_viewer, chart, comparator, calculator, pipeline
- AppManifestRecord persistence to DB
- Dynamic app registration in Zustand store at runtime
- Forge-compiled apps open as live OS windows

**Infrastructure — `IMPLEMENTED`**
- Docker Compose: PostgreSQL 16 + pgvector, Redis 7, MinIO
- PostgreSQL init SQL with full schema + indexes + pgvector extension
- SQLite automatic fallback (no Docker required)
- All health checks on Docker services

**Umbrella CLI — `PARTIALLY IMPLEMENTED`**
- `umbrella doctor` — system health audit (Python, Node, pnpm, WSL2, Docker, disk, data lake)
- `umbrella data init` — creates full data lake directory tree + initial manifest
- `umbrella data manifest` — help text only, not implemented
- `umbrella data verify` — help text only, not implemented
- `umbrella qc` — help text only, not implemented

**Configuration — `IMPLEMENTED`**
- `config.yaml` — system config: storage paths, AMR pipeline versions, Vella providers, app registry
- `.env.example` — all environment variables with documented defaults
- `pydantic-settings` config class in `services/api/config.py`

**Packages Installed (Python)**
- biopython 1.88 (NEW — was missing)
- duckdb 1.5.6 (NEW — was missing)
- minio 7.2.20 (NEW — was missing)
- alembic 1.20.0 (NEW — was missing)
- asyncpg 0.31.0 (NEW — was missing)
- lightgbm 4.7.0 (NEW — required for second model tier)
- xgboost 3.4.1 (NEW — required for second model tier)

### Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| `packages/` directory missing — pnpm workspace error | High | Fixed in setup (create manually) |
| CORS `allow_origins=["*"]` — wide open | High | Accepted for dev; block in v0.2 |
| No authentication on any endpoint | High | Not yet implemented |
| AMR findings seeded/mocked, AMRFinderPlus not called | High | Blocked on WSL2 |
| All ML models on synthetic data | High | Blocked on BV-BRC data download |
| Redis/Celery worker not implemented | Medium | Planned v0.2 |
| MinIO not integrated in code paths | Medium | Planned v0.2 |
| No Alembic migrations (tables created via create_all) | Medium | Planned v0.3 |
| TanStack Query not added to frontend | Medium | Planned v0.2 |
| Zod validation not added to frontend | Medium | Planned v0.2 |
| Window snapping not implemented | Low | Planned v0.6 |
| No pytest or Vitest test suites | High | Planned v0.4 |
| WSL2 not installed on host machine | Blocking | Requires manual user action |
| Docker not installed on host machine | Blocking | Requires manual user action |
| Seed data uses synthetic FASTA sequences | Medium | Replaced in v0.3 with real isolates |

---

## Roadmap

### v0.2 — Bug Fixes + Frontend Hardening

- [ ] Add TanStack Query for all backend data fetching
- [ ] Add Zod schemas for all API request payloads
- [ ] Scope CORS to `http://localhost:3000` only
- [ ] Fix `pnpm-workspace.yaml` — document `packages/` creation in setup
- [ ] Wire async Celery job queue (Redis already in Docker Compose)
- [ ] Integrate MinIO for FASTA file storage (replace local disk writes)
- [ ] Add `umbrella data manifest` and `umbrella data verify` CLI implementations
- [ ] Add `umbrella qc` CLI implementation
- [ ] Improve System Monitor with real psutil metrics via WebSocket
- [ ] Add window focus indicator (visual border highlight on active window)
- [ ] Fix seed data: replace synthetic sequences with real BV-BRC reference isolates

### v0.3 — Real Data + AMR Integration

- [ ] Implement `umbrella data download` — BV-BRC genome + phenotype acquisition (resumable)
- [ ] Implement `umbrella data normalize` — standardise TSV phenotype records
- [ ] Implement `umbrella data annotate` — run AMRFinderPlus per genome
- [ ] Wire AMRFinderPlus binary call in Celery worker
- [ ] Wire ResFinder cross-check
- [ ] Build real feature extraction pipeline from AMRFinderPlus TSV output
- [ ] Replace synthetic seed data with 3 real BV-BRC reference isolates with real FASTA
- [ ] Move DATA_ROOT configuration to D: drive for large dataset storage

### v0.4 — Test Coverage

- [ ] Add pytest suite for backend:
  - FASTA parser + QC engine
  - AMR feature extraction
  - ML inference (mock model)
  - All API endpoints (TestClient)
- [ ] Add Vitest suite for frontend:
  - Window manager store (open/close/minimize/maximize/cascade)
  - WindowFrame drag and resize logic
  - Taskbar rendering
- [ ] Set up GitHub Actions CI pipeline

### v0.5 — ML Upgrade (Real Data Required)

- [ ] Train full 30+ antibiotic model panel on real BV-BRC phenotype data
- [ ] Add LightGBM model per antibiotic (compare vs. logistic regression)
- [ ] Add XGBoost model per antibiotic
- [ ] Select best model per antibiotic by ROC-AUC — store in registry
- [ ] Add k-mer feature model
- [ ] Implement `umbrella data features` — build feature matrices (Parquet)
- [ ] Implement `umbrella data benchmark` — run held-out evaluation
- [ ] Mark any antibiotic with insufficient labels as NOT IMPLEMENTED (no synthetic fill)

### v0.6 — Advanced Feature Completion

- [ ] ResearchDesk RAG pipeline — pgvector + embedding + literature retrieval
- [ ] AnalysisStudio DuckDB/Parquet analytics — full query + chart rendering
- [ ] BioTerminal WSL2 subprocess execution — stream stdout/stderr via SSE
- [ ] Report Studio PDF export — structured report generation
- [ ] Variant Explorer clustering and UMAP projection backend
- [ ] Window snapping (snap to edges and halves)
- [ ] Full keyboard shortcut set (Ctrl+W, Ctrl+Tab, etc.)
- [ ] Zustand DevTools integration for debugging

### v1.0 — Production Readiness

- [ ] Authentication and session management (JWT or session tokens)
- [ ] CORS scoped to specific allowed origins
- [ ] Alembic database migrations (replace create_all)
- [ ] DNA foundation model adapters (HyenaDNA / DNABERT-2)
- [ ] pgvector DNA embedding store
- [ ] Rate limiting on API endpoints
- [ ] Structured logging (structlog or loguru)
- [ ] Full audit trail population
- [ ] Sample provenance chain complete
- [ ] HTTPS configuration
- [ ] C++ core engine for hot-path acceleration (biophysical simulation)
