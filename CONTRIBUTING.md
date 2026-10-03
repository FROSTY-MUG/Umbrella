# Contributing to Umbrella OS

This document explains how to contribute effectively, the priority order for bug fixes and enhancements, and the conventions all contributors must follow.

---

## Table of Contents

- [Philosophy](#philosophy)
- [Absolute Rules](#absolute-rules)
- [Priority Order](#priority-order)
- [Immediate Bug Fixes (v0.2 priority)](#immediate-bug-fixes-v02-priority)
- [Enhancement Sequence (v0.2–v0.6)](#enhancement-sequence-v02v06)
- [Branching and PR Process](#branching-and-pr-process)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Status Labels](#status-labels)
- [What Not to Do](#what-not-to-do)

---

## Philosophy

Umbrella OS is a scientific platform. Accuracy and honesty are non-negotiable. Every line of code either advances the product toward real computational biology value or it doesn't belong here.

- **Real data only.** Never invent genomes, phenotypes, metrics, or gene lists.
- **Real results only.** Every displayed value must come from the backend. No hardcoded mock data in the frontend beyond the initial 3 seeded reference isolates.
- **Scientific integrity.** ML predictions carry calibrated probabilities, OOD flags, and evidence dossiers. Simulations are always labeled SIMULATED / MODELED. Never misrepresent computational results as laboratory measurements.
- **Progression, not churn.** Each PR should make the product demonstrably better — a bug fixed, a real feature wired, a test added, a performance improvement measured.

---

## Absolute Rules

These apply without exception:

1. **No synthetic / dummy / procedurally generated product genomes or phenotypes.** The only synthetic data allowed is the current 4 baseline models (which are explicitly marked for replacement with real BV-BRC data).

2. **No hardcoded organism defaults.** Organism always comes from real sample metadata or explicit user selection. The E. coli default in the current seed data is a placeholder to be replaced.

3. **Do not fabricate ML metrics.** If a model is `NOT IMPLEMENTED` for lack of labeled data, mark it as such. Do not generate fake ROC-AUC numbers.

4. **Biosafety.** No actionable wet-lab instructions for increasing virulence or resistance. No assistance creating harmful biological agents. All simulations must be labeled.

5. **Secrets via env only.** Never commit API keys, passwords, or credentials. All secrets live in `.env` which is git-ignored.

6. **No `any` without justification.** TypeScript strict mode is on. Every `any` cast needs an explanatory comment.

---

## Priority Order

Work through issues in this order:

```
1. Blocking bugs (app doesn't start, data corruption, security)
2. High-priority gaps (CORS, auth, real data, async jobs)
3. Feature completion (wire existing scaffolded components)
4. Test coverage
5. ML upgrade
6. Advanced features
7. Production hardening
```

---

## Immediate Bug Fixes (v0.2 priority)

These should be addressed before any new feature work:

### BUG-001 — CORS wide-open
**File:** `services/api/main.py`  
**Issue:** `allow_origins=["*"]` — accepts requests from any origin.  
**Fix:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # add FRONTEND_URL to config.py
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
Add `FRONTEND_URL=http://localhost:3000` to `.env.example` and `config.py`.

### BUG-002 — `packages/` directory missing
**File:** `pnpm-workspace.yaml`  
**Issue:** `pnpm-workspace.yaml` lists `packages/*` but `packages/` doesn't exist. Causes pnpm install warnings and may break CI.  
**Fix:** Create `packages/` and add a `.gitkeep`:
```powershell
New-Item -ItemType Directory -Path packages
New-Item -ItemType File -Path packages/.gitkeep
git add packages/.gitkeep
```

### BUG-003 — Seed data uses synthetic FASTA sequences
**File:** `services/api/main.py` → `seed_benchmark_data()`  
**Issue:** The 3 seeded isolates use repeated character strings as FASTA sequences (`"ATGCGATCG..." * 80`). QC passes but the genomic data is not biologically meaningful.  
**Fix:** Download 3 real reference genomes from NCBI (E. coli K-12, K. pneumoniae ATCC 43816, S. aureus MRSA252) and include them as small representative files in `data/raw/genomes/benchmark/`.

### BUG-004 — ML models trained on synthetic data
**File:** `ml/training/train_baseline.py`  
**Issue:** Training data is synthetically generated. Models show ~0.90 ROC-AUC because test data comes from the same generator.  
**Fix:** Replace synthetic data loader with real BV-BRC phenotype + AMRFinderPlus feature join. Requires completing BUG-005 first.  
**Blocked by:** BV-BRC data acquisition pipeline (v0.3).

### BUG-005 — AMRFinderPlus not called
**File:** `services/api/main.py`  
**Issue:** `AMRFINDER_PATH` is configured but `amrfinder` binary is never invoked. AMR findings are seeded/mocked.  
**Fix:** Implement `run_amrfinder(fasta_path, sample_id)` function in `services/api/` that calls the binary via WSL2 subprocess, parses TSV output, and creates `AmrFinding` records.  
**Blocked by:** WSL2 installation.

### BUG-006 — No authentication
**Issue:** All API endpoints are publicly accessible.  
**Minimum fix:** Add a static API key header check on all non-public routes as interim protection:
```python
from fastapi.security import APIKeyHeader
API_KEY = APIKeyHeader(name="X-API-Key")
```
**Full fix:** JWT authentication with user sessions (v1.0 target).

### BUG-007 — `requirements.txt` missing new packages
**File:** `requirements.txt`  
**Issue:** `lightgbm`, `xgboost` are installed but not in `requirements.txt`.  
**Fix:** Add to `requirements.txt`:
```
lightgbm>=4.5.0
xgboost>=2.1.0
```

---

## Enhancement Sequence (v0.2–v0.6)

Work through enhancements in this order within each phase:

### Phase v0.2 — Frontend Hardening

**ENH-001 — Add TanStack Query**  
All backend data fetching in app components currently uses raw `fetch`. Replace with TanStack Query (`@tanstack/react-query`) for:
- Automatic caching and deduplication
- Loading and error states
- Background refetch
- Optimistic updates

Installation: `pnpm --filter @umbrella/desktop add @tanstack/react-query`

**ENH-002 — Add Zod validation**  
All API request payloads from the frontend should be validated with Zod schemas before sending.  
Installation: `pnpm --filter @umbrella/desktop add zod`

**ENH-003 — Implement Celery worker skeleton**  
Create `services/workers/amr_worker.py` with a Celery app and a placeholder `run_amr_analysis` task. This unblocks async FASTA processing.

**ENH-004 — `umbrella data manifest` and `umbrella data verify`**  
Implement these CLI commands in `umbrella.py`:
- `manifest` — reads `data/manifests/dataset_manifest.json` and prints a formatted summary
- `verify` — walks `data/raw/genomes/`, computes SHA-256 for each file, compares against stored manifest

### Phase v0.3 — Real Data Pipeline

**ENH-005 — `umbrella data download`**  
Implement a BV-BRC download command:
- Query BV-BRC public API for genome IDs with AMR phenotype records
- Download FASTA files (resumable, with progress bar)
- Download genome_amr TSV phenotype records
- Write checksums to manifest
- Respect `DATA_ROOT` — prefer D: drive

**ENH-006 — Wire AMRFinderPlus in Celery worker**  
Once WSL2 is available, implement the full async AMR annotation job.

### Phase v0.4 — Tests

**ENH-007 — Backend pytest suite**  
Minimum coverage:
- `tests/test_fasta_parser.py` — QC engine with known good + bad FASTA inputs
- `tests/test_features.py` — feature extraction from mock AmrFinding objects
- `tests/test_inference.py` — ML inference with real model artifacts
- `tests/test_api.py` — all endpoints via FastAPI TestClient

**ENH-008 — Frontend Vitest suite**  
Minimum coverage:
- `tests/store.test.ts` — window open/close/minimize/maximize/cascade/focus
- `tests/WindowFrame.test.tsx` — drag and resize boundary clamping

### Phase v0.5 — ML Upgrade

**ENH-009 — Full AMR model panel**  
Once real BV-BRC data is available:
1. For each antibiotic in the target panel, check if enough labeled rows exist (minimum 100 per class recommended)
2. If yes: train L2 LR baseline + LightGBM + XGBoost, select best by ROC-AUC
3. If no: mark `NOT IMPLEMENTED` in model registry
4. Never use synthetic labels to fill gaps

**ENH-010 — `umbrella data features`**  
Build Parquet feature matrices from real AMRFinderPlus TSV outputs for all downloaded genomes.

---

## Branching and PR Process

```
main          ← production-ready at all times
  └── feat/<scope>-<description>    ← feature branches
  └── fix/<scope>-<description>     ← bug fix branches
  └── docs/<description>            ← documentation-only changes
  └── test/<scope>                  ← test additions
```

### Branch examples

```
fix/cors-restrict-origins
feat/celery-amr-worker
feat/tanstack-query-frontend
fix/packages-gitkeep
docs/update-architecture
test/backend-fasta-parser
```

### PR checklist

Before opening a PR:

- [ ] Code matches conventions in [Code Standards](#code-standards)
- [ ] All existing tests pass (`pytest tests/` / `pnpm run test`)
- [ ] New functionality has tests if in a tested module
- [ ] No secrets committed (check `.env` is not staged)
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] If a new Python dependency was added: `requirements.txt` updated
- [ ] If a new JS dependency was added: `pnpm-workspace.yaml` or `apps/desktop/package.json` updated
- [ ] Status labels updated in code comments and docs if implementation state changed

### PR title format

```
type(scope): short description

Examples:
fix(api): scope CORS to localhost:3000 only
feat(worker): add Celery skeleton for async AMR jobs
feat(ml): add LightGBM model tier for ciprofloxacin
docs(arch): add Celery worker section to ARCHITECTURE.md
test(api): add FastAPI TestClient suite for all endpoints
```

---

## Code Standards

### Python

- PEP 8, 4-space indent, max 100 chars per line
- All functions must have type hints and a one-line docstring
- Use `from __future__ import annotations` in files with complex type forward refs
- SQLAlchemy 2.0 style only: `session.execute(select(Model).where(...))`, not `session.query()`
- All Pydantic models use `model_config = ConfigDict(from_attributes=True)` for ORM compatibility
- Logging: use `import logging; logger = logging.getLogger(__name__)` — never `print()` in production paths

### TypeScript / React

- `"strict": true` in tsconfig — no exceptions
- `interface` for object shapes, `type` for unions/intersections
- No barrel `index.ts` re-exports unless the module genuinely benefits from it
- `cn(...)` utility from `lib/utils.ts` for all conditional Tailwind classes
- App components must not import from other app components — they communicate via the Zustand store
- All `fetch` calls must handle error states and set appropriate loading states

### Naming

| Context | Convention |
|---------|-----------|
| Python files | `snake_case.py` |
| Python classes | `PascalCase` |
| Python functions/vars | `snake_case` |
| TS/React files | `PascalCase.tsx` for components, `camelCase.ts` for utilities |
| React components | `PascalCase` |
| Zustand actions | `verbNoun` — `openApp`, `closeWindow`, `updateWindowPos` |
| API endpoints | REST — `/api/resource` (noun), `/api/resource/{id}/action` (verb only when necessary) |
| Antibiotic slugs | Lowercase hyphenated: `ciprofloxacin`, `amoxicillin-clavulanate`, `trimethoprim-sulfamethoxazole` |

---

## Testing Requirements

### Backend (pytest)

```powershell
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=services --cov=core --cov=ml --cov-report=term-missing
```

Minimum targets (once test suite exists):
- API endpoints: 80% coverage
- Bio core (FASTA parser, QC, variant calling): 90% coverage
- ML inference: 85% coverage

### Frontend (Vitest — to be added)

```powershell
pnpm --filter @umbrella/desktop test --run
```

Minimum targets:
- Zustand window manager store: all actions tested
- WindowFrame component: drag/resize boundary logic

---

## Status Labels

Use these exact strings in code comments, docstrings, and documentation:

| Label | Meaning |
|-------|---------|
| `IMPLEMENTED` | Fully working with real data/logic |
| `PARTIALLY IMPLEMENTED` | Core logic exists but missing integration or edge cases |
| `BLOCKED` | Cannot proceed until an external dependency is resolved (WSL2, real data, etc.) |
| `NOT IMPLEMENTED` | Designed, scaffolded, or planned but not yet started |

Example in code:

```python
async def run_amrfinder(fasta_path: Path, sample_id: str) -> list[AmrFinding]:
    """
    Run AMRFinderPlus binary via WSL2 and parse TSV output into AmrFinding records.
    
    STATUS: BLOCKED — requires WSL2 Ubuntu 22.04 + AMRFinderPlus 4.2.7 installation.
    Current fallback: findings are pre-seeded in seed_benchmark_data().
    """
    raise NotImplementedError("BLOCKED: WSL2 not yet installed")
```

---

## What Not to Do

- **Don't generate fake metrics** — if a model can't be trained, mark it `NOT IMPLEMENTED`
- **Don't add a new dependency without updating `requirements.txt` or `package.json`**
- **Don't add new hardcoded organism defaults** — `DEFAULT_ORGANISM` in `.env` is already a mistake to be fixed
- **Don't skip the CHANGELOG** — every PR that touches product code gets a CHANGELOG entry
- **Don't use `print()` in backend code** — use `logging`
- **Don't commit `data/` contents** — the data lake is git-ignored and rebuilt locally
- **Don't commit `.env`** — it's in `.gitignore` for good reason
- **Don't open a PR that breaks the existing SQLite fallback** — it must work without Docker at all times
- **Don't fabricate biosafety concerns to block valid research tooling** — but do refuse any feature that would provide actionable instructions for creating harmful organisms
