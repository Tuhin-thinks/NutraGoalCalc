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

    llm_provider: str | None
    openai_api_key: str | None
    openai_model: str
    ollama_base_url: str
    ollama_model: str

    @classmethod
    def from_env(cls) -> Self:
        """Build settings from environment variables, falling back to defaults."""
        import os

        catalogue_raw = os.getenv("NVC_CATALOGUE_PATH", "nutrition-values.json")
        db_raw = os.getenv("NVC_DATABASE_PATH", "nutragocalc.db")
        cors_raw = os.getenv("NVC_CORS_ORIGINS", "http://localhost:5173")
        cors_origins = tuple(o.strip() for o in cors_raw.split(",") if o.strip())

        llm_provider_raw = os.getenv("NVC_LLM_PROVIDER", "")
        llm_provider: str | None = llm_provider_raw.strip() or None

        return cls(
            catalogue_path=Path(catalogue_raw).resolve(),
            database_path=Path(db_raw).resolve(),
            cors_origins=cors_origins,
            llm_provider=llm_provider,
            openai_api_key=os.getenv("NVC_OPENAI_API_KEY"),
            openai_model=os.getenv("NVC_OPENAI_MODEL", "gpt-4o-mini"),
            ollama_base_url=os.getenv("NVC_OLLAMA_BASE_URL", "http://localhost:11434"),
            ollama_model=os.getenv("NVC_OLLAMA_MODEL", "llama3.2"),
        )


settings = Settings.from_env()
