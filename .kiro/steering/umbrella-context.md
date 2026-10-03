---
inclusion: always
---

# Umbrella OS — AI Session Context

This steering file gives any AI session instant context about the Umbrella OS project so investigation is not needed before working on it.

---

## What This Project Is

**Umbrella OS** is an AI-native computational biology desktop operating system. It runs entirely in the browser as a Next.js application styled and structured as a real OS — draggable/resizable windows, a taskbar, a launcher, and 17 native scientific applications. The backend is FastAPI with a Python scientific stack, trained AMR resistance models, and Vella (a multi-provider AI orchestrator).

**Repo:** `https://github.com/FROSTY-MUG/Umbrella.git`  
**Local path:** `C:\Users\HP\app\Umbrella`  
**Investigation report:** `C:\Users\HP\app\Umbrella\.agents\umbrella-investigation.md`

---

## Key Architecture Facts

- **Frontend:** `apps/desktop/` — Next.js 15, React 19, TypeScript, Tailwind, Zustand (window manager), Framer Motion
- **Backend:** `services/api/main.py` — FastAPI, Pydantic v2, SQLAlchemy 2. Auto-falls back from PostgreSQL to SQLite — **no Docker needed for local dev**
- **Bio core:** `core/bio/` — fasta_parser.py, alignment.py, radiation_sim.py
- **ML:** `ml/` — features/extractor.py, registry/model_store.py, training/train_baseline.py
- **AI:** `services/vella/orchestrator.py` — Gemini → OpenRouter → deterministic local fallback
- **Forge:** `services/api/forge_service.py` — natural-language → App Spec DSL → live OS window
- **Infra:** `infra/docker-compose.yml` — PostgreSQL 16 + pgvector, Redis 7, MinIO

---

## Current Build State (as of 2026-10-04)

### Working (no Docker, no WSL2 needed):
- Browser desktop OS — full window manager, 17 app UIs, taskbar, launcher
- All FastAPI endpoints (SQLite fallback active)
- FASTA parser, QC engine, pairwise variant calling, radiation simulation
- 4 AMR model inference (ciprofloxacin, meropenem, tetracycline, gentamicin)
- Vella AI orchestrator (offline mode works without API key)
- Umbrella Forge app compiler

### Blocked / Not Yet Wired:
- AMRFinderPlus binary — **BLOCKED: WSL2 not installed** (`wsl --install -d Ubuntu-22.04` required)
- Docker services — **NOT INSTALLED**: PostgreSQL, Redis, MinIO not running
- ML models use **synthetic training data** — real BV-BRC data not yet acquired
- Celery async worker — scaffolded, not yet written
- MinIO integration — configured in compose, not used in code
- TanStack Query / Zod — not yet added to frontend
- No tests — no pytest, no Vitest

---

## Environment (Verified 2026-10-04)

| Component | State |
|-----------|-------|
| Python | 3.14.2 |
| Node.js | 24.12.0 |
| pnpm | 9.0.0 |
| WSL2 | NOT INSTALLED |
| Docker | NOT INSTALLED |
| GPU | NVIDIA RTX 4060 Laptop — 8 GB VRAM |
| C: drive free | ~71 GB |
| D: drive free | ~226 GB ← recommended DATA_ROOT |
| E: drive free | ~114 GB |

All Python dependencies from `requirements.txt` are installed, including:  
biopython 1.88, duckdb 1.5.6, minio 7.2.20, alembic 1.20.0, asyncpg 0.31.0, lightgbm 4.7.0, xgboost 3.4.1

JS deps are installed: `apps/desktop/node_modules/` present.  
`packages/` directory created and has `.gitkeep`.

---

## How to Start the App Right Now

```powershell
# Terminal 1 — backend
cd C:\Users\HP\app\Umbrella
python -m uvicorn services.api.main:app --reload --port 8000

# Terminal 2 — frontend
cd C:\Users\HP\app\Umbrella
pnpm run dev

# Or both at once:
pnpm run dev:all
```

Open http://localhost:3000

---

## Key Files to Read First

| Purpose | File |
|---------|------|
| All API endpoints | `services/api/main.py` |
| ORM models | `services/api/models.py` |
| Window manager (Zustand) | `apps/desktop/lib/store.ts` |
| Desktop shell | `apps/desktop/app/page.tsx` |
| ML inference | `ml/registry/model_store.py` |
| FASTA QC | `core/bio/fasta_parser.py` |
| Vella AI | `services/vella/orchestrator.py` |
| Forge compiler | `services/api/forge_service.py` |
| System config | `config.yaml`, `.env.example` |

---

## Active Known Issues (in priority order)

1. **BUG-001** — CORS `allow_origins=["*"]` in `services/api/main.py` — must be scoped
2. **BUG-002** — `packages/` was missing from repo (now fixed with `.gitkeep`)
3. **BUG-003** — Seed data uses synthetic FASTA sequences (not real genomes)
4. **BUG-004** — ML models trained on synthetic data (blocked on BV-BRC acquisition)
5. **BUG-005** — AMRFinderPlus not called (blocked on WSL2 install)
6. **BUG-006** — No authentication on any API endpoint
7. **BUG-007** — `lightgbm` and `xgboost` now in requirements.txt (was missing, now fixed)

---

## Documentation Map

| File | Contents |
|------|----------|
| `README.md` | Project overview, quick start, all app status table, roadmap |
| `DEVELOPMENT.md` | Setup, running services, backend/frontend/ML dev guides, debugging |
| `ARCHITECTURE.md` | Layer diagram, data flows, window manager, ML pipeline, Vella, Forge |
| `CHANGELOG.md` | v0.1.0 state, known issues table, full roadmap v0.2–v1.0 |
| `CONTRIBUTING.md` | Bug fix priority list, enhancement sequence, code standards, PR process |
| `.agents/umbrella-investigation.md` | Full deep-dive investigation report |

---

## Build Prompt Source of Truth

The complete product specification is in:
- `Umbrella OS — Antigravity Master Build Prompt — Full Product Edition.md` — primary spec
- `Umbrella OS — Antigravity Master Build Prompt.md` — earlier version
- `Umbrella_OS_Master_Build_Specification.pdf`
- `Umbrella_OS_Backend_and_ML_Build_Guide.pdf`
- `Umbrella_OS_UI_UX_Frontend_Build_Guide.pdf`
- `Umbrella_OS_Data_Sourcing_and_Benchmark_Guide.pdf`

**Key overrides from the full product build prompt:**
- No synthetic data in production
- No hardcoded organism defaults
- ML panel must cover 30+ antibiotics (not just 4)
- All models must use real BV-BRC laboratory phenotype labels
- DATA_ROOT must be on D: drive for large datasets (D: has 226 GB free)
- CPU-first ML; RTX 4060 8GB available as optional accelerator
