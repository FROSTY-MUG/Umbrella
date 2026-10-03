# Umbrella OS

**AI-Native Computational Biology Operating System**

Umbrella OS is a full browser-based desktop operating system built for genomic research. It runs as a Next.js application that looks and behaves like a real OS — with draggable/resizable windows, a taskbar, a launcher, and 17 native scientific applications — backed by a FastAPI scientific computing engine, trained AMR resistance models, and Vella, an AI orchestrator with multi-provider fallback.

> This is not a typical web app. It is a programmable research environment that wraps bioinformatics tools, ML inference, and scientific workflows into a unified desktop experience.

---

## Table of Contents

- [What's Inside](#whats-inside)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start (SQLite mode — no Docker needed)](#quick-start-sqlite-mode--no-docker-needed)
- [Full Stack Start (with Docker)](#full-stack-start-with-docker)
- [Project Structure](#project-structure)
- [Native Applications](#native-applications)
- [ML Models](#ml-models)
- [Umbrella CLI](#umbrella-cli)
- [Environment Variables](#environment-variables)
- [Current State](#current-state)
- [Roadmap](#roadmap)
- [Documentation](#documentation)

---

## What's Inside

| Layer | What it does |
|-------|-------------|
| **Desktop Shell** | Full window manager (drag, resize, minimize, maximize, cascade, focus stack) running in Next.js 15 |
| **FastAPI Backend** | Typed scientific endpoints: FASTA upload, AMR analysis, ML prediction, variant calling, radiation simulation, Vella chat, Forge app compilation |
| **ML Pipeline** | L2-regularized logistic regression + Platt calibration for 4 antibiotics with OOD detection and evidence dossiers |
| **Vella** | AI orchestrator — Gemini (primary) → OpenRouter (fallback) → deterministic local (offline) |
| **Umbrella Forge** | Natural-language app compiler: turns intent into live sandboxed OS windows |
| **Bio Core** | Streaming FASTA parser, N50/GC%/contig QC, pairwise variant calling, biophysical radiation simulation |
| **Infra** | Docker Compose: PostgreSQL 16 + pgvector, Redis 7, MinIO — auto-falls back to SQLite if Docker is absent |

---

## Tech Stack

### Frontend (`apps/desktop/`)

| | |
|---|---|
| Framework | Next.js 15.1.7 |
| UI | React 19, TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 5.0.3 |
| Animation | Framer Motion 12.4 |
| Icons | Lucide React 0.475 |

### Backend (`services/api/`)

| | |
|---|---|
| Framework | FastAPI 0.115+ |
| Validation | Pydantic v2 |
| ORM | SQLAlchemy 2 |
| DB (primary) | PostgreSQL 16 + pgvector |
| DB (fallback) | SQLite (automatic) |
| Queue | Redis + Celery (installed, not yet wired) |
| Object storage | MinIO (configured, not yet wired) |
| Bio | Biopython, NumPy, SciPy, Pandas |
| ML | scikit-learn, joblib |
| AI | google-genai, httpx |

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Python | 3.10+ | Backend and CLI |
| Node.js | 18+ | Frontend |
| pnpm | 8+ | JS package manager (`npm i -g pnpm`) |
| Docker Desktop | Any recent | Optional — SQLite fallback works without it |
| WSL2 (Ubuntu 22.04) | — | Optional — required only for AMRFinderPlus integration |

---

## Quick Start (SQLite mode — no Docker needed)

This gets the full OS running locally with zero infrastructure dependencies.

```powershell
# 1. Clone (if not already done)
git clone https://github.com/FROSTY-MUG/Umbrella.git
cd Umbrella

# 2. Create the packages/ placeholder (pnpm workspace requires it)
New-Item -ItemType Directory -Path packages -Force

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Install JS dependencies
pnpm install

# 5. Initialise data lake directories
python umbrella.py data init

# 6. Copy environment config
Copy-Item .env.example .env
# Edit .env to add GEMINI_API_KEY if you want online Vella (optional)

# 7a. Start both services with one command
pnpm run dev:all

# 7b. Or start them separately (two terminals)
# Terminal 1:
python -m uvicorn services.api.main:app --reload --port 8000
# Terminal 2:
pnpm run dev
```

Open **http://localhost:3000** — the desktop loads with 3 seeded bacterial isolates ready to analyse.

---

## Full Stack Start (with Docker)

Runs PostgreSQL (with pgvector), Redis, and MinIO alongside the application.

```powershell
# 1. Copy and configure environment
Copy-Item .env.example .env

# 2. Start infrastructure
cd infra
docker-compose up -d
cd ..

# 3. Start backend
python -m uvicorn services.api.main:app --reload --port 8000

# 4. Start frontend (separate terminal)
pnpm run dev
```

MinIO console is available at **http://localhost:9001** (user: `umbrella_admin`, password in `.env`).

---

## Project Structure

```
Umbrella/
├── apps/
│   └── desktop/                    # Next.js 15 desktop OS shell
│       ├── app/                    # Root layout + page (desktop renderer)
│       ├── apps/                   # 17 native app components
│       ├── components/desktop/     # WindowFrame, Taskbar, Launcher, DesktopIconGrid
│       ├── components/ui/          # Shared UI primitives (Tooltip, etc.)
│       ├── lib/store.ts            # Zustand full window manager
│       └── types/desktop.ts        # WindowState, AppManifest, SampleRef types
│
├── services/
│   ├── api/                        # FastAPI scientific backend
│   │   ├── main.py                 # All endpoints + startup seed data
│   │   ├── models.py               # SQLAlchemy ORM models
│   │   ├── schemas.py              # Pydantic v2 schemas
│   │   ├── database.py             # PostgreSQL + SQLite fallback
│   │   ├── config.py               # pydantic-settings configuration
│   │   └── forge_service.py        # Umbrella Forge app compiler
│   └── vella/
│       └── orchestrator.py         # Vella AI multi-provider orchestrator
│
├── core/
│   └── bio/
│       ├── fasta_parser.py         # Streaming FASTA parser + QC engine
│       ├── alignment.py            # Pairwise variant / SNP detection
│       └── radiation_sim.py        # Biophysical DNA damage simulation
│
├── ml/
│   ├── features/extractor.py       # 35+ canonical AMR marker features
│   ├── registry/model_store.py     # Cached inference + OOD detection + evidence
│   └── training/train_baseline.py  # L2 LR + Platt calibration trainer
│
├── data/
│   └── models/                     # Trained model artifacts (versioned)
│       ├── ciprofloxacin/v1.0.0/   # model.joblib, calibrator.joblib, metrics.json
│       ├── meropenem/v1.0.0/
│       ├── tetracycline/v1.0.0/
│       └── gentamicin/v1.0.0/
│
├── infra/
│   ├── docker-compose.yml          # PostgreSQL (pgvector), Redis, MinIO
│   └── postgres/init.sql           # Full DB schema + indexes
│
├── packages/                       # Shared workspace packages (stubs — not yet built)
│
├── umbrella.py                     # CLI: doctor, data init, data manifest, qc
├── umbrella.bat                    # Windows wrapper for umbrella.py
├── config.yaml                     # System config: storage, AMR pipeline, Vella, apps
├── requirements.txt                # Python dependencies
├── package.json                    # Monorepo root (pnpm scripts)
└── pnpm-workspace.yaml             # Workspace: apps/* + packages/*
```

---

## Native Applications

| App | Category | Status |
|-----|----------|--------|
| **Genome Analyzer** | Core bio | UI complete, backend wired |
| **AMR Sentinel** | Antimicrobial resistance | UI complete, ML inference wired |
| **Sequence QC** | Quality control | UI complete, backend wired |
| **Mutation Lab** | Sequence diff | UI complete, variant calling wired |
| **Sample Vault** | Data registry | UI complete, CRUD wired |
| **Pathogen Atlas** | Taxonomy browser | UI complete, taxonomy endpoint wired |
| **Variant Explorer** | Genomics | UI complete, clustering/UMAP backend not yet implemented |
| **Radiation Lab** | Biophysical simulation | UI complete, simulation engine wired |
| **Science Lab** | Simulation | UI complete |
| **Research Desk** | RAG research | UI complete, pgvector pipeline not yet wired |
| **Analysis Studio** | Analytics / Parquet | UI complete, DuckDB import not yet wired |
| **Bio Terminal** | System terminal | UI complete, WSL subprocess not yet wired |
| **Report Studio** | PDF reporting | UI complete, export engine not yet implemented |
| **Umbrella Forge** | Meta app compiler | UI complete, compiler wired end-to-end |
| **Vella** | AI assistant | UI complete, multi-provider orchestrator wired |
| **System Monitor** | Telemetry | UI complete, psutil partially wired |
| **Generated Forge App View** | Dynamic Forge output | Renderer complete |

---

## ML Models

Four antibiotic resistance models are trained and ready in `data/models/`. The backend loads them at inference time — no re-training is needed to run the application.

| Antibiotic | ROC-AUC | PR-AUC | F1 | Top marker |
|------------|---------|--------|----|-----------|
| Ciprofloxacin | 0.9064 | 0.8846 | 0.9007 | parC_S80I |
| Meropenem | — | — | — | blaNDM |
| Tetracycline | — | — | — | tet(A) |
| Gentamicin | — | — | — | aac(6') |

> **Note:** Current models are trained on synthetically generated data that simulates biologically realistic resistance patterns. Metrics reflect synthetic benchmark performance. Models will be retrained on real BV-BRC phenotype data once the data acquisition pipeline is completed.

To retrain:
```bash
python -m ml.training.train_baseline
```

---

## Umbrella CLI

```powershell
# Check system health — Python, Node, pnpm, WSL2, Docker, disk, data lake
python umbrella.py doctor

# Initialise data lake directory structure
python umbrella.py data init

# Inspect dataset manifests
python umbrella.py data manifest

# Run FASTA QC
python umbrella.py qc --input path/to/genome.fna
```

On Windows, `umbrella.bat` wraps `umbrella.py` so you can call `umbrella doctor` directly.

---

## Environment Variables

Copy `.env.example` to `.env` and edit as needed.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Next.js frontend port |
| `API_PORT` | `8000` | FastAPI backend port |
| `DATABASE_URL` | postgres@localhost/umbrella_os | Full Postgres URL (omit to use SQLite fallback) |
| `SQLITE_FALLBACK_PATH` | `data/umbrella_local.db` | SQLite path when Postgres is unavailable |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `MINIO_ENDPOINT` | `localhost:9000` | MinIO S3 endpoint |
| `GEMINI_API_KEY` | *(empty)* | Google Gemini API key — enables online Vella |
| `OPENROUTER_API_KEY` | *(empty)* | OpenRouter fallback key |
| `AMRFINDER_PATH` | `amrfinder` | Path to AMRFinderPlus binary (WSL) |
| `DATA_ROOT` | `data` | Root of the scientific data lake |
| `MAX_UPLOAD_MB` | `2048` | Max FASTA upload size in MB |

---

## Current State

See [CHANGELOG.md](CHANGELOG.md) for a full versioned breakdown.

**Working today:**
- Browser desktop OS — window manager, 17 apps, taskbar, launcher
- FastAPI backend with all endpoints — auto-falls back to SQLite, no Docker required
- FASTA upload, QC (N50, GC%, contig stats), pairwise variant calling
- AMR feature extraction + ML resistance prediction with OOD detection
- Biophysical radiation simulation (6 radiation types)
- Vella AI with Gemini / OpenRouter / offline fallback
- Umbrella Forge app compiler (intent → spec → install → live window)
- 3 seeded benchmark isolates on first startup

**Known gaps (in priority order):**
1. `packages/` directory must be created manually (`New-Item -ItemType Directory packages`) — pnpm-workspace.yaml references it
2. No authentication — all API routes are public
3. CORS is wide-open (`allow_origins=["*"]`) — fine for local dev, must be locked before any deployment
4. AMRFinderPlus binary not yet called — AMR findings come from seed data
5. Redis/Celery worker not implemented — all processing is synchronous
6. ML models trained on synthetic data — real BV-BRC training data not yet acquired
7. No tests — no pytest suite, no Vitest suite

---

## Roadmap

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full prioritised progression sequence.

| Phase | Focus |
|-------|-------|
| **v0.1 (current)** | Core scaffold — desktop shell, all app UIs, FastAPI endpoints, SQLite fallback, trained baseline ML models |
| **v0.2** | Bug fixes + hardening — fix pnpm workspace, add TanStack Query + Zod to frontend, scope CORS, wire async jobs |
| **v0.3** | Real data + AMR integration — BV-BRC data download, AMRFinderPlus binary wired, Celery worker |
| **v0.4** | Test coverage — pytest backend, Vitest frontend, CI pipeline |
| **v0.5** | ML upgrade — real training data, LightGBM second model, k-mer features |
| **v0.6** | Advanced features — window snapping, ResearchDesk RAG, AnalysisStudio Parquet, Report Studio export |
| **v1.0** | Production readiness — auth, CORS scoping, pgvector embeddings, DNA foundation model adapters |

---

## Documentation

| Document | Contents |
|----------|----------|
| [DEVELOPMENT.md](DEVELOPMENT.md) | Local dev setup, debugging, code conventions, service scripts |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture, data flows, ML pipeline, window manager deep-dive |
| [CHANGELOG.md](CHANGELOG.md) | Version history and current state |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guide, progression priorities, bug fix sequence |
| [.agents/umbrella-investigation.md](.agents/umbrella-investigation.md) | Full automated codebase investigation report |

---

## Licence

Private — all rights reserved. See repository owner for access terms.
