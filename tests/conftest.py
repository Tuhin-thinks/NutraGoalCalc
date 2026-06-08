"""Shared fixtures for the test suite."""

import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from nvc.database import FoodRecord, init_db
from nvc.main import create_app
from nvc.repositories import SQLAlchemyCatalogueRepository
from nvc.services import DefaultNutritionCalculator


@pytest.fixture
def db_path():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        yield Path(f.name)


@pytest.fixture
def engine(db_path):
    eng = create_engine(f"sqlite:///{db_path}", echo=False)
    init_db(eng)
    now = "2025-01-01T00:00:00"
    with eng.begin() as conn:
        conn.execute(
            FoodRecord.__table__.insert(),
            [
                dict(
                    id="chicken_breast_100g", name="Chicken Breast", category="protein",
                    unit="g", reference_weight_g=100, protein_g=30, carbs_g=0,
                    fat_g=3.5, calories_kcal=165, fiber_g=0, min_increment=50,
                    notes=None, is_custom=0, created_at=now, updated_at=now,
                ),
                dict(
                    id="whey_isolate_1_scoop", name="Whey Isolate", category="protein",
                    unit="scoop", reference_weight_g=30, protein_g=25, carbs_g=1.5,
                    fat_g=0.5, calories_kcal=115, fiber_g=0, min_increment=0.5,
                    notes=None, is_custom=0, created_at=now, updated_at=now,
                ),
                dict(
                    id="whole_egg_1", name="Whole Egg", category="protein",
                    unit="each", reference_weight_g=50, protein_g=6.3, carbs_g=0.6,
                    fat_g=5, calories_kcal=72, fiber_g=0, min_increment=0.5,
                    notes=None, is_custom=0, created_at=now, updated_at=now,
                ),
                dict(
                    id="chole_1_bowl", name="Chole", category="protein",
                    unit="bowl", reference_weight_g=200, protein_g=12, carbs_g=0,
                    fat_g=0, calories_kcal=250, fiber_g=0, min_increment=0.5,
                    notes=None, is_custom=0, created_at=now, updated_at=now,
                ),
                dict(
                    id="psyllium_husk_1_tbsp", name="Psyllium Husk", category="fiber",
                    unit="tbsp", reference_weight_g=10, protein_g=0, carbs_g=0,
                    fat_g=0, calories_kcal=20, fiber_g=4, min_increment=0.25,
                    notes=None, is_custom=0, created_at=now, updated_at=now,
                ),
                dict(
                    id="flax_seeds_1_tbsp", name="Flax Seeds", category="fat",
                    unit="tbsp", reference_weight_g=10, protein_g=0, carbs_g=0,
                    fat_g=0, calories_kcal=55, fiber_g=5, min_increment=0.25,
                    notes=None, is_custom=0, created_at=now, updated_at=now,
                ),
                dict(
                    id="oats_50g_raw", name="Oats", category="carbs",
                    unit="g", reference_weight_g=50, protein_g=6, carbs_g=30,
                    fat_g=3, calories_kcal=170, fiber_g=2, min_increment=15,
                    notes=None, is_custom=0, created_at=now, updated_at=now,
                ),
                dict(
                    id="banana_1_medium", name="Banana", category="fruit",
                    unit="medium", reference_weight_g=100, protein_g=1.3, carbs_g=27,
                    fat_g=0.3, calories_kcal=105, fiber_g=3, min_increment=0.5,
                    notes=None, is_custom=0, created_at=now, updated_at=now,
                ),
                dict(
                    id="custom_test_1", name="Test Custom Food", category="protein",
                    unit="g", reference_weight_g=100, protein_g=10, carbs_g=5,
                    fat_g=2, calories_kcal=80, fiber_g=1, min_increment=10,
                    notes="test notes", is_custom=1, created_at=now, updated_at=now,
                ),
            ],
        )
    return eng


@pytest.fixture
def repo(engine) -> SQLAlchemyCatalogueRepository:
    return SQLAlchemyCatalogueRepository(engine)


@pytest.fixture
def calculator() -> DefaultNutritionCalculator:
    return DefaultNutritionCalculator()


@pytest.fixture
def app(repo: SQLAlchemyCatalogueRepository, calculator: DefaultNutritionCalculator):
    app = create_app()
    app.state.repository = repo
    app.state.calculator = calculator
    return app


@pytest.fixture
def client(app, repo, calculator):
    with TestClient(app) as c:
        # Lifespan startup overwrites state with file-based DB repo — restore
        app.state.repository = repo
        app.state.calculator = calculator
        yield c
