"""Shared fixtures for the test suite."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from nvc.main import create_app
from nvc.repositories import JSONCatalogueRepository
from nvc.services import DefaultNutritionCalculator


@pytest.fixture
def catalogue_path() -> Path:
    return Path("nutrition-values.json").resolve()


@pytest.fixture
def repo(catalogue_path: Path) -> JSONCatalogueRepository:
    return JSONCatalogueRepository(catalogue_path)


@pytest.fixture
def calculator() -> DefaultNutritionCalculator:
    return DefaultNutritionCalculator()


@pytest.fixture
def app(repo: JSONCatalogueRepository, calculator: DefaultNutritionCalculator):
    app = create_app()
    app.state.repository = repo
    app.state.calculator = calculator
    return app


@pytest.fixture
def client(app):
    with TestClient(app) as c:
        yield c
