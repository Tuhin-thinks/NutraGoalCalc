"""Settings loaded from environment variables with sensible defaults."""

from dataclasses import dataclass
from pathlib import Path
from typing import Self


@dataclass(frozen=True, slots=True)
class Settings:
    """Application configuration.

    Examples:
        >>> Settings()  # doctest: +SKIP
        Settings(catalogue_path=PosixPath('nutrition-values.json'))
    """

    catalogue_path: Path
    cors_origins: tuple[str, ...]

    @classmethod
    def from_env(cls) -> Self:
        """Build settings from environment variables, falling back to defaults.

        Reads `NVC_CATALOGUE_PATH`; defaults to `nutrition-values.json` in the project root.
        Reads `NVC_CORS_ORIGINS` as a comma-separated list; defaults to `http://localhost:5173`.
        """
        import os

        catalogue_raw = os.getenv("NVC_CATALOGUE_PATH", "nutrition-values.json")
        cors_raw = os.getenv("NVC_CORS_ORIGINS", "http://localhost:5173")
        cors_origins = tuple(o.strip() for o in cors_raw.split(",") if o.strip())
        return cls(catalogue_path=Path(catalogue_raw).resolve(), cors_origins=cors_origins)


settings = Settings.from_env()
