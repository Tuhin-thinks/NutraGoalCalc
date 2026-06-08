"""FastAPI application factory for the NutraGoalCalc backend."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from nvc.config import Settings, settings
from nvc.database import get_engine, init_db, seed_from_json
from nvc.repositories import SQLAlchemyCatalogueRepository, NutritionRepository
from nvc.routers import calculate_router, foods_router, health_router
from nvc.services import DefaultNutritionCalculator, NutritionCalculator


def create_app(config: Settings = settings) -> FastAPI:
    """Build the FastAPI app, initialising the database during startup."""

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        engine = get_engine(config.database_path)
        init_db(engine)
        seed_from_json(engine, config.catalogue_path)
        app.state.repository: NutritionRepository = SQLAlchemyCatalogueRepository(engine)
        app.state.calculator: NutritionCalculator = DefaultNutritionCalculator()
        yield

    app = FastAPI(
        title="NutraGoalCalc Backend",
        version="0.1.0",
        description="Single-user FastAPI service for calculating nutritional values from a food catalogue.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )

    api_prefix = "/api/v1"
    app.include_router(health_router, prefix=api_prefix)
    app.include_router(foods_router, prefix=api_prefix)
    app.include_router(calculate_router, prefix=api_prefix)

    return app


app = create_app()
