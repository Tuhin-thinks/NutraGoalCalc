"""FastAPI application factory for the NutraGoalCalc backend."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from nvc.config import Settings, settings
from nvc.repositories import JSONCatalogueRepository, NutritionRepository
from nvc.routers import foods_router, health_router, targets_router


def create_app(config: Settings = settings) -> FastAPI:
    """Build the FastAPI app, loading the catalogue once during startup.

    The loaded `NutritionRepository` is stashed on `app.state.repository` and
    served to routers via the `get_repository` dependency.
    """
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        app.state.repository: NutritionRepository = JSONCatalogueRepository(config.catalogue_path)
        yield

    app = FastAPI(
        title="NutraGoalCalc Backend",
        version="0.1.0",
        description="Single-user FastAPI service for calculating nutritional values from a static food catalogue.",
        lifespan=lifespan,
    )

    api_prefix = "/api/v1"
    app.include_router(health_router, prefix=api_prefix)
    app.include_router(foods_router, prefix=api_prefix)
    app.include_router(targets_router, prefix=api_prefix)

    return app


app = create_app()
