"""
Umbrella OS - Backend Configuration Matrix
Loads environment variables, handles PostgreSQL with automatic SQLite fallback,
MinIO object storage, and Vella AI provider keys.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings

ROOT_DIR = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    PROJECT_NAME: str = "Umbrella OS - Scientific Bio-Computing API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{ROOT_DIR / 'data' / 'umbrella_local.db'}"
    )
    SQLITE_FALLBACK: str = str(ROOT_DIR / "data" / "umbrella_local.db")

    # Redis & MinIO
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ROOT_USER: str = os.getenv("MINIO_ROOT_USER", "umbrella_admin")
    MINIO_ROOT_PASSWORD: str = os.getenv("MINIO_ROOT_PASSWORD", "umbrella_minio_secret_2026")
    MINIO_BUCKET: str = os.getenv("MINIO_BUCKET", "umbrella-data")

    # AI Provider (Vella)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")

    # Authentication & Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "umbrella_super_secure_jwt_secret_2026_biotech")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    AUTH_ALLOW_DEV_MOCK: bool = os.getenv("AUTH_ALLOW_DEV_MOCK", "true").lower() == "true"

    # Storage Paths
    DATA_ROOT: Path = ROOT_DIR / "data"
    MODELS_ROOT: Path = ROOT_DIR / "data" / "models"
    RAW_GENOMES_ROOT: Path = ROOT_DIR / "data" / "raw" / "genomes"

    class Config:
        env_file = str(ROOT_DIR / ".env")
        extra = "allow"

settings = Settings()
