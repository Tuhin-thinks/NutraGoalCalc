"""Settings loaded from environment variables with sensible defaults."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class Settings:
    """Application configuration.

    Examples:
        >>> Settings()  # doctest: +SKIP
        Settings(catalogue_path=PosixPath('nutrition-values.json'))
    """

    catalogue_path: Path

    @classmethod
    def from_env(cls) -> Settings:
        """Build settings from environment variables, falling back to defaults.

        Reads `NVC_CATALOGUE_PATH`; defaults to `nutrition-values.json` in the project root.
        """
        import os

        raw = os.getenv("NVC_CATALOGUE_PATH", "nutrition-values.json")
        return cls(catalogue_path=Path(raw).resolve())


settings = Settings.from_env()
