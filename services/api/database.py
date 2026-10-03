"""
Umbrella OS - Database Engine & Session Manager
Supports PostgreSQL (with pgvector) and transparently falls back to SQLite
so that the application can boot and run reliably across environments.
"""

import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from services.api.config import settings, ROOT_DIR

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    # If postgresql URL is given, test connectivity; if unreachable, fallback to SQLite
    if db_url.startswith("postgresql"):
        try:
            test_engine = create_engine(db_url, pool_pre_ping=True)
            with test_engine.connect() as conn:
                pass
            return test_engine
        except Exception as e:
            print(f"[Umbrella DB Warning] PostgreSQL not reachable ({e}). Falling back to local SQLite at {settings.SQLITE_FALLBACK}", file=sys.stderr)
            sqlite_url = f"sqlite:///{settings.SQLITE_FALLBACK}"
            return create_engine(sqlite_url, connect_args={"check_same_thread": False})
    else:
        return create_engine(db_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from services.api import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print(f"[Umbrella DB] Initialized all scientific tables using engine: {engine.url}")
