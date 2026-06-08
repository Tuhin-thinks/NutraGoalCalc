"""Settings loaded from environment variables with sensible defaults."""

from dataclasses import dataclass
from pathlib import Path
from typing import Self


@dataclass(frozen=True, slots=True)
class Settings:
    """Application configuration."""

    catalogue_path: Path
    database_path: Path
    cors_origins: tuple[str, ...]

    @classmethod
    def from_env(cls) -> Self:
        """Build settings from environment variables, falling back to defaults."""
        import os

        catalogue_raw = os.getenv("NVC_CATALOGUE_PATH", "nutrition-values.json")
        db_raw = os.getenv("NVC_DATABASE_PATH", "nutragocalc.db")
        cors_raw = os.getenv("NVC_CORS_ORIGINS", "http://localhost:5173")
        cors_origins = tuple(o.strip() for o in cors_raw.split(",") if o.strip())
        return cls(
            catalogue_path=Path(catalogue_raw).resolve(),
            database_path=Path(db_raw).resolve(),
            cors_origins=cors_origins,
        )


settings = Settings.from_env()
