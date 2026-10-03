# Umbrella OS — Development Guide

This document covers everything needed to work on Umbrella OS day-to-day: environment setup, running services, debugging, code conventions, and the current known issues that affect development.

---

## Table of Contents

- [One-Time Setup](#one-time-setup)
- [Running the Stack](#running-the-stack)
- [Environment Variables](#environment-variables)
- [Data Lake Setup](#data-lake-setup)
- [Python Backend](#python-backend)
- [Next.js Frontend](#nextjs-frontend)
- [ML Pipeline](#ml-pipeline)
- [Infrastructure (Docker)](#infrastructure-docker)
- [WSL2 & Bioinformatics Tools](#wsl2--bioinformatics-tools)
- [Code Conventions](#code-conventions)
- [Known Issues & Workarounds](#known-issues--workarounds)
- [Debugging Tips](#debugging-tips)

---

## One-Time Setup

### 1. Clone and enter the repo

```powershell
git clone https://github.com/FROSTY-MUG/Umbrella.git
cd Umbrella
```

### 2. Create the `packages/` workspace placeholder

`pnpm-workspace.yaml` references `packages/*` but the directory is not committed. Create it once:

```powershell
New-Item -ItemType Directory -Path packages -Force
```

### 3. Install Python dependencies

```powershell
pip install -r requirements.txt
```

Required additional packages not yet in `requirements.txt` (install until the file is updated):

```powershell
pip install "lightgbm>=4.5.0" "xgboost>=2.1.0"
```

### 4. Install JS dependencies

```powershell
pnpm install
```

### 5. Initialise the data lake

```powershell
python umbrella.py data init
```

This creates the `data/` directory tree: `raw/`, `derived/`, `manifests/`, `benchmark/`.

### 6. Configure environment

```powershell
Copy-Item .env.example .env
```

Minimum edits for local dev:
- Set `GEMINI_API_KEY` if you want online Vella (optional — offline fallback works without it)
- If you have D: drive with more space, set `DATA_ROOT=D:\umbrella-data` to keep large data off C:

### 7. Run the system doctor

```powershell
python umbrella.py doctor
```

All `[PASS]` except WSL2 and Docker is fine for local SQLite-only development.

---

## Running the Stack

### Option A — Both services with one command

```powershell
pnpm run dev:all
```

This uses `concurrently` to run the FastAPI backend (port 8000) and Next.js frontend (port 3000) simultaneously. Output is interleaved in the terminal.

### Option B — Separate terminals (recommended for debugging)

**Terminal 1 — Backend:**

```powershell
python -m uvicorn services.api.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**

```powershell
pnpm run dev
```

Open **http://localhost:3000**

### API docs (auto-generated)

- Swagger UI: **http://localhost:8000/docs**
- ReDoc: **http://localhost:8000/redoc**
- OpenAPI JSON: **http://localhost:8000/openapi.json**

---

## Environment Variables

All variables live in `.env` (copy from `.env.example`). Key ones for development:

| Variable | What to set |
|----------|------------|
| `GEMINI_API_KEY` | Your Google Gemini API key for online Vella. Omit for offline mode. |
| `OPENROUTER_API_KEY` | Secondary AI fallback. Optional. |
| `DATABASE_URL` | Leave blank or comment out to use SQLite fallback. Set to postgres URL when Docker is running. |
| `DATA_ROOT` | Change to `D:\umbrella-data` or another large-volume path if you plan to download the 120 GB scientific dataset. |
| `AMRFINDER_PATH` | Path to the `amrfinder` binary inside WSL2. Only needed when WSL2 + AMRFinderPlus are installed. |

---

## Data Lake Setup

The data lake lives under `DATA_ROOT` (default: `data/` relative to repo root).

```
data/
├── raw/
│   ├── genomes/        ← FASTA (.fna/.fa) sequence files
│   ├── amr/            ← AMRFinderPlus/ResFinder TSV outputs
│   └── organizer/      ← Organizer benchmark isolates (if present)
├── derived/
│   ├── qc/             ← Per-sample QC JSON reports
│   ├── amr/            ← Normalised AMR annotations
│   └── features/       ← ML feature matrices (.parquet)
├── manifests/          ← SHA-256 checksums + dataset_manifest.json
├── benchmark/          ← Held-out benchmark evaluation sets
└── models/             ← Versioned trained model artifacts
    └── <antibiotic>/
        └── v1.0.0/
            ├── model.joblib
            ├── calibrator.joblib
            ├── metrics.json
            ├── schema.json
            └── manifest.json
```

**Important:** The `data/` directory is git-ignored. Run `umbrella data init` on every new clone.

### Storage guidance

For the full 120–130 GB real data target, use a non-C: volume:

```powershell
# In .env:
DATA_ROOT=D:\umbrella-data
```

Then re-run `python umbrella.py data init` to create the tree on D:.

---

## Python Backend

### File structure

```
services/
├── api/
│   ├── main.py          ← All FastAPI endpoints + startup seed data
│   ├── models.py        ← SQLAlchemy ORM models
│   ├── schemas.py       ← Pydantic v2 request/response schemas
│   ├── database.py      ← Engine: tries PostgreSQL, falls back to SQLite
│   ├── config.py        ← pydantic-settings (reads .env)
│   └── forge_service.py ← Umbrella Forge app spec compiler
└── vella/
    └── orchestrator.py  ← Vella AI multi-provider orchestration
```

### SQLite vs PostgreSQL

`database.py` auto-detects: if `DATABASE_URL` starts with `postgresql` and the connection fails (or env var is absent), it falls back to `data/umbrella_local.db` (SQLite). **No configuration needed** for local dev.

When Docker is running:
```powershell
# .env
DATABASE_URL=postgresql://umbrella:umbrella_secure_bio@localhost:5432/umbrella_os
```

### Adding a new endpoint

1. Add the ORM model to `services/api/models.py` if needed
2. Add Pydantic schemas to `services/api/schemas.py`
3. Add the route to `services/api/main.py`
4. The DB table is created automatically on startup via `init_db()` (SQLAlchemy `create_all`)

### Running with hot reload

`--reload` flag watches for file changes and restarts automatically:

```powershell
python -m uvicorn services.api.main:app --reload --port 8000
```

---

## Next.js Frontend

### File structure

```
apps/desktop/
├── app/
│   ├── layout.tsx        ← Root HTML + font loading
│   ├── page.tsx          ← Desktop shell — renders windows + keyboard shortcuts
│   └── globals.css       ← Tailwind + CSS custom properties (design tokens)
├── apps/                 ← 17 native app components (one file each)
├── components/
│   ├── desktop/
│   │   ├── WindowFrame.tsx      ← Drag, 8-dir resize, maximize, min/max
│   │   ├── Taskbar.tsx          ← Bottom bar, clock, window tabs
│   │   ├── Launcher.tsx         ← App grid launcher overlay
│   │   └── DesktopIconGrid.tsx  ← Desktop shortcut icons
│   └── ui/
│       └── Tooltip.tsx
├── lib/
│   └── store.ts          ← Zustand window manager (all state + actions)
└── types/
    └── desktop.ts        ← WindowState, AppManifest, SampleRef type defs
```

### State management

All window state lives in `lib/store.ts` (Zustand). Key actions:

```typescript
openApp(appId)        // open or re-focus a window
closeWindow(id)       // close window, remove from taskbar
minimizeWindow(id)    // hide window, keep taskbar entry
maximizeWindow(id)    // toggle fullscreen
focusWindow(id)       // bring to front (z-index)
updateWindowPos(id, x, y)     // from drag handler
updateWindowSize(id, w, h)    // from resize handler
registerForgeApp(manifest)    // install a Forge-compiled app at runtime
```

### API calls

The frontend calls the backend at `http://localhost:8000`. Base URL is read from `process.env.NEXT_PUBLIC_API_URL` (falls back to hardcoded `http://localhost:8000` in dev). All calls currently use raw `fetch`. Adding TanStack Query is a planned enhancement.

### Adding a new app

1. Create `apps/desktop/apps/MyNewApp.tsx`
2. Add the app manifest to the `apps` array in `lib/store.ts`:

```typescript
{
  id: 'my-new-app',
  name: 'My New App',
  acronym: 'MN',
  icon: SomeIcon,        // from lucide-react
  component: MyNewApp,
  category: 'tools',
  defaultSize: { width: 900, height: 600 },
}
```

3. Import the component in `store.ts`
4. App is immediately available in the launcher

---

## ML Pipeline

### Directory structure

```
ml/
├── features/
│   └── extractor.py     ← extract_amr_features_from_findings() → feature dict
├── registry/
│   └── model_store.py   ← predict_resistance(), list_registered_models()
└── training/
    └── train_baseline.py ← trains L2 LR + calibrator for each antibiotic
```

### Training models

```powershell
# Train all antibiotic models (currently uses synthetic data)
python -m ml.training.train_baseline
```

Trained artifacts are written to `data/models/<antibiotic>/v1.0.0/`.

### Inference

The model store loads `.joblib` files on first call and caches them in memory:

```python
from ml.registry.model_store import predict_resistance

result = predict_resistance(
    antibiotic="ciprofloxacin",
    amr_findings=[...],   # list of AmrFinding ORM objects
    qc_data={...}         # dict from run_sequence_qc()
)
# result.predicted_class, result.calibrated_probability, result.ood_flag, result.evidence_refs
```

### Adding a new antibiotic model

Add the antibiotic slug to the `CANONICAL_ANTIBIOTICS` list in `ml/training/train_baseline.py`. Once real BV-BRC data with that antibiotic's phenotype labels is available, the trainer will produce a versioned artifact.

---

## Infrastructure (Docker)

### Start all services

```powershell
cd infra
docker-compose up -d
cd ..
```

Services:
- PostgreSQL 16 + pgvector: `localhost:5432`
- Redis 7: `localhost:6379`
- MinIO: `localhost:9000` (API), `localhost:9001` (console)

### Stop services

```powershell
cd infra
docker-compose down
```

### Wipe data volumes (destructive)

```powershell
cd infra
docker-compose down -v
```

### MinIO console

http://localhost:9001 — login with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` from `.env`.

---

## WSL2 & Bioinformatics Tools

**WSL2 is currently not installed** on this machine. AMRFinderPlus and ResFinder require it.

### Install WSL2

```powershell
# Run as Administrator — requires reboot
wsl --install -d Ubuntu-22.04
```

After reboot, complete the Ubuntu setup (create username/password), then:

```bash
# Inside WSL2 Ubuntu
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv build-essential

# Install AMRFinderPlus (via conda or direct binary)
conda install -c bioconda ncbi-amrfinderplus
# OR
sudo apt install -y ncbi-amrfinderplus

# Download AMRFinderPlus database
amrfinder --update
```

Update `.env`:

```
AMRFINDER_PATH=/usr/bin/amrfinder
AMRFINDER_DB=/home/<user>/amrfinder/latest
```

---

## Code Conventions

### Python

- **PEP 8** — 4-space indent, 100-char line limit
- **Type hints everywhere** — all function signatures must be typed
- **Pydantic v2** for all API request/response models — no raw dicts on API boundaries
- **SQLAlchemy 2.0-style** ORM — use `Session.execute(select(...))` not legacy `Session.query()`
- **No hardcoded organism defaults** — organism always comes from sample metadata or user selection
- **Status labels** in code comments and docstrings: `IMPLEMENTED | PARTIALLY IMPLEMENTED | BLOCKED | NOT IMPLEMENTED`
- **Scientific honesty**: never return fabricated values; always include `ood_flag` on ML predictions
- All simulations must be labeled `SIMULATED`, `MODELED`, or `REFERENCE-BASED` in API responses

### TypeScript / React

- **Strict TypeScript** — `"strict": true` in tsconfig, no `any` without justification
- **Named exports** preferred over default exports for components
- **Zustand actions** in the store — no direct state mutations in components
- **Tailwind only** for styling — no inline styles except for dynamic values (window position/size)
- **Framer Motion** for all animations — no CSS transitions on interactive elements
- **Lucide React** for all icons — do not import from other icon libraries
- Component files are one component per file, named to match the export

### Git

- Branch from `main`, PR back to `main`
- Commit messages: `type(scope): description` — e.g., `feat(amr): wire AMRFinderPlus binary call`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Never commit `.env`, `data/`, `*.joblib`, `node_modules/`

---

## Known Issues & Workarounds

### 1. pnpm workspace `packages/` missing

**Symptom:** `pnpm install` warns about missing packages directory.  
**Fix:** `New-Item -ItemType Directory -Path packages -Force` (already done if you followed setup above).

### 2. CORS is wide-open

`services/api/main.py` has `allow_origins=["*"]`. Fine for local dev, must be locked before any networked deployment. Track: see CONTRIBUTING.md phase v0.2.

### 3. No authentication

All API endpoints are public. Do not expose port 8000 beyond localhost in development.

### 4. AMR findings are seeded/mocked

The 3 benchmark isolates (SMP-1827, SMP-1828, SMP-1829) use synthetic sequences. AMRFinderPlus is not called — findings are manually created in `seed_benchmark_data()` in `main.py`. This is expected until WSL2 + AMRFinderPlus are wired.

### 5. ML models trained on synthetic data

Metrics look good (~0.90 ROC-AUC) because the training data was generated by the same synthetic process. These models are architectural placeholders. Retrain with real BV-BRC data once acquired.

### 6. Redis/Celery not wired

All API calls are synchronous. Large FASTA uploads (>10 MB) will block the server response. The async job architecture is designed but not implemented.

### 7. `pnpm run dev:all` on Windows

`concurrently` may not show Python backend errors clearly when mixed with Next.js output. If the backend isn't responding, run it in a separate terminal for clearer error output.

### 8. Python 3.14 compatibility

The repo was built targeting Python 3.10+. Python 3.14 is newer than the spec. All packages install correctly but if you encounter any compatibility issues, Python 3.11 or 3.12 is the most stable choice.

---

## Debugging Tips

### Backend won't start

```powershell
# Check if port 8000 is already in use
netstat -an | Select-String ":8000"
# Kill the process if needed
Get-Process | Where-Object { $_.Id -eq <PID> } | Stop-Process
```

### SQLite lock errors

If you restart the backend while a previous instance is still running, SQLite may report a locked database. Kill the old process first.

### Frontend can't reach backend

Check that `NEXT_PUBLIC_API_URL` in `.env` matches where the backend is running. Default is `http://localhost:8000`. The frontend falls back to this value if the env var is not set.

### Zustand store debugging

Install the Redux DevTools browser extension. Zustand stores are compatible with it via the `devtools` middleware (not yet added — planned enhancement).

### Model not found errors

If `ml/registry/model_store.py` can't find a model, check that `data/models/<antibiotic>/v1.0.0/` exists and contains both `model.joblib` and `calibrator.joblib`. If missing, run:

```powershell
python -m ml.training.train_baseline
```

### API 422 validation errors

These come from Pydantic rejecting the request body. Check the `/docs` Swagger UI for the exact schema expected, and compare against what the frontend is sending (browser DevTools → Network tab).
