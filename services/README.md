# services/

Python backend services for Umbrella OS.

## Structure

```
services/
├── api/                    # FastAPI scientific computing API (port 8000)
│   ├── main.py             # All endpoints + startup seed data
│   ├── models.py           # SQLAlchemy ORM models
│   ├── schemas.py          # Pydantic v2 request/response schemas
│   ├── database.py         # PostgreSQL + SQLite auto-fallback engine
│   ├── config.py           # pydantic-settings — reads from .env
│   └── forge_service.py    # Umbrella Forge app spec compiler
│
└── vella/
    └── orchestrator.py     # Vella AI — Gemini / OpenRouter / local fallback
```

## Running

```powershell
# From repo root
python -m uvicorn services.api.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Database

The API auto-selects the database engine at startup:
1. Tries to connect to `DATABASE_URL` (PostgreSQL)
2. If that fails or is not set: uses `SQLITE_FALLBACK_PATH` (SQLite)

SQLite requires no setup and works without Docker.

## Planned services (not yet created)

- `services/workers/` — Celery task workers for async AMR annotation jobs
- `services/model-server/` — Dedicated ML inference service (for high-throughput)

See [ARCHITECTURE.md](../ARCHITECTURE.md) for data flow diagrams.
